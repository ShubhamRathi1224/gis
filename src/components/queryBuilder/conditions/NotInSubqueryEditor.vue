<template>
  <div class="not-in-subquery-editor">
    <label>Column</label>
    <input
      v-model="clause.column"
      type="text"
      placeholder="Enter column name"
    />

    <div class="subquery-editor">
      <h3>Subquery</h3>
      <div>
        <label>SELECT</label>
        <input
          v-model="clause.subquery.select"
          type="text"
          placeholder="Enter fields to SELECT"
        />
      </div>

      <div>
        <label>FROM</label>
        <input
          v-model="clause.subquery.from.table"
          type="text"
          placeholder="Enter table name"
        />
      </div>

      <div>
        <label>WHERE</label>
        <input
          v-model="clause.subquery.where"
          type="text"
          placeholder="Enter WHERE conditions"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, reactive, watch } from "vue";

// Define the prop and the emit function
const props = defineProps({
  modelValue: Object,
});
const emit = defineEmits(["update:modelValue"]);

// Initialize clause with a default structure, if not present in props.modelValue
const clause = reactive({
  ...props.modelValue,
  column: props.modelValue?.column || "", // Ensure column is initialized
  subquery: {
    select: props.modelValue?.subquery?.select || "", // Initialize select if not present
    from: {
      table: props.modelValue?.subquery?.from?.table || "", // Initialize from.table if not present
    },
    where: props.modelValue?.subquery?.where || "", // Initialize where if not present
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
.not-in-subquery-editor {
  margin-bottom: 1rem;
}

.subquery-editor {
  margin-top: 1rem;
  padding-left: 1rem;
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
