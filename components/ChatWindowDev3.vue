<template>
    <div class="devChat">
        <div class="setting">
            <div class="devSection">
                <h1>①プロンプト設定（補助事業の内容）</h1>

                <p class="prompt03">今回、当社が主なターゲットとしている</p>
                <input v-model="target" type="text" placeholder="例）外国語の専門書を日本語訳したい出版社または個人">

                <p class="prompt03">に対して、より当社の商品・サービスの魅力を伝えていきたいと考えています。</p>
                <p class="prompt03">具体的な販路開拓の手段として、</p>
                <textarea v-model="means" type="text" placeholder="例）専門書等で使われる英語は日常会話や一般的なビジネス英語とは大きく異なり、TOEIC900点台でネイティブ並みに話せる日本人でも翻訳は難しいため、多くの方がGoogleの機械翻訳を利用することが既存顧客へのヒアリングで分かっています。そのため、Googleのリスティング広告を用いて「専門領域の言葉＋翻訳」など最適なキーワードを選定して広告を打とうと考えています。" class="usage03"></textarea>

                <p class="prompt03">以上の取り組みの経費の一部に対して、当補助金を活用したいと考えています。</p>
            </div>

            <div class="buttonContainer">
                <button @click="exportToSheet" class="spreadButton">チャット履歴を保存</button>
                <button @click="resetChat" class="resetButton" :disabled="isLoading">CHAT RESET</button>
                <button @click="startChat" :disabled="isStartDisabled"
                    :class="[buttonClass, { 'disabled': isStartDisabled }]">START</button>
            </div>


        </div>

        <div class="chatContainer">
            <div class="chatView">
                <!-- チャットメッセージの表示部分 -->
                <div v-for="message in chatMessages" :key="message.id" :class="`message ${message.sender}`">
                    <img v-if="message.sender === 'assistant'" src="~/assets/images/iconScalar.png" alt="AI Icon"
                        class="ai-icon">{{ message.content }}
                </div>
                <div v-if="isLoading" class="loading">
                    <img src="~/assets/images/iconScalar.png" alt="AI Icon" class="ai-icon">
                    <p>{{ loadingDots }}</p>
                </div>
                <!-- チャット入力部分 -->
            </div>
            <div class="chatInput">
                <textarea v-model="newMessage" @keyup.shift.enter="sendMessage" placeholder="writing to text..."
                    :disabled="isInputDisabled" class="inputArea" id="chatInput"></textarea>
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
            chatMessages: [], // チャットの履歴を保持するための配列
            spreadMessages: [], // スプレッドシートへ記載用の配列
            newMessage: '', // 新しいメッセージの入力値を保持する
            isStarted: false, // チャットが開始されたかどうかを示すフラグ
            target: '',
            means: '',
            isLoading: false, // ローディング中かどうかを示すフラグ
            loadingDots: '',  // ローディング中の点の数
            buttonClass: 'default',
            isInputDisabled: true,
            showErrorModal: false, // エラーモーダルの表示状態
        };
    },
    mounted() {
        // 初期状態でチャット入力を無効にする
        this.isInputDisabled = true;
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
            this.buttonClass = 'disabled';  // 追加: ボタンのクラスを変更

            let initialMessage = `これから以下の条件に沿って、タスクを実行してください。 

                                #あなたのロール
                                経営コンサルタント
                                
                                #タスクの目的
                                私は小規模事業者持続化補助金の申請を予定しており、申請書に記載する日本語で20文字以上30文字以内の事業タイトルを検討しています。
                                
                                #タスクの概要
                                以下に記載する #補助事業の内容を基に、日本語で20文字以上30文字以内の事業タイトルを、異なる視点や表現で3案考えてください。事業タイトルは、最後に「事業」と付く必要があります。また、事業タイトルは初めてみた人でもその概要がイメージしやすい、具体的でわかりやすいものである必要があります。
                                
                                #補助事業の内容 
                                今回、当社が主なターゲットとしている${this.target}に対して、より当社の商品・サービスの魅力を伝えていきたいと考えています。具体的な販路開拓の手段として、${this.means}以上の取り組みの経費の一部に対して、当補助金を活用したいと考えています。`;


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
                this.showErrorModal = true; // エラーモーダルを表示
                this.isStarted = false;
                this.buttonClass = 'default';  // STARTボタンのクラスを変更
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
                    kinds: "02_自社の強み・独自性のヒアリング機能",
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
            return this.isStarted || !this.target || !this.means;
        },
    },

};
</script>

</script>

<style scoped></style>