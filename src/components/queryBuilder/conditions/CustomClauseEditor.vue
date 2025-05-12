<template>
  <div class="space-y-4 p-2 border rounded">
    <label>Type</label>
    <input v-model="clause.type" class="input" disabled />

    <label>Config Path</label>
    <input
      v-model="clause.configPath"
      class="input"
      placeholder="$.license.someKey"
    />

    <label>Request Type ID</label>
    <input v-model="clause.requestTypeId" class="input" placeholder="UUID" />

    <label>Column</label>
    <input v-model="clause.column" class="input" placeholder="Column name" />

    <SubqueryEditor v-model="clause.subquery" />
  </div>
</template>

<script setup>
import SubqueryEditor from "./SubqueryEditor.vue";

const props = defineProps({
  modelValue: Object,
});
const clause = props.modelValue;
</script>

<style scoped>
.input {
  display: block;
  width: 100%;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}
</style>
