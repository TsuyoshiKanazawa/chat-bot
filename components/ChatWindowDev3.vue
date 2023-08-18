<template>
    <div class="devChat">
        <div class="setting">
            <div class="devSection">
                <h1>①プロンプト設定（インタビューUIの性格）</h1>
                
                <p>▼AIの口調を指定したい場合に入力してください</p>
                <input type="text" placeholder="例）銀座スナックのママ">
            </div>

            <div class="devSection">
                <h1>②プロンプト設定（ユーザー情報）</h1>
            
                <p>▼氏名（必須）</p>
                <input type="text" placeholder="例）田中 一郎">

                <p>▼役職（必須）</p>
                <input type="text" placeholder="例）代表取締役社長">

                <p>▼所属企業名（必須）</p>
                <input type="text" placeholder="例）株式会社タナカ">

                <p>▼事業内容（必須）</p>
                <input type="text" placeholder="例）中古車の買取・販売事業">

                <p>▼補助金の利用用途（必須）</p>
                <textarea type="text" placeholder="例）・LPページの制作
    　　・オンライン査定システムの導入" class="usage"></textarea>
            </div>

            <button>START</button>
        </div>

        <div class="chatView">
            <!-- チャットメッセージの表示部分 -->
            <div v-for="message in chatMessages" :key="message.id" :class="`message ${message.sender}`">
                <img v-if="message.sender === 'assistant'" src="~/assets/images/iconScalar.png" alt="AI Icon" class="ai-icon"> <!-- AIアイコンの追加 -->
                {{ message.content }}
            </div>

            <!-- チャット入力部分 -->
            <div class="chatInput">
                <textarea v-model="newMessage" placeholder="メッセージを入力してください"></textarea>
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
            newMessage: '', // 新しいメッセージの入力値を保持する
        };
    },
    methods: {
        async sendMessage() {
            if (!this.newMessage.trim()) return; // 空のメッセージは送信しない

            // ユーザーのメッセージを追加
            this.chatMessages.push({
                id: Date.now(),
                sender: 'user',
                content: this.newMessage,
            });

            // APIリクエストのデータ形式に変換
            const messages = this.chatMessages.map(m => ({
                role: m.sender,
                content: m.content,
            }));

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
                    id: Date.now() + 1, // 一意のIDとして時間+1を使用
                    sender: 'assistant',
                    content: result.choices[0].message.content,
                });

                this.newMessage = ''; // 入力をリセット
            } catch (error) {
                console.error('APIエラー:', error);
            }
        },
    },
};
</script>

</script>

<style scoped>


</style>