exports.handler = async function (event, context) {
    // チャット履歴をリセットする
    chatHistory.length = 0;
    return {
        statusCode: 200,
        body: JSON.stringify({ 'message': 'Chat history has been reset.' })
    };
};
