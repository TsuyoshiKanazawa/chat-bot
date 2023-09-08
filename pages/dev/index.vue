<template>
    <div>
        <HeaderDev />

        <div class="function">
            <h1>機能選択</h1>
            <div class="pulldown">
                <div class="business">
                    <p>対象事業</p>
                    <select v-model="selectedBusiness" name="対象事業">
                        <option value="小規模事業者持続化補助金">小規模事業者持続化補助金</option>
                        <option value="IT導入補助金">IT導入補助金</option>
                    </select>
                </div>
                <div class="development">
                    <p>開発機能</p>
                    <select v-model="selectedDevFunction" name="開発機能">
                        <option
                        v-for="devFunction in availableDevFunctions"
                        :key="devFunction.value"
                        :value="devFunction.value"
                        >
                        {{ devFunction.label }}
                        </option>
                    </select>
                    <button @click="loadSelectedDevFunction">ROAD</button>
                </div>
            </div>
        </div>

        <!-- 条件に基づいて表示するコンポーネントを変更 -->
        <ChatWindowDev1 v-if="activeComponent === '01'" />
        <ChatWindowDev2-1 v-if="activeComponent === '02'" />
        <ChatWindowDev2-2 v-if="activeComponent === '03'" />
        <ChatWindowDev3 v-if="activeComponent === '04'" />
        <ChatWindowDev4 v-if="activeComponent === '05'" />

    </div>
</template>

<script>
export default {
    data() {
        return {
            selectedDevFunction: "01",
            activeComponent: "01",
            selectedBusiness: "小規模事業者持続化補助金",
            businessToFunctions: {
                "小規模事業者持続化補助金": [
                    { label: "01_経営課題のヒアリング機能", value: "01" },
                    { label: "02_自社の強み・独自性のヒアリング機能", value: "02" },
                    { label: "02_自社の強み・独自性のヒアリング機能ver2", value: "03" },
                    { label: "03_事業タイトル(30文字以内)要約機能", value: "04" },
                ],
                "IT導入補助金": [
                    { label: "01_ITツール導入による解決課題ヒアリング機能", value: "05" },
                ],
            },
        };
    },
    mounted() {
        const params = new URLSearchParams(window.location.search);
        this.selectedBusiness = params.get('selectedBusiness') || this.selectedBusiness;
        this.selectedDevFunction = params.get('selectedDevFunction') || this.selectedDevFunction;
        this.activeComponent = params.get('activeComponent') || this.activeComponent;
        
        // URLのハッシュを読み取る
        const hash = window.location.hash.replace('#', '');

        // ハッシュに対応するコンポーネントを設定
        switch (hash) {
            case 'Chat1':
                this.activeComponent = '01';
                this.selectedDevFunction = '01';
                this.selectedBusiness = '小規模事業者持続化補助金';
                break;
            case 'Chat2-1':
                this.activeComponent = '02';
                this.selectedDevFunction = '02';
                this.selectedBusiness = '小規模事業者持続化補助金';
                break;
            case 'Chat2-2':
                this.activeComponent = '03';
                this.selectedDevFunction = '03';
                this.selectedBusiness = '小規模事業者持続化補助金';
                break;
            case 'Chat3':
                this.activeComponent = '04';
                this.selectedDevFunction = '04';
                this.selectedBusiness = '小規模事業者持続化補助金';
                break;
            case 'Chat4':
                this.activeComponent = '05';
                this.selectedDevFunction = '05';
                this.selectedBusiness = 'IT導入補助金';
                break;
            default:
                // デフォルトの設定（必要であれば）
                break;
        }
    },
    computed: {
        availableDevFunctions() {
            return this.businessToFunctions[this.selectedBusiness] || [];
        },
    },
    methods: {
        loadSelectedDevFunction() {
            this.activeComponent = this.selectedDevFunction;

            const query = new URLSearchParams({
                selectedDevFunction: this.selectedDevFunction,
                activeComponent: this.activeComponent,
            });
            window.history.pushState({}, null, '?' + query.toString());
        },
    },
};
</script>

