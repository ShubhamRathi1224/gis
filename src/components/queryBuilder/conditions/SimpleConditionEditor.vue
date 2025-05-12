<template>
  <div class="simple-condition-editor">
    <label>Column</label>
    <input
      v-model="condition.column"
      type="text"
      placeholder="Enter column name"
    />

    <label>Operator</label>
    <select v-model="condition.operator">
      <option value="=">=</option>
      <option value="!=">!=</option>
      <option value=">">></option>
      <option value="<"><</option>
      <option value=">=">>=</option>
      <option value="<="><=</option>
    </select>

    <label>Value</label>
    <input v-model="condition.value" type="text" placeholder="Enter value" />

    <div v-if="condition.error" class="error-message">
      <span>{{ condition.error }}</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from "vue";

const props = defineProps({
  modelValue: Object,
});
const emit = defineEmits(["update:modelValue"]);

const condition = ref({ ...props.modelValue, error: null });

watch(
  condition,
  (newCondition) => {
    validateCondition(newCondition);
    emit("update:modelValue", newCondition);
  },
  { deep: true }
);

function validateCondition(newCondition) {
  // Simple validation to ensure all fields are populated
  if (!newCondition.column || !newCondition.operator || !newCondition.value) {
    condition.value.error = "All fields are required.";
  } else {
    condition.value.error = null;
  }
}
</script>

<style scoped>
.simple-condition-editor {
  margin-bottom: 1rem;
}

input,
select {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  width: 100%;
  border-radius: 4px;
  border: 1px solid #ccc;
}

label {
  font-weight: bold;
}

.error-message {
  color: red;
  font-size: 0.875rem;
}
</style>
