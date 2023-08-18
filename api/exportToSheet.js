const { google } = require('googleapis');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    const body = JSON.parse(event.body);
    const sheets = google.sheets('v4');

    const credentials = require('./chat-bot-b7fb1-3b9bdbeb3468.json');

    const auth = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
    );

    const spreadsheetId = '1PNZt48JtYPQKd56nxrW1ACG_Xhni9yE2nQwN93kgxlM';
    const range = 'Sheet1!A1';

    const rows = body.chatMessages.map(message => [message.sender, message.content]);

    try {
        await sheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: rows
            }
        });
        return {
            statusCode: 200,
            body: 'Exported Successfully'
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: 'Error exporting to Google Sheets'
        };
    }
};
