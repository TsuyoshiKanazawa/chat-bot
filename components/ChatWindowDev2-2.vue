<template>
    <div class="devChat">
        <div class="setting">
            <div class="devSection">
                <h1 style="color: orange;">①プロンプト設定（インタビューUIの性格）</h1>

                <p>▼AIの口調を指定したい場合に入力してください</p>
                <input v-model="tone" type="text" placeholder="例）銀座スナックのママ">
            </div>

            <div class="devSection">
                <h1 style="color: orange;">②プロンプト設定（ユーザー情報）</h1>

                <p>▼氏名（必須）</p>
                <input v-model="name" type="text" placeholder="例）田中 一郎">

                <p>▼役職（必須）</p>
                <input v-model="position" type="text" placeholder="例）代表取締役社長">

                <p>▼所属企業名（必須）</p>
                <input v-model="company" type="text" placeholder="例）株式会社タナカ">

                <p>▼事業内容（必須）</p>
                <input v-model="businessContent" type="text" placeholder="例）中古車の買取・販売事業">

            </div>

            <div class="buttonContainer">
                <button @click="exportToSheet" class="spreadButton">チャット履歴を保存</button>
                <button @click="resetChat" class="resetButton" :disabled="isLoading">CHAT RESET</button>
                <button @click="startChat" :disabled="isStartDisabled"
                    :class="[buttonClass, { 'disabled': isStartDisabled }]">START</button>
            </div>


        </div>

        <div class="chatContainer">
            <div class="chatView" ref="chatView">
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
            tone: '', // AIの口調
            name: '', // 氏名
            position: '', // 役職
            company: '', // 所属企業名
            businessContent: '', // 事業内容
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
                                [経営事業]${this.businessContent}
                                
                                #ロールプレイの目的
                                私は小規模事業者持続化補助金の申請を予定しており、申請書に記載する自社の強み・独自性を見つけたいです。自社の強み・独自性は、市場環境や競合他社と自社を比較した際に、市場優位性や競争優位性が示されている内容です。また、自社の強み・独自性は定量的な根拠やエピソードを含む具体的な内容が必要です。
                                
                                #ロールプレイの概要
                                私が自社の強み・独自性を見つけられるように、さまざまな質問をしたり、より詳しい質問をして、できるだけ多様な情報を引き出してください。ただし、質問は簡潔に、一度にひとつだけの質問をしてください。自社の強み・独自性を示すうえで必須になる情報として、 #必須情報 に記載のある項目については必ずヒアリングしてください。自社の強み・独自性を導くのに十分な情報が集まったと判断をしたら、申請書に記載する要約文章を、日本語300文字以上でまとめてください。また、まとめる文章の書きだしは「弊社では、」としてください。ただし、まとめる前に私へ同意を求めてください。 ロールプレイが終了したら、まとめた自社の強み・独自性を==== start ====と==== end ====で括って提示してください。
                                
                                #必須情報
                                ・経営事業に関連する市場状況と顧客ニーズ
                                ・直接的に市場シェアを競い合っている競合他社の強みや弱み
                                ・既存顧客の獲得に繋がっている主な理由`;


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
            return this.isStarted || !this.name || !this.position || !this.company || !this.businessContent;
        },
    },

};
</script>

</script>

<style scoped></style>