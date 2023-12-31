const { google } = require('googleapis');

// 環境変数からGoogleの認証情報を取得
const googleCredentials = {
    type: process.env.GOOGLE_TYPE,
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),  // 正しい改行に変換
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL
};

const sheets = google.sheets({ version: 'v4' });
console.log('GOOGLE_PRIVATE_KEY exists:', Boolean(process.env.GOOGLE_PRIVATE_KEY));
/**
 * Google Sheetsにデータをエクスポートする関数
 * @param {Array} data - エクスポートするデータ。2次元配列を期待。
 * @param {string} spreadsheetId - ターゲットとなるGoogle SheetsのID
 * @param {string} range - エクスポート先の範囲 (例: 'Sheet1!A1')
 */
async function exportToSheet(data, spreadsheetId, range) {
    // JWTクライアントの作成
    const authClient = new google.auth.JWT(
        googleCredentials.client_email,
        null,
        googleCredentials.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
    );

    // トークンを取得
    await authClient.authorize();

    // Google Sheets APIを使用してデータを追加
    const response = await sheets.spreadsheets.values.append({
        auth: authClient,
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values: data
        }
    });

    return response.data;
}

exports.handler = async (event, context) => {
    const requestBody = JSON.parse(event.body);
    const spreadMessages = requestBody.spreadMessages;
    const kinds = requestBody.kinds;
    // メッセージを1つの文字列に連結します
    const concatenatedMessages = spreadMessages.map(msg => `[${msg.sender}] ${msg.content}`).join('\n');

    const currentTime = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

    // A列には現在の時間、B列には連結したメッセージをセットします
    const data = [[currentTime, concatenatedMessages]];
    const spreadsheetId = '1PNZt48JtYPQKd56nxrW1ACG_Xhni9yE2nQwN93kgxlM';
    const range = kinds;

    try {
        const response = await exportToSheet(data, spreadsheetId, range);
        return {
            statusCode: 200,
            body: JSON.stringify(response)
        };
    } catch (error) {
        console.error("Error exporting to sheet:", error);
        return {
            statusCode: 500,
            body: "Failed to export data to sheet."
        };
    }
};