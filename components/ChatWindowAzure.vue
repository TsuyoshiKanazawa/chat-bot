<template>
    <div id="chat">
        <button class="closeChat" @click="close"></button>
        <div id="chat-history" ref="chatHistory">
            <div v-for="(message, index) in messages" :key="index" :class="message.role" v-if="index !== 0">
                <div v-if="message.role === 'assistant'">
                    <img :src="require(`~/assets/images/${aiKind}.png`)" alt="Bot Image" />
                    <div class="message-content">{{ message.content }}</div>
                </div>
                <div v-else>
                    <div class="message-content">{{ message.content }}</div>
                </div>
            </div>
            <div v-if="isLoading" class="loading">
                <img :src="require(`~/assets/images/${aiKind}.png`)" alt="Bot Image" />
                <div class="spinner"></div>
            </div>
        </div>
        <div id="input-area">
            <textarea placeholder="shift+enterで送信" ref="myTextarea" v-model="input" @keydown="handleKeydown"></textarea>
            <button @click="submit">
                <img src="~/assets/images/submitButton.png" />
            </button>
        </div>
    </div>
</template>

<script>
export default {
    props: ['aiKind', 'name', 'job', 'business', 'company'],

    data() {
        return {
            input: '',
            messages: [],
            initialMessage: '',
            aiKindName: '',
            isLoading: false,
        };
    },
    watch: {
        aiKind(newVal) {
            this.setInitialMessage();
        },
        name(newVal) {
            this.setInitialMessage();
        },
        job(newVal) {
            this.setInitialMessage();
        },
        business(newVal) {
            this.setInitialMessage();
        },
        company(newVal) {
            this.setInitialMessage();
        }
    },
    async mounted() {
        this.setInitialMessage();
        await this.sendMessageToAI(this.initialMessage);
    },

    methods: {
        handleKeydown(event) {
            if (event.shiftKey && event.keyCode === 13) {
                // Shift + Enterが押されたとき
                this.submit();
                event.preventDefault();  // デフォルトの動作をキャンセル
            } else if (event.keyCode === 13) {
                // Enterのみが押されたとき
                event.preventDefault();  // デフォルトの動作をキャンセル
                this.input += '\n';  // 改行を追加
            }
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const chatContainer = this.$refs.chatHistory;
                chatContainer.scrollTop = chatContainer.scrollHeight;
            });
        },
        async close() {
            try { //閉じるボタンを押したとき
                this.messages = [];
                this.$emit('closeComponent');
            } catch (error) {
                console.error(error);
            }
        },
        setInitialMessage() {
            switch (this.aiKind) {
                case 'mama':
                    this.aiKindName = '銀座のスナックのママ';
                    break;
                case 'gal':
                    this.aiKindName = '女子高生のギャル';
                    break;
                case 'cat':
                    this.aiKindName = '語尾に「にゃん」';
                    break;
                default:
                    this.aiKindName = '';
            }
            this.initialMessage = `これから以下の条件に沿って、ロールプレイをします。\n
                                    指示について理解ができたら、いきなり私への挨拶と最初の質問から開始してください。\n
                                    \n
                                    #あなたのロール\n
                                    [名前]なるみ\n
                                    [職業]経営コンサルタント\n
                                    [口調]${this.aiKindName}\n
                                    \n
                                    #私のロール\n
                                    [名前]${this.name}\n
                                    [職業]${this.job}\n
                                    [経営事業]${this.business}\n
                                    [事業所名]${this.company}\n
                                    \n
                                    #ロールプレイの目的\n
                                    私はものづくり補助金の申請を予定しており、申請書に記載する自社の経営課題を見つけたいです。\n
                                    経営課題は定量的な根拠やエピソードを含む具体的な内容が必要です。\n
                                    また、課題の解決によって得られる効果についても含む必要があります。\n
                                    \n
                                    #ロールプレイの概要\n
                                    私が自社の経営課題を見つけられるように、さまざまな質問をしたり、\n
                                    より詳しい質問をして、できるだけ多様な情報を引き出してください。\n
                                    ただし、質問は簡潔に、一度にひとつだけの質問をしてください。\n
                                    自社の経営課題を導くのに十分な情報が集まったと判断をしたら、\n
                                    申請書に記載する150〜200文字の文章にまとめてください。\n
                                    ただし、まとめる前に私へ同意を求めてください。\n
                                    ロールプレイが終了したら、まとめた自社独自の経営課題を提示してください。`;
        },
        async submit() {
            const message = this.input;

            if (message.trim() !== '') {
                this.messages.push({ content: message, role: 'user' });
                this.input = '';

                try {
                    this.isLoading = true; //ローディングのための状態管理
                    const response = await fetch("/.netlify/functions/chat__", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ messages: this.messages })
                    });

                    const result = await response.json();
                    console.log("API Response:", result);  // APIレスポンスをコンソールに表示
                    console.log("履歴:", message); //履歴表示


                    if (result.choices && result.choices.length > 0) {
                        this.messages.push({
                            content: result.choices[0].message.content,
                            role: 'assistant'
                        });
                    }
                } catch (error) {
                    console.error('Error in submit:', error);
                } finally {
                    this.isLoading = false; //ローディングのための状態管理
                }
            }
            this.scrollToBottom();
        },
        async sendMessageToAI(message) {
            try {
                this.isLoading = true; //ローディングのための状態管理

                // 新しいメッセージをチャット履歴に直接追加
                this.messages.push({ content: message, role: 'user' });

                const response = await fetch("/.netlify/functions/chat__", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ messages: this.messages }) // 現在のthis.messagesをapi/chat__.jsへ送信
                });

                const result = await response.json(); //APIレスポンスを格納
                console.log("API Response:", result); //APIレスポンスを表示
                console.log("履歴:", message); //履歴表示

                //APIレスポンスをチャット履歴へ追加
                if (result.choices && result.choices.length > 0) {
                    this.messages.push({
                        content: result.choices[0].message.content,
                        role: 'assistant'
                    });
                }
            } catch (error) {
                console.error('Error in sendMessageToAI:', error);
            } finally {
                this.isLoading = false; //ローディングのための状態管理
            }
            this.scrollToBottom();
        },

    },

    beforeDestroy() {
        this.messages = [];
    },
};

</script>

<style scoped>
.message-content {
    white-space: pre-line;
    /* 改行と空白を保持する */
}
</style>