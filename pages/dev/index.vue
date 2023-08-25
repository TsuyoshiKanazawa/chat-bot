<template>
    <div>
        <HeaderDev />

        <div class="function">
            <h1>機能選択</h1>
            <div class="pulldown">
                <div class="business">
                    <p>対象事業</p>
                    <select name="対象事業">
                        <option value="小規模事業者持続化補助金">小規模事業者持続化補助金</option>
                    </select>
                </div>
                <div class="development">
                    <p>開発機能</p>
                    <select v-model="selectedDevFunction" name="開発機能">
                        <option value="01">01_経営課題のヒアリング機能</option>
                        <option value="02">02_自社の強み・独自性のヒアリング機能</option>
                        <option value="03">02_自社の強み・独自性のヒアリング機能ver2</option>
                        <option value="04">03_事業タイトル(30文字以内)要約機能</option>
                    </select>
                    <button @click="loadSelectedDevFunction">ROAD</button>
                </div>
            </div>
        </div>

        <!-- 条件に基づいて表示するコンポーネントを変更 -->
        <ChatWindowDev1 v-if="activeComponent === '01'" />
        <ChatWindowDev2-1 v-else-if="activeComponent === '02'" />
        <ChatWindowDev2-2 v-else-if="activeComponent === '03'" />
        <ChatWindowDev3 v-else-if="activeComponent === '04'" />
    </div>
</template>

<script>
export default {
    data() {
        return {
            selectedDevFunction: "01",
            activeComponent: "01",  // 初期状態でChatWindowDev1を表示するように変更
        };
    },
    methods: {
        loadSelectedDevFunction() {
            this.activeComponent = this.selectedDevFunction;
        },
    },
};
</script>


