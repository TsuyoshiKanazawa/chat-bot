<template>
  <div id="chat">
    <div id="chat-history">
      <div v-for="(message, index) in messages" :key="index" :class="message.sender">
        {{ message.content }}
      </div>
    </div>
    <div id="input-area">
      <input v-model="input" @keyup.enter="submit" placeholder="Type your message here...">
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
    
  },
};
</script>

<style>
#chat {
  display: flex;
  flex-direction: column;
  height: 80vh;
  width: 600px;
  margin: auto;
  border: 3px solid #007bff;
  border-radius: 10px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #f3f3f3;
}

#chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 1em;
}

#input-area {
  padding: 1em;
  border-top: 1px solid #ccc;
}

.user {
  align-self: flex-end;
  background-color: #007bff;
  color: white;
  width: 60%;
  margin: 0 0 0 auto;
  border-radius: 10px;
  margin-bottom: 1em;
  padding: 0.5em;
}

.bot {
  align-self: flex-start;
  background-color: #fff;
  width: 60%;
  border-radius: 10px;
  margin-bottom: 1em;
  padding: 0.5em;
}
</style>
