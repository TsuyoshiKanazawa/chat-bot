const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

exports.handler = async function (event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { messages } = JSON.parse(event.body);

    const endpoint = "https://scalar-test.openai.azure.com/";
    const azureApiKey = `${process.env.AZURE_OPENAI_API_KEY}`; // 本番環境では環境変数などに隠蔽することをおすすめします。

    const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
    const deploymentId = "Scalar";

    try {
        const result = await client.getChatCompletions(deploymentId, messages);

        // ログにendpointとdeploymentIdを出力
        console.log("Endpoint:", endpoint);
        console.log("Deployment ID:", deploymentId);

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
            body: JSON.stringify({ error: err.message, stack: err.stack })
        };
    }
};
