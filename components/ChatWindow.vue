<template>
    <div id="chat">
        <div id="chat-history">
            <div v-for="(message, index) in messages" :key="index" :class="message.sender">
                {{ message.content }}
            </div>
        </div>
        <div id="input-area">
            <textarea ref="myTextarea" @input="adjustTextareaHeight" v-model="input" @keyup.enter="submit"></textarea>
            <button @click="submit">
                <img src="~/assets/images/submitButton.png"/>
            </button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            input: '',
            messages: [],
        };
    },
    mounted() {
        this.adjustTextareaHeight();
    },
    methods: {
        async submit() {
            const message = this.input;
            this.messages.push({ content: message, sender: 'user' });
            this.input = '';

            try {
                const res = await this.$axios.$post('/api/chat', { message });
                this.messages.push({ content: res.message, sender: 'bot' });
            } catch (error) {
                console.error(error);
            }
        },

        adjustTextareaHeight() {
            this.$refs.myTextarea.style.height = 'auto';
            this.$refs.myTextarea.style.height = this.$refs.myTextarea.scrollHeight + 'px';
        }
    },
};
</script>

