const axios = require('axios');

exports.handler = async function (event, context) {
    console.log("Received chat request");

    try {
        const assistantId = process.env.ASSISTANT_ID;
        const assistant = new AssistantV2({
            version: '2022-02-10',
            authenticator: new IamAuthenticator({
                apikey: process.env.ASSISTANT_IAM_APIKEY,
            }),
            serviceUrl: process.env.ASSISTANT_URL,
        });

        console.log("Assistant created"); // 追加

        const sessionId = await getOrCreateSessionId(assistantId, assistant);

        console.log("Session id:", sessionId); // 追加

        const assistantMessage = await getAssistantMessage(assistantId, assistant, sessionId, event.body.message);

        console.log("Assistant message:", assistantMessage); // 追加

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
