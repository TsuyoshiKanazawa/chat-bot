const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

exports.handler = async function (event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { messages } = JSON.parse(event.body); //プロンプトを格納

    const endpoint = "https://scalar-test.openai.azure.com/";
    const azureApiKey = `${process.env.AZURE_OPENAI_API_KEY}`; 

    const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
    const deploymentId = "gpt-4";

    try {
        const result = await client.getChatCompletions(deploymentId, messages, MaxTokens = 100);

        // ログにendpointとdeploymentIdを出力
        console.log("Endpoint:", endpoint);
        console.log("Deployment ID:", deploymentId);
        console.log("チャット履歴:", messages);
        //console.log("APIレスポンス:", result.choices[0].message);

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (err) {
        console.error("Error in getChatCompletions:", err.message);
        console.error("Endpoint:", endpoint);
        console.error("Deployment ID:", deploymentId);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message || "Unknown error", stack: err.stack, receivedData: messages })
        };
    }
};
