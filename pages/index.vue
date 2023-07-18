<template>

  <div>
    <Header />
    <div class="section">
      <div class="title">
        <img src="~/assets/images/number1.jpg">
        <h1>AIに相談したいことは？</h1>
      </div>

      <div class="consultImage">
        <div :class="[getImageClass('image1')]" @click="selectImage('image1')" >
          <img src="~/assets/images/management.png"/>
          <div class="g_container">
            <img src="~/assets/images/gradation.jpg" class="gradation"/>
            <p>自社の経営課題を見つけたい</p>
          </div>
        </div>
        
        <div :class="[getImageClass('image2')]" @click="selectImage('image2')" >
          <img src="~/assets/images/strength.png"/>
          <div class="g_container">
            <img src="~/assets/images/gradation.jpg" class="gradation"/>
            <p>自社の強みを見つけたい</p>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="title">
        <img src="~/assets/images/number2.jpg">
        <h1>どんなAIに相談したい？</h1>
      </div>
    </div>

    <div class="section">
      <div class="title">
        <img src="~/assets/images/number3.jpg">
        <h1>あなたの基本情報は？</h1>
      </div>
    </div>

    <button @click="openComponent">Open Component</button>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <component :is="selectedImageComponent" />
        <button @click="closeComponent">Close</button>
      </div>
    </div>

  </div>
  
</template>

<script>
import ChatWindow from '@/components/ChatWindow.vue';

export default {
  data() {
    return {
      selectedImage: 'image1',
      showModal: false,
      image1: '/path/to/image1.jpg',
      image2: '/path/to/image2.jpg'
    };
  },
  computed: {
    selectedImageComponent() {
      if (this.selectedImage === 'image1') {
        return ChatWindow;
      } else if (this.selectedImage === 'image2') {
        return ChatWindow;
      }
      return null;
    }
  },
  methods: {
    selectImage(image) {
      this.selectedImage = image;
    },
    openComponent() {
      this.showModal = true;
    },
    closeComponent() {
      this.showModal = false;
    },
    getImageClass(image) {
      return {
        selected: this.selectedImage === image,
        notSelected: this.selectedImage !== image
      };
    }
  },
  components: {
    ChatWindow,
  }
};

</script>


