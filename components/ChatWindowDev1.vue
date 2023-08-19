<template>
    <div class="devChat">
        <div class="setting">
            <div class="devSection">
                <h1>①プロンプト設定（インタビューUIの性格）</h1>
                
                <p>▼AIの口調を指定したい場合に入力してください</p>
                <input v-model="tone" type="text" placeholder="例）銀座スナックのママ">
            </div>

            <div class="devSection">
                <h1>②プロンプト設定（ユーザー情報）</h1>
            
                <p>▼氏名（必須）</p>
                <input v-model="name" type="text" placeholder="例）田中 一郎">

                <p>▼役職（必須）</p>
                <input v-model="position" type="text" placeholder="例）代表取締役社長">

                <p>▼所属企業名（必須）</p>
                <input v-model="company" type="text" placeholder="例）株式会社タナカ">

                <p>▼事業内容（必須）</p>
                <input v-model="businessContent" type="text" placeholder="例）中古車の買取・販売事業">

                <p>▼補助金の利用用途（必須）</p>
                <textarea v-model="subsidyUsage" type="text" placeholder="例）・LPページの制作
　　・オンライン査定システムの導入" class="usage"></textarea>
            </div>

            <div class="buttonContainer">
                <button @click="exportToSheet" class="spreadButton">チャット履歴を保存</button>
                <button @click="resetChat" class="resetButton" :disabled="isLoading">CHAT RESET</button>
                <button @click="startChat" 
                    :disabled="isStartDisabled" 
                    :class="[buttonClass, { 'disabled': isStartDisabled }]">START</button>
            </div>
            
            
        </div>

        <div class="chatContainer">
            <div class="chatView">
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
                <textarea v-model="newMessage" @keyup.shift.enter="sendMessage" placeholder="Write to text..."></textarea>
                <button @click="sendMessage"><img src="~/assets/images/submitButton.png" /></button>
            </div>
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
            subsidyUsage: '', // 補助金の利用用途
            isLoading: false, // ローディング中かどうかを示すフラグ
            loadingDots: '',  // ローディング中の点の数
            buttonClass: 'default',
        };
    },
    methods: {
        async sendMessage() {
            this.newMessage = this.newMessage.replace(/^\s*\n+|\n+\s*$/g, '');

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
                this.stopLoadingAnimation();//ローディングを停止
            }
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
                                [補助金の利用用途]${this.subsidyUsage}
                                
                                #ロールプレイの目的
                                私は小規模事業者持続化補助金の申請を予定しており、申請書に記載する自社の経営課題を見つけたいです。経営課題と補助金の利用用途は合理的である必要があります。また、経営課題は定量的な根拠やエピソードを含む具体的な内容が必要です。さらに、経営課題の解決が補助金の利用用途と一致しており、実現によって得られる効果についても含む必要があります。
                                
                                #ロールプレイの概要
                                私が自社の経営課題を見つけられるように、さまざまな質問をしたり、より詳しい質問をして、できるだけ多様な情報を引き出してください。ただし、質問は簡潔に、一度にひとつだけの質問をしてください。また、最初の質問は補助金の利用用途の背景にある課題を問うてください。 自社の経営課題を導くのに十分な情報が集まったと判断をしたら、申請書に記載する日本語で300文字程度の文章にまとめてください。ただし、まとめる前に私へ同意を求めてください。 ロールプレイが終了したら、まとめた自社の経営課題を==== start ====と==== end ====で括って提示してください。`;

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
            } catch (error) {
                console.error('APIエラー:', error);
                        
                this.stopLoadingAnimation(); //ローディング終了
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
        },
        async exportToSheet() {
            try {
                const response = await this.$axios.$post('/exportToSheet', {
                    spreadMessages: this.spreadMessages,
                    kinds:"01_経営課題のヒアリング機能",
                });
                if (response === 'Exported Successfully') {
                    // 成功した場合の処理をここに書く
                }
            } catch (error) {
                console.error('Error exporting to Google Sheets:', error);
            }
        }
    },
    computed: {
        // 必須入力欄が全て入力されているか確認するcomputedプロパティ
        isStartDisabled() {
            // 必須入力欄が一つでも空の場合、trueを返す（ボタンを無効化）
            return this.isStarted || !this.name || !this.position || !this.company || !this.businessContent || !this.subsidyUsage;
        },
    },

};
</script>

</script>

<style scoped>

</style>