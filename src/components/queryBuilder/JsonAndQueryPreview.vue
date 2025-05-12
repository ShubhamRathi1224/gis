<template>
  <div class="rounded-xl border p-4 shadow">
    <h3 class="text-lg font-semibold">Generated JSON</h3>
    <pre class="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-64">
        {{ props.modelValue }}
      </pre
    >
  </div>

  <!-- <div class="rounded-xl border p-4 shadow">
    <h3 class="text-lg font-semibold">Generated SQL query</h3>
    <pre class="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-64">
        {{ generateSQL1(params1) }}
      </pre>
  </div> -->
  <!-- {{ generateSQL(props.modelValue) }} -->
  <!-- {{ generateSQL(params1) }} -->
</template>

<script setup>
import { computed } from "vue";
import { generateSQL, generateSQL1, params1 } from "../../utils/query";

const props = defineProps({
  modelValue: Object,
});

const formattedJson = computed(() => JSON.stringify(props.modelValue, null, 2));
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
