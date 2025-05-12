<template>
  <div class="optional-date-range-editor">
    <label>Column</label>
    <input
      v-model="clause.column"
      type="text"
      placeholder="Enter column name"
    />

    <div class="date-range-inputs">
      <label>Min Date</label>
      <input
        v-model="clause.configPaths.min"
        type="text"
        placeholder="Enter min date path"
      />

      <label>Max Date</label>
      <input
        v-model="clause.configPaths.max"
        type="text"
        placeholder="Enter max date path"
      />
    </div>

    <label>Request Type ID</label>
    <input
      v-model="clause.requestTypeId"
      type="text"
      placeholder="Enter Request Type ID"
    />
  </div>
</template>

<script setup>
import { defineProps, defineEmits, watch, reactive } from "vue";

const props = defineProps({
  modelValue: Object,
});
const emit = defineEmits(["update:modelValue"]);

// Initialize clause with a default structure, if not present in props.modelValue
const clause = reactive({
  ...props.modelValue,
  column: props.modelValue?.column || "", // Ensure column is initialized
  requestTypeId: props.modelValue?.requestTypeId || "", // Ensure requestTypeId is initialized
  configPaths: {
    min: props.modelValue?.configPaths?.min || "", // Ensure configPaths is initialized
    max: props.modelValue?.configPaths?.max || "", // Ensure configPaths is initialized
  },
});

// Watch for changes and emit the updated value
watch(
  clause,
  (newClause) => {
    console.log("newClause: ", newClause);
    emit("update:modelValue", newClause);
  },
  { deep: true }
);
</script>

<style scoped>
.optional-date-range-editor {
  margin-bottom: 1rem;
}

.date-range-inputs {
  display: flex;
  gap: 1rem;
}

input {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  width: 100%;
  border-radius: 4px;
  border: 1px solid #ccc;
}

label {
  font-weight: bold;
}
</style>
