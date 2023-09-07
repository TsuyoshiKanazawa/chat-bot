<template>
    <div>
        <input class="toolSelect" type="text" ref="inputField" v-model="selectedTool" @input="filterTools" @focus="toggleDropdown(true)"
            placeholder="選択してください" />
        <div v-if="showDropdown && filteredTools.length > 0" class="dropdown" ref="dropdownMenu">
            <div v-for="tool in filteredTools" :key="tool" @click="selectTool(tool)" class="dropdown-item">
                {{ tool }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['tools'],

    data() {
        return {
            selectedTool: '',
            filteredTools: [],
            showDropdown: false
        };
    },
    mounted() {
        document.addEventListener('click', this.handleOutsideClick);
        this.filterTools();  // これを追加
    },
    beforeDestroy() {
        document.removeEventListener('click', this.handleOutsideClick);
    },
    methods: {
        filterTools() {
            if (this.selectedTool === '') {
                this.filteredTools = this.tools;  // これを追加
            } else {
                this.filteredTools = this.tools.filter((tool) =>
                    tool.toLowerCase().includes(this.selectedTool.toLowerCase())
                );
            }
        },
        selectTool(tool) {
            this.selectedTool = tool;
            this.showDropdown = false;
            this.$emit('update:selectedTool', this.selectedTool);
        },
        toggleDropdown(state) {
            this.showDropdown = state;
            this.filterTools();  // これを追加
        },
        handleOutsideClick(e) {
            if (
                this.$refs.inputField &&
                !this.$refs.inputField.contains(e.target) &&
                this.$refs.dropdownMenu &&
                !this.$refs.dropdownMenu.contains(e.target)
            ) {
                this.showDropdown = false;
            }
        },
    }
};
</script>
<style>
.toolSelect {
    border: 1px solid #5F6368 !important;
    border-radius: 9px;
    padding: 0 10px !important;
}

.dropdown {
    border: 1px solid #ccc;
    max-height: 150px;
    overflow-y: auto;
    font-size: 8px;
    margin-left: 15px;
    width: 613px;
}

.dropdown-item {
    padding: 5px;
    cursor: pointer;
}
</style>