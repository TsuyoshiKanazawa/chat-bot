const express = require('express');
const serverless = require('serverless-http');
const axios = require('axios');
const app = express();
const router = express.Router();

// チャット履歴を保持するための配列
const chatHistory = [];

router.post('/api/chat', async (req, res) => {
    const userInput = req.body.message;

    const openai = axios.create({
        baseURL: 'https://api.openai.com/v1',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    const systemMessage = {
        role: "assistant",
        content: "You are a helpful assistant."
    };
    const userMessage = {
        role: "user",
        content: userInput
    };

    // チャット履歴を更新する
    chatHistory.push(userMessage);

    const messages = [...chatHistory];

    console.log('Request Messages:', messages); // リクエストごとのメッセージをコンソールに表示

    try {
        const response = await openai.post('/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: messages
        });
        const assistantMessage = response.data.choices[0].message.content;

        // ボットの応答をチャット履歴に追加
        const botMessage = {
            role: "assistant",
            content: assistantMessage
        };
        chatHistory.push(botMessage);

        console.log('Response Message:', assistantMessage); // レスポンスメッセージをコンソールに表示

        res.json({ 'message': assistantMessage });
    } catch (err) {
        console.error(err.response.data);
        res.status(500).send(err.toString());
    }
});

router.post('/api/reset', (req, res) => {
    // チャット履歴をリセットする
    chatHistory.length = 0;
    res.json({ 'message': 'Chat history has been reset.' });
});

app.use('/.netlify/functions/server', router);  // パス '/.netlify/functions/server' にルータを使用します。

module.exports.handler = serverless(app);