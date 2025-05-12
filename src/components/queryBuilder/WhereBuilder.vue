<template>
  <div class="space-y-4">
    <div
      v-for="(clause, index) in whereClauses"
      :key="index"
      class="p-4 border rounded-xl bg-gray-50"
    >
      <component
        :is="getComponentForClause(clause)"
        v-model="whereClauses[index]"
        @remove="removeClause(index)"
      />
    </div>

    <div class="flex gap-2">
      <button @click="addClause('condition')" class="btn">+ Condition</button>
      <button @click="addClause('custom_validation_match')" class="btn">
        + Validation Match
      </button>
      <button @click="addClause('optional_condition_or_subquery')" class="btn">
        + Optional Clause
      </button>
      <button @click="addClause('optional_date_range_condition')" class="btn">
        + Date Range
      </button>
      <button @click="addClause('not_in_subquery')" class="btn">
        + NOT IN Subquery
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import ConditionEditor from "./where/ConditionEditor.vue";
import CustomValidationMatchEditor from "./where/CustomValidationMatchEditor.vue";
import OptionalClauseEditor from "./where/OptionalClauseEditor.vue";
import DateRangeConditionEditor from "./where/DateRangeConditionEditor.vue";
import NotInSubqueryEditor from "./where/NotInSubqueryEditor.vue";

const props = defineProps({
  modelValue: Array,
});
const emit = defineEmits(["update:modelValue"]);

const whereClauses = reactive(props.modelValue);

function addClause(type) {
  let clause = { type };
  switch (type) {
    case "condition":
      clause = { type, column: "", operator: "=", value: "" };
      break;
    case "custom_validation_match":
      clause = {
        type,
        requestTypeId: "",
        targetRequestTypeId: "",
        validationsFrom: { table: "", column: "", jsonPath: "" },
        validationLogic: {
          source: "",
          compareColumn: "",
          matchExpression: "",
          groupBy: "",
          filters: [],
        },
        finalJoin: { table: "", alias: "", on: "", condition: "" },
      };
      break;
    case "optional_condition_or_subquery":
      clause = {
        type,
        configPath: "",
        requestTypeId: "",
        column: "",
        subquery: {
          select: [],
          from: { table: "", alias: "" },
          openjson: { column: "", path: "" },
          where: [],
        },
      };
      break;
    case "optional_date_range_condition":
      clause = {
        type,
        column: "",
        configPaths: { min: "", max: "" },
        requestTypeId: "",
      };
      break;
    case "not_in_subquery":
      clause = {
        type,
        column: "",
        subquery: {
          select: [],
          from: { table: "", alias: "" },
          where: [],
        },
      };
      break;
  }
  whereClauses.push(clause);
  emit("update:modelValue", whereClauses);
}

function removeClause(index) {
  whereClauses.splice(index, 1);
  emit("update:modelValue", whereClauses);
}

function getComponentForClause(clause) {
  switch (clause.type) {
    case "condition":
      return ConditionEditor;
    case "custom_validation_match":
      return CustomValidationMatchEditor;
    case "optional_condition_or_subquery":
      return OptionalClauseEditor;
    case "optional_date_range_condition":
      return DateRangeConditionEditor;
    case "not_in_subquery":
      return NotInSubqueryEditor;
    default:
      return ConditionEditor;
  }
}
</script>

<style scoped>
.btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
}
.btn:hover {
  background: #e5e7eb;
}
</style>
