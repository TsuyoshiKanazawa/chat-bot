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
                await this.$axios.$post('/api/reset');
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
            this.initialMessage = `${this.aiKindName}n/${this.name}n/${this.job}n/${this.business}n/${this.company}`;
        },
        async submit() {
            const message = this.input;

            if (message.trim() !== '') {
                this.messages.push({ content: message, sender: 'user' });
                this.input = '';

                try {
                    const res = await this.$axios.$post('/api/chat', { message });
                    this.messages.push({ content: res.message, sender: 'bot' });
                } catch (error) {
                    console.error(error);
                }
            }
        },

        async initializeChat() {
            try {
                const res = await this.$axios.$post('/api/chat', { message: this.initialMessage });
                this.messages.push({ content: res.message, sender: 'bot' });
            } catch (error) {
                console.error(error);
            }
        },


    },
    beforeDestroy() {
        this.messages = [];
    },
};

</script>

