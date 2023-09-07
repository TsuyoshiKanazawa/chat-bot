<template>
    <div class="devChat">
        <div class="setting">
            <div class="devSection">
                <h1>①プロンプト設定（インタビューUIの性格）</h1>
                
                <p>▼AIの口調を指定したい場合に入力してください</p>
                <input v-model="tone" type="text" placeholder="例）大阪弁の経営コンサルタント">
            </div>

            <div class="devSection">
                <h1>②プロンプト設定（ユーザー情報）</h1>
            
                <p>▼氏名（必須）</p>
                <input v-model="name" type="text" placeholder="例）田中 一郎">

                <p>▼役職（必須）</p>
                <input v-model="position" type="text" placeholder="例）代表取締役社長">

                <p>▼所属企業名（必須）</p>
                <input v-model="company" type="text" placeholder="例）タナカ建築株式会社">

                <p>▼事業業種（必須）</p>
                <select v-model="business" type="text">
                    <option value="農業・林業">農業・林業</option>
                    <option value="漁業">漁業</option>
                    <option value="鉱業，採石業，砂利採取業">鉱業，採石業，砂利採取業</option>
                    <option value="建設業">建設業</option>
                    <option value="製造業">製造業</option>
                    <option value="電気・ガス・熱供給・水道業">電気・ガス・熱供給・水道業</option>
                    <option value="情報通信業">情報通信業</option>
                    <option value="農業・林業">運輸業，郵便業</option>
                    <option value="卸売業，小売業">卸売業，小売業</option>
                    <option value="金融業，保険業">金融業，保険業</option>
                    <option value="不動産業，物品賃貸業">不動産業，物品賃貸業</option>
                    <option value="学術研究，専門・技術サービス業">学術研究，専門・技術サービス業</option>
                    <option value="宿泊業，飲食サービス業">宿泊業，飲食サービス業</option>
                    <option value="生活関連サービス業，娯楽業">生活関連サービス業，娯楽業</option>
                    <option value="教育，学習支援業">教育，学習支援業</option>
                    <option value="医療，福祉">医療，福祉</option>
                    <option value="複合サービス事業">複合サービス事業</option>
                    <option value="サービス業（他に分類されないもの）">サービス業（他に分類されないもの）</option>
                    <option value="公務（他に分類されるものを除く）">公務（他に分類されるものを除く）</option>
                    <option value="分類不能の産業">分類不能の産業</option>
                </select>

                <p>▼事業内容（必須）</p>
                <input v-model="businessContent" type="text" placeholder="例）XX県YY地区を中心に、公共工事の受託を中心に請け負っている土木建設事業者です。">

            </div>

            <div class="devSection">
                <h1>③プロンプト設定（導入予定ツール）</h1>
            
                <p class="toolsText">導入予定ツール</p>
                <selectTag :tools="tools" :selectedTool.sync="selectedTool"></selectTag>
            </div>

            <div class="buttonContainer">
                <button @click="resetChat" class="resetButton" :disabled="isLoading">CHAT RESET</button>
                <button @click="startChat" 
                    :disabled="isStartDisabled" 
                    :class="[buttonClass, { 'disabled': isStartDisabled }]">START</button>
            </div>
            
            
        </div>

        <div class="chatContainer">
            <div class="chatView" ref="chatView">
                <!-- チャットメッセージの表示部分 -->
                <div v-for="message in chatMessages" :key="message.id" :class="`message ${message.sender}`">
                    <img v-if="message.sender === 'assistant'" src="~/assets/images/iconScalar.png" alt="AI Icon" class="ai-icon">{{ message.content }}
                </div>
                <div v-if="isLoading" class="loading">
                    <img src="~/assets/images/iconScalar.png" alt="AI Icon" class="ai-icon">
                    <p>{{ loadingDots }}</p>
                </div>
                <!-- チャット入力部分 -->
            </div>
            <div class="chatInput">
                <textarea v-model="newMessage" 
                        @keyup.shift.enter="sendMessage"
                        placeholder="writing to text..." 
                        :disabled="isInputDisabled"
                        class="inputArea"
                        id="chatInput"></textarea>
                <button @click="sendMessage">
                <img src="~/assets/images/submitButton.png" />
                </button>
            </div>
        </div>

        <div v-if="showErrorModal" class="error-modal">
            <p>サーバーとの通信に失敗しました。</p>
            <p>もう一度送信してください。</p>
            <button @click="closeErrorModal">OK</button>
        </div>

    </div>

</template>

