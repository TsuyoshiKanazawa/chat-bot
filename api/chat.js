const axios = require('axios');

exports.handler = async function (event, context) {
    console.log("Received chat request");
    const userInput = JSON.parse(event.body).message;
    const chatHistory = JSON.parse(event.body).chatHistory;  // クライアントから送られてきたチャット履歴を取得

    const openai = axios.create({
        baseURL: 'https://api.openai.com/v1',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    try {
        const response = await openai.post('/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: chatHistory  // 取得したチャット履歴をそのまま使用
        });
        const assistantMessage = response.data.choices[0].message.content;

        return {
            statusCode: 200,
            body: JSON.stringify({ 'message': assistantMessage })
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: err.toString()
        };
    }
};
