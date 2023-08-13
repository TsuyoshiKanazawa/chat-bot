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

      <div class="kinds_Container">
        <div class="AiKinds" @click="selectAiKind('mama')" :class="[getAiKindClass('mama')]">
          <div class="kind">
            <div class="grad">
              <img src="~/assets/images/mama_L.png" class="icon"/>
            </div>
          </div>

          <div class="kindName">
            <p>銀座スナックのママ</p>
            <img src="~/assets/images/gradation.jpg" class="gradation"/>
            <img src="~/assets/images/gradation_g.jpg" class="gradation_g"/>
          </div>
        </div>

        <div class="AiKinds" @click="selectAiKind('gal')" :class="[getAiKindClass('gal')]">
          <div class="kind">
            <div class="grad">
              <img src="~/assets/images/gal_L.png" class="icon"/>
            </div>
          </div>

          <div class="kindName">
            <p>女子高生のギャル</p>
            <img src="~/assets/images/gradation.jpg" class="gradation"/>
            <img src="~/assets/images/gradation_g.jpg" class="gradation_g"/>
          </div>
        </div>

        <div class="AiKinds" @click="selectAiKind('cat')" :class="[getAiKindClass('cat')]">
          <div class="kind">
            <div class="grad">
              <img src="~/assets/images/cat_L.png" class="icon"/>
            </div>
          </div>

          <div class="kindName">
            <p>IQの高いねこ</p>
            <img src="~/assets/images/gradation.jpg" class="gradation"/>
            <img src="~/assets/images/gradation_g.jpg" class="gradation_g"/>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="title">
        <img src="~/assets/images/number3.jpg">
        <h1>あなたの基本情報は？</h1>
      </div>

      <div class="space"></div>

      <div class="form">
        <label for="input">お名前</label>
        <input type="text" placeholder="例）田中 太郎" v-model="name">
      </div>
      <div class="form">
        <label for="input">職業</label>
        <input type="text" placeholder="例）経営者" v-model="job">
      </div>
      <div class="form">
        <label for="input">経営事業</label>
        <input type="text" placeholder="例）観光土産の販売" v-model="business">
      </div>
      <div class="form">
        <label for="input">事業所名</label>
        <input type="text" placeholder="例）株式会社タナカ" v-model="company">
      </div>
    </div>


    <button class="openChat" @click="openComponent">Let’s Start!!</button>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <component :is="selectedImageComponent" :ai-kind="selectedAiKind" :name="name" :job="job" :business="business" :company="company" @closeComponent="closeComponent" />
      </div>
    </div>

  </div>
  
</template>

<script>
import ChatWindow from '@/components/ChatWindowAzure.vue';

export default {
  data() {
    return {
      selectedImage: 'image1',
      selectedAiKind: 'mama',
      showModal: false,
      image1: '/path/to/image1.jpg',
      image2: '/path/to/image2.jpg',
      name: '',
      job: '',
      business: '',
      company: '',
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
    selectAiKind(kind) {
      this.selectedAiKind = kind;
    },
    openComponent() {
      this.showModal = true;
      this.initialMessage = ''; // 初期メッセージをリセット
      document.body.style.overflow = 'hidden';
    },
    closeComponent() {
      this.showModal = false;
      document.body.style.overflow = '';
    },
    getImageClass(image) {
      return {
        selected: this.selectedImage === image,
        notSelected: this.selectedImage !== image
      };
    },
    getAiKindClass(kind) {
      return {
        selected: this.selectedAiKind === kind,
        notSelected: this.selectedAiKind !== kind
      };
    }
  },
  components: {
    ChatWindow,
  }
};

</script>


