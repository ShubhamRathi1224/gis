<template>
  <div class="space-y-2 p-2 border rounded">
    <label>Subquery Select Columns</label>
    <input
      v-for="(col, idx) in subquery.select"
      :key="idx"
      v-model="subquery.select[idx]"
      class="input"
      placeholder="Column name"
    />
    <button @click="subquery.select.push('')" class="btn-sm">
      + Add Column
    </button>

    <label>From Table</label>
    <input
      v-model="subquery.from.table"
      class="input"
      placeholder="Table name"
    />
    <input v-model="subquery.from.alias" class="input" placeholder="Alias" />

    <div v-if="subquery.openjson">
      <label>OpenJSON Column</label>
      <input
        v-model="subquery.openjson.column"
        class="input"
        placeholder="Column"
      />
      <label>OpenJSON Path</label>
      <input
        v-model="subquery.openjson.path"
        class="input"
        placeholder="Path"
      />
    </div>

    <label>Where Clauses</label>
    <WhereClauseEditor v-model="subquery.where" />
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import WhereClauseEditor from "../WhereClauseEditor.vue";

const props = defineProps({
  modelValue: Object,
});
const subquery = props.modelValue;
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
.btn-sm {
  padding: 0.25rem 0.5rem;
  background-color: #e5e7eb;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
}
.btn-sm:hover {
  background-color: #d1d5db;
}
</style>
