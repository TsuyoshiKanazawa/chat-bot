const axios = require('axios');

// チャット履歴を保持するための配列
let chatHistory = [];

exports.handler = async function (event, context) {
    console.log("Received chat request");

    const userInput = JSON.parse(event.body).message;

    const openai = axios.create({
        baseURL: 'https://scalar-test.openai.azure.com',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    const userMessage = {
        role: "user",
        content: userInput
    };

    // チャット履歴を更新する
    chatHistory.push(userMessage);

    console.log("User message:", userMessage); // 追加

    const messages = [...chatHistory];

    try {
        const response = await openai.post('/openai/deployments/Scalar/chat/completions?api-version=2023-03-15-preview', {
            model: "gpt-3.5-turbo-16k",
            messages: messages
        });
        const assistantMessage = response.data.choices[0].message.content;

        console.log("Assistant message:", assistantMessage); // 追加

        // ボットの応答をチャット履歴に追加
        const botMessage = {
            role: "assistant",
            content: assistantMessage
        };
        chatHistory.push(botMessage);

        return {
            statusCode: 200,
            body: JSON.stringify({ 'message': assistantMessage })
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: err.toString()
        };
    }
};
