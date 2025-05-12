<template>
  <div class="space-y-4 p-4">
    <QueryBuilder v-model="query" />
    <JsonAndQueryPreview v-model="formattedQuery" />
  </div>
</template>

<script setup>
import { reactive, computed } from "vue";
import JsonAndQueryPreview from "./queryBuilder/JsonAndQueryPreview.vue";
import QueryBuilder from "./queryBuilder/QueryBuilder.vue";
import { basicQueryStarter } from "../utils/query";

const query = reactive(basicQueryStarter);

const formattedQuery = computed(() => JSON.stringify(query, null, 2));
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
