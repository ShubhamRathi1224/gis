<template>
  <div class="border p-4 rounded mb-4 bg-blue-50">
    <h3 class="font-semibold">Custom Validation Match</h3>
    <label class="block text-sm mt-2">Request Type ID</label>
    <input v-model="clause.requestTypeId" class="input" />

    <label class="block text-sm mt-2">Target Request Type ID</label>
    <input v-model="clause.targetRequestTypeId" class="input" />

    <fieldset class="mt-3 border rounded p-2">
      <legend class="text-sm font-medium">Validations From</legend>
      <label class="block text-xs">Table</label>
      <input v-model="clause.validationsFrom.table" class="input" />

      <label class="block text-xs mt-1">Column</label>
      <input v-model="clause.validationsFrom.column" class="input" />

      <label class="block text-xs mt-1">JSON Path</label>
      <input v-model="clause.validationsFrom.jsonPath" class="input" />
    </fieldset>

    <fieldset class="mt-3 border rounded p-2">
      <legend class="text-sm font-medium">Validation Logic</legend>
      <label class="block text-xs">Source</label>
      <input v-model="clause.validationLogic.source" class="input" />

      <label class="block text-xs mt-1">Compare Column</label>
      <input v-model="clause.validationLogic.compareColumn" class="input" />

      <label class="block text-xs mt-1">Match Expression</label>
      <input v-model="clause.validationLogic.matchExpression" class="input" />

      <label class="block text-xs mt-1">Group By</label>
      <input v-model="clause.validationLogic.groupBy" class="input" />

      <div class="mt-2">
        <label class="block text-xs font-semibold">Filters</label>
        <div
          v-for="(filter, i) in clause.validationLogic.filters"
          :key="i"
          class="mb-2"
        >
          <input
            v-model="filter.column"
            placeholder="Column"
            class="input inline w-1/3 mr-1"
          />
          <input
            v-model="filter.operator"
            placeholder="Operator"
            class="input inline w-1/4 mr-1"
          />
          <input
            v-model="filter.value"
            placeholder="Value"
            class="input inline w-1/3"
          />
          <button
            @click="clause.validationLogic.filters.splice(i, 1)"
            class="text-red-500 ml-1"
          >
            x
          </button>
        </div>
        <button
          @click="
            clause.validationLogic.filters.push({
              column: '',
              operator: '',
              value: '',
            })
          "
          class="text-blue-500 mt-1"
        >
          + Add Filter
        </button>
      </div>
    </fieldset>

    <fieldset class="mt-3 border rounded p-2">
      <legend class="text-sm font-medium">Final Join</legend>
      <label class="block text-xs">Table</label>
      <input v-model="clause.finalJoin.table" class="input" />

      <label class="block text-xs mt-1">Alias</label>
      <input v-model="clause.finalJoin.alias" class="input" />

      <label class="block text-xs mt-1">On</label>
      <input v-model="clause.finalJoin.on" class="input" />

      <label class="block text-xs mt-1">Condition</label>
      <input v-model="clause.finalJoin.condition" class="input" />
    </fieldset>

    <button class="mt-2 text-red-500" @click="$emit('remove')">Remove</button>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  modelValue: Object,
});
const emit = defineEmits(["update:modelValue"]);

// Initialize clause with a default structure, if not present in props.modelValue
const clause = reactive({
  ...props.modelValue,
  requestTypeId: props.modelValue?.requestTypeId || "", // Ensure requestTypeId is initialized
  targetRequestTypeId: props.modelValue?.targetRequestTypeId || "", // Ensure requestTypeId is initialized
  validationsFrom: {
    table: props.modelValue?.validationsFrom?.table || "", // Initialize where if not present
    column: props.modelValue?.validationsFrom?.column || "", // Initialize where if not present
    jsonPath: props.modelValue?.validationsFrom?.jsonPath || "", // Initialize select if not present
  },
  validationLogic: {
    source: props.modelValue?.validationLogic?.source || "", // Initialize where if not present
    compareColumn: props.modelValue?.validationLogic?.compareColumn || "", // Initialize where if not present
    matchExpression: props.modelValue?.validationLogic?.matchExpression || "", // Initialize select if not present
    groupBy: props.modelValue?.validationLogic?.groupBy || "", // Initialize select if not present
    filters: props.modelValue?.validationLogic?.filters || "", // Initialize select if not present
  },
  finalJoin: {
    table: props.modelValue?.finalJoin?.table || "", // Initialize where if not present
    alias: props.modelValue?.finalJoin?.alias || "", // Initialize where if not present
    on: props.modelValue?.finalJoin?.on || "", // Initialize select if not present
    condition: props.modelValue?.finalJoin?.condition || "", // Initialize select if not present
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
.input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