<script>
export default {

    data() {
        return {
            chatMessages: [], //チャットの履歴を保持するための配列
            spreadMessages: [], //スプレッドシートへ記載用の配列
            newMessage: '', //新しいメッセージの入力値を保持する
            isStarted: false, //チャットが開始されたかどうかを示すフラグ
            tone: '', //AIの口調
            name: '', //氏名
            position: '', //役職
            company: '', //所属企業名
            businessContent: '', //事業内容
            business: '', //事業種別
            isLoading: false, //ローディング中かどうかを示すフラグ
            loadingDots: '',  //ローディング中の点の数
            buttonClass: 'default',
            isInputDisabled: true,
            showErrorModal: false, //エラーモーダルの表示状態
            tools: [], //エクセルから取得したツールのリスト
            selectedTool: '',
            toolProcesses: {}, // ツールに対応する〇がついた列名
            processColumns: [], // 選択されたツールに対応する〇がついた列名
        };
    },
    async mounted() {
        this.isInputDisabled = true;

        try {
            // APIを呼び出してエクセルからツールのリストを取得
            const response = await fetch('/.netlify/functions/excelHandler');
            if (response.ok) {
                const data = await response.json();
                this.tools = data.tools;
                this.toolDetails = data.toolDetails;
                this.toolProcesses = data.toolProcesses;
            } else {
                console.error(`API returned status ${response.status}`);
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }

    },
    watch: {
        // selectedToolが変わったら、processColumnsも更新
        selectedTool(newVal, oldVal) {
            this.processColumns = this.toolProcesses[newVal] || [];
            this.processColumns = this.processColumns.map(column => {
                switch (column) {
                    case 'AC':
                        return '「顧客対応・販売支援」';
                    case 'AD':
                        return '「決済・債権債務・資金回収管理」';
                    case 'AE':
                        return '「供給・在庫・物流」';
                    case 'AF':
                        return '「会計・財務・経営」';
                    case 'AG':
                        return '「総務・人事・給与・労務・教育訓練・法務・情シス」';
                    case 'AH':
                        return '「業種固有プロセス」';
                    case 'AI':
                        return '「汎用・自動化・分析ツール」';
                    default:
                        return column;
                }
            });
            console.log(this.processColumns)
        },
    },
    methods: {
        scrollToBottom() {
            this.$nextTick(() => {
                const chatContainer = this.$refs.chatView;
                chatContainer.scrollTop = chatContainer.scrollHeight;
            });
        },
        async sendMessage() {
            this.newMessage = this.newMessage.replace(/^\s*\n+|\n+\s*$/g, '');
            this.scrollToBottom();
            if (!this.newMessage.trim()) return; // 空のメッセージは送信しない

            // ユーザーのメッセージを追加
            this.chatMessages.push({
                id: Date.now(),
                sender: 'user',
                content: this.newMessage,
            });
            // spreadシート用
            this.spreadMessages.push({
                id: Date.now(),
                sender: 'user',
                content: this.newMessage,
            });

            // APIリクエストのデータ形式に変換
            const messages = this.chatMessages.map(m => ({
                role: m.sender,
                content: m.content,
            }));

            // APIリクエスト前にローディングを開始
            this.startLoadingAnimation();

            try {
                this.newMessage = ''; // 入力をリセット
                // APIを呼び出し
                const response = await fetch('/.netlify/functions/chat__', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ messages }),
                });
                const result = await response.json();

                // APIのレスポンスをチャットの履歴に追加
                this.chatMessages.push({
                    id: Date.now() + 1, // 一意のIDとして時間+1を使用
                    sender: 'assistant',
                    content: result.choices[0].message.content,
                });
                // spreadシート用
                this.spreadMessages.push({
                    id: Date.now() + 1, // 一意のIDとして時間+1を使用
                    sender: 'assistant',
                    content: result.choices[0].message.content,
                });

                
                this.stopLoadingAnimation();//ローディングを終了
                
            } catch (error) {
                console.error('APIエラー:', error);
                this.spreadMessages = previousSpreadMessages;
                this.chatMessages = previousChatMessages; //エラーが発生した場合、chatMessagesを元の状態に戻す
                this.stopLoadingAnimation(); //ローディングを停止
                this.showErrorModal = true; // エラーモーダルを表示
            }
            this.scrollToBottom();
            this.checkForExportTrigger();
        },
        async startChat() {
            this.isStarted = true;  // チャットを開始したとマーク
            this.buttonClass = 'disabled';  // STARTボタンのクラスを変更
            const selectedToolDetail = this.toolDetails[this.selectedTool] || '詳細なし';


            let initialMessage = `これから以下の条件に沿って、ロールプレイをします。
指示について理解ができたら、いきなり私への挨拶と最初の質問から開始してください。

#あなたのロール
[名前]ScalarAI
[職業]経営コンサルタント
[口調]${this.tone}

#私のロール
[名前]${this.name}
[役職]${this.position}
[所属企業名]${this.company}
[事業業種]${this.business}
[事業内容]${this.businessContent}

#ロールプレイの目的
私はIT導入補助金の申請を予定しています。IT導入補助金を活用して導入するツールによって解決可能な自社の経営課題を整理して、申請書類に記載する要約文章を作成したいです。自社の経営課題は日本語で200文字以内に要約する必要があり、書き出しは「弊社の課題は、」である必要があります。

#ロールプレイの概要
私がIT導入補助金を活用して導入するツールによって解決可能な自社の経営課題を整理できるように、さまざまな質問をしたり、より詳しい質問をして、できるだけ多様な情報を引き出してください。ただし、質問は簡潔に、一度にひとつだけの質問をしてください。もし私の回答に理解できない単語や文脈があった場合、それについて理解できるまで詳細な説明を求めてください。IT導入補助金を活用して導入するツールによって解決可能な自社の経営課題を示すうえで必要な情報が十分に集まったと判断をしたら、私に要約文書を出力して良いか同意を求めてください。私が同意した場合、申請書に記載する要約文章を==== start ====と==== end ====で括って提示してください。要約文書が日本語で200文字以内に収まっていること確認して、超過している場合には日本語で200文字以内に収まるまで要約を繰り返してから出力してください。私が同意しなかった場合は、他に加えたい情報や気になっている部分がないか、質問を続けてください。

#IT導入補助金の説明
IT導入補助金は、中小企業・小規模事業者の労働生産性の向上を目的として、業務効率化やデジタル化等に向けたITツール（ソフトウェア、アプリ、サービス等）の導入を支援するための補助金です。

#IT導入補助金を活用して導入予定のツールの説明
[名称]${this.selectedTool}
[機能]${selectedToolDetail}
[改善対象となる事業プロセス]「${this.processColumns}」

#要約文章の参考例文
弊社の課題は、工事現場の従業員の作業工数の可視化ならび残業時間の削減です。公共工事は作業工程の記録が煩雑になりやすく、伴い管理業務の増加から残業時間が増加しています。スケジュール工程と記録データをITで一元的に管理できるツールの導入が現場から求められており、合わせて適正な労務管理を行うことでより働きやすい職場を目指したいと考えています。`;

            //履歴に追加
            this.chatMessages.push({
                id: Date.now(),
                sender: 'user',
                content: initialMessage,
            });

            // APIリクエストのデータ形式に変換
            const messages = this.chatMessages.map(m => ({
                role: m.sender,
                content: m.content,
            }));

            //ローディングを開始
            this.startLoadingAnimation();

            
            try {
                // APIを呼び出し
                const response = await fetch('/.netlify/functions/chat__', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ messages }),
                });
                const result = await response.json();

                // APIのレスポンスをチャットの履歴に追加
                this.chatMessages.push({
                    id: Date.now() + 1,
                    sender: 'assistant',
                    content: result.choices[0].message.content,
                });
                // spreadシート用
                this.spreadMessages.push({
                    id: Date.now() + 1, // 一意のIDとして時間+1を使用
                    sender: 'assistant',
                    content: result.choices[0].message.content,
                });
                //ローディングを終了
                this.stopLoadingAnimation();
                this.isInputDisabled = false;

            } catch (error) {
                console.error('APIエラー:', error);
                
                this.stopLoadingAnimation(); //ローディング終了
                this.showErrorModal = true; //エラーモーダルを表示
                this.isStarted = false;  
                this.buttonClass = 'default';  //STARTボタンのクラスを変更
                this.chatMessages = [];
            }
        },
        startLoadingAnimation() {
            this.isLoading = true;
            let count = 0;
            this.loadingInterval = setInterval(() => {
                count++;
                this.loadingDots += '・';
                if (count >= 4) {
                    this.loadingDots = '';
                    count = 0;
                }
            }, 500);
        },
        stopLoadingAnimation() {
            clearInterval(this.loadingInterval);
            this.loadingDots = '';
            this.isLoading = false;
        },
        resetChat() {
            // isLoadingがtrueの場合は関数を終了
            if (this.isLoading) {
                return;
            }
            this.chatMessages = [];
            this.isStarted = false;
            this.buttonClass = 'default';
            this.isInputDisabled = true;  // 入力欄を無効にする
        },
        async exportToSheet() {
            try {
                const response = await this.$axios.$post('/exportToSheet', {
                    spreadMessages: this.spreadMessages,
                    kinds:"04_ITツール導入による解決課題ヒアリング機能",
                });
                if (response === 'Exported Successfully') {
                    // 成功した場合の処理をここに書く
                }
            } catch (error) {
                console.error('Error exporting to Google Sheets:', error);
            }
        },
        checkForExportTrigger() {
            const messagesContent = this.spreadMessages.map(m => m.content);
            const concatenatedMessages = messagesContent.join(' ');

            if (concatenatedMessages.includes('==== start ====') && concatenatedMessages.includes('==== end ====')) {
                console.log("Triggering exportToSheet");
                this.exportToSheet();

                // chatInputをクリックできないようにする
                chatInput.disabled = true;

            } else {
                console.log("Not triggering exportToSheet");
            }
        },
        closeErrorModal() {
            this.showErrorModal = false;
        },

    },
    computed: {
        // 必須入力欄が全て入力されているか確認するcomputedプロパティ
        isStartDisabled() {
            // 必須入力欄が一つでも空の場合、trueを返す（ボタンを無効化）
            return this.isStarted || !this.name || !this.position || !this.company || !this.businessContent || !this.business;
        },
    },

};
</script>
