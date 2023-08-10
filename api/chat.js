const axios = require('axios');

// チャット履歴を保持するための配列
let chatHistory = [];

exports.handler = async function (event, context) {
    console.log("Received chat request");

    const userInput = JSON.parse(event.body).message;

    const azureOpenai = axios.create({
        baseURL: 'https://scalar-test.openai.azure.com/',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'OpenAI-API-Version': '2023-03-15-preview'
        },
    });

    const userMessage = {
        role: "user",
        content: userInput
    };

    // チャット履歴を更新する
    chatHistory.push(userMessage);

    console.log("User message:", userMessage);

    const messages = [...chatHistory];

    try {
        const response = await azureOpenai.post('/v1/engines/Scalar/completions', {
            messages: messages,
            temperature: 0.7,
            max_tokens: 800,
            top_p: 0.95,
            frequency_penalty: 0,
            presence_penalty: 0
        });
        const assistantMessage = response.data.choices[0].message.content;

        console.log("Assistant message:", assistantMessage);

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