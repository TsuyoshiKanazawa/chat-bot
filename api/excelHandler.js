const path = require('path');
const xlsx = require('xlsx');

exports.handler = async (event, context) => {
    try {
        const filePath = path.join(__dirname, 'docs', 'ITツールリスト_0719.xlsx');
        const workbook = xlsx.readFile(filePath);
        const sheet_name_list = workbook.SheetNames;
        const sheet = workbook.Sheets[sheet_name_list[0]];
        const tools = [];
        const toolDetails = {}; // L列のデータを保持するオブジェクト
        const toolProcesses = {}; // ツール名をキーとし、〇がついた列名を値として持つオブジェクト

        for (let i = 4; i <= 1591; i++) {
            const cellG = sheet[`G${i}`];
            const cellL = sheet[`L${i}`];
            let processColumns = []; // このツールに対する〇がついた列名

            if (cellG && cellG.v) {
                tools.push(cellG.v);

                if (cellL && cellL.v) {
                    toolDetails[cellG.v] = cellL.v; // G列の値をキーとしてL列のデータを保存
                }

                ['AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI'].forEach(column => {
                    const cell = sheet[`${column}${i}`];
                    if (cell && cell.v === '〇') {
                        processColumns.push(column);
                    }
                });

                toolProcesses[cellG.v] = processColumns; // G列の値（ツール名）をキーとして〇がついた列名を保存
                
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ tools, toolDetails, toolProcesses }) // tools, toolDetails, toolProcessesを返す
        };
    } catch (err) {
        console.error(err); // エラーの詳細をログ出力
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to read Excel file' })
        };
    }
};
