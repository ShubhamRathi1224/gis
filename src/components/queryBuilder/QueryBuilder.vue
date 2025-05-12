<template>
  <div class="space-y-4 p-4">
    <FromEditor v-model="query.from" />
    <SelectEditor v-model="query.select" />
    <JoinEditor v-model="query.joins" />
    <WhereClauseEditor v-model="query.where" />
    <!-- <JsonAndQueryPreview v-model="formattedQuery" /> -->
  </div>
</template>

<script setup>
// import { computed, reactive } from "vue";
import FromEditor from "./FromEditor.vue";
import SelectEditor from "./SelectEditor.vue";
import JoinEditor from "./JoinEditor.vue";
import WhereClauseEditor from "./WhereClauseEditor.vue";
// import { basicQueryStarter } from "../../utils/query";
// import JsonAndQueryPreview from "./JsonAndQueryPreview.vue";

// const query = reactive(basicQueryStarter);
// const formattedQuery = computed(() => JSON.stringify(query, null, 2));

const query = defineModel();
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
