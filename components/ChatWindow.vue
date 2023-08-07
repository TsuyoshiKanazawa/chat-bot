<template>
    <div id="chat">
        <button class="closeChat" @click="close"></button>
        <div id="chat-history">
            <div v-for="(message, index) in messages" :key="index" :class="message.sender">
                <div v-if="message.sender === 'bot'">
                    <img :src="require(`~/assets/images/${aiKind}.png`)" alt="Bot Image" />
                    {{ message.content }}
                </div>
                <div v-else>
                    {{ message.content }}
                </div>
            </div>
            <div v-if="isLoading" class="loading">
                Loading...
            </div>
        </div>
        <div id="input-area">
            <textarea ref="myTextarea" v-model="input" ></textarea>
            <button @click="submit">
                <img src="~/assets/images/submitButton.png"/>
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
    mounted() {
        this.setInitialMessage();
        this.initializeChat();
    },
    methods: {
        async close() {
            try {
                this.messages = [];
                this.$emit('closeComponent');
            } catch (error) {
                console.error(error);
            }
        },
        setInitialMessage() {
            switch (this.aiKind) {
                case 'mama':
                    this.aiKindName = '銀座スナックのママ';
                    break;
                case 'gal':
                    this.aiKindName = '女子高生のギャル';
                    break;
                case 'cat':
                    this.aiKindName = 'IQの高いねこ';
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
                this.messages.push({ content: message, sender: 'user' });
                this.input = '';

                try {
                    this.isLoading = true;
                    const res = await this.$axios.$post('/chat', { message });
                    this.messages.push({ content: res.message, sender: 'bot' });
                } catch (error) {
                    console.error('Error in submit:', error);
                } finally {
                    this.isLoading = false;
                }
            }
        },

        
        async initializeChat() {
            try {
                this.isLoading = true;
                const res = await this.$axios.$post('/chat', { message: this.initialMessage });
                this.messages.push({ content: res.message, sender: 'bot' });
            } catch (error) {
                console.error('Error in initializeChat:', error);
            } finally {
                this.isLoading = false;
            }
        },


    },
    beforeDestroy() {
        this.messages = [];
    },
};

</script>

