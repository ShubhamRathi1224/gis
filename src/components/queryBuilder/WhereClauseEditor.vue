<!-- <template>
  <div class="rounded-xl border p-4 shadow space-y-4">
    <h3 class="text-lg font-semibold">Where Conditions</h3>
    <div
      v-for="(condition, index) in conditions"
      :key="index"
      class="border p-2 rounded space-y-2"
    >
      <select v-model="condition.type" class="p-1 border rounded">
        <option value="condition">Simple Condition</option>
        <option value="custom_validation_match">Custom Validation Match</option>
        <option value="not_in_subquery">NOT IN Subquery</option>
        <option value="optional_condition_or_subquery">
          Optional Condition or Subquery
        </option>
        <option value="optional_date_range_condition">
          Optional Date Range
        </option>
      </select>

      <component
        :is="getComponent(condition.type)"
        v-model="conditions[index]"
      />

      <button @click="removeCondition(index)" class="text-red-500 text-sm">
        Remove
      </button>
    </div>

    <button
      @click="addCondition"
      class="bg-blue-500 text-white px-3 py-1 rounded text-sm"
    >
      Add Condition
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import SimpleConditionEditor from "./conditions/SimpleConditionEditor.vue";

// import ConditionEditor from "./conditions/ConditionEditor.vue";
import CustomValidationMatchEditor from "./conditions/CustomValidationMatchEditor.vue";
import NotInSubqueryEditor from "./conditions/NotInSubqueryEditor.vue";
import OptionalSubqueryEditor from "./conditions/OptionalSubqueryEditor.vue";
import OptionalDateRangeEditor from "./conditions/OptionalDateRangeEditor.vue";

const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);

const conditions = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

function addCondition() {
  conditions.value.push({ type: "condition" });
}

function removeCondition(index) {
  conditions.value.splice(index, 1);
}

function getComponent(type) {
  switch (type) {
    case "condition":
      return SimpleConditionEditor;
    // return ConditionEditor;
    case "custom_validation_match":
      return CustomValidationMatchEditor;
    case "not_in_subquery":
      return NotInSubqueryEditor;
    case "optional_condition_or_subquery":
      return OptionalSubqueryEditor;
    case "optional_date_range_condition":
      return OptionalDateRangeEditor;
    default:
      return SimpleConditionEditor;
    // return ConditionEditor;
  }
}
</script>

<style scoped>
select {
  min-width: 200px;
}
</style> -->

<template>
  <div class="rounded-xl border p-4 shadow space-y-4">
    <h3 class="text-lg font-semibold">Where Conditions</h3>
    <div
      v-for="(condition, index) in conditions"
      :key="index"
      class="border p-2 rounded space-y-2"
    >
      <select v-model="condition.type" class="p-1 border rounded">
        <option value="condition">Simple Condition</option>
        <option value="custom_validation_match">Custom Validation Match</option>
        <option value="not_in_subquery">NOT IN Subquery</option>
        <option value="optional_condition_or_subquery">
          Optional Condition or Subquery
        </option>
        <option value="optional_date_range_condition">
          Optional Date Range
        </option>
      </select>

      <component
        :is="getComponent(condition.type)"
        v-model="conditions[index]"
      />

      <button @click="removeCondition(index)" class="text-red-500 text-sm">
        Remove
      </button>
    </div>

    <button
      @click="addCondition"
      class="bg-blue-500 text-white px-3 py-1 rounded text-sm"
    >
      Add Condition
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import SimpleConditionEditor from "./conditions/SimpleConditionEditor.vue";

// import ConditionEditor from "./conditions/ConditionEditor.vue";
import CustomValidationMatchEditor from "./conditions/CustomValidationMatchEditor.vue";
import NotInSubqueryEditor from "./conditions/NotInSubqueryEditor.vue";
import OptionalSubqueryEditor from "./conditions/OptionalSubqueryEditor.vue";
import OptionalDateRangeEditor from "./conditions/OptionalDateRangeEditor.vue";

const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);

const conditions = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

function addCondition() {
  conditions.value.push({ type: "condition" });
}

function removeCondition(index) {
  conditions.value.splice(index, 1);
}

function getComponent(type) {
  switch (type) {
    case "condition":
      return SimpleConditionEditor;
    // return ConditionEditor;
    // case "custom_validation_match":
    //   return CustomValidationMatchEditor;
    case "not_in_subquery":
      return NotInSubqueryEditor;
    case "optional_condition_or_subquery":
      return OptionalSubqueryEditor;
    case "optional_date_range_condition":
      return OptionalDateRangeEditor;
    default:
      return SimpleConditionEditor;
    // return ConditionEditor;
  }
}
</script>

<style scoped>
select {
  min-width: 200px;
}
</style>
