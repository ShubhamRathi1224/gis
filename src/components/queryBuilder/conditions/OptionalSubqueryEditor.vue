<template>
  <div class="optional-subquery-editor">
    <label>Config Path</label>
    <input
      v-model="clause.configPath"
      type="text"
      placeholder="Enter config path"
    />

    <label>Request Type ID</label>
    <input
      v-model="clause.requestTypeId"
      type="text"
      placeholder="Enter Request Type ID"
    />

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
import { defineProps, defineEmits, watch, reactive } from "vue";

const props = defineProps({
  modelValue: Object,
});
const emit = defineEmits(["update:modelValue"]);

// Initialize clause with a default structure, if not present in props.modelValue
const clause = reactive({
  ...props.modelValue,
  configPath: props.modelValue?.configPath || "", // Ensure configPath is initialized
  requestTypeId: props.modelValue?.requestTypeId || "", // Ensure requestTypeId is initialized
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
.optional-subquery-editor {
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
