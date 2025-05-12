<template>
  <div class="rounded-xl border p-4 shadow">
    <h3 class="text-lg font-semibold mb-2">JOINS</h3>
    <div
      v-for="(join, index) in modelValue"
      :key="index"
      class="mb-4 border-b pb-4"
    >
      <div class="grid grid-cols-2 gap-4">
        <QueryBuilder
          :model-value="modelValue[index]"
          @update:modelValue="(val) => updateJoin(index, val)"
        />
        <!-- <div>
          <label class="block text-sm font-medium mb-1">Table</label>
          <input
            v-model="join.table"
            class="input input-bordered w-full"
            type="text"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Alias</label>
          <input
            v-model="join.alias"
            class="input input-bordered w-full"
            type="text"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">ON Condition</label>
          <input
            v-model="join.on"
            class="input input-bordered w-full"
            type="text"
          />
        </div> -->
        <div>
          <label class="block text-sm font-medium mb-1">Type</label>
          <select v-model="join.type" class="input input-bordered w-full">
            <option>INNER</option>
            <option>LEFT</option>
            <option>RIGHT</option>
            <option>FULL</option>
          </select>
        </div>
      </div>
      <button class="btn btn-error mt-2" @click="removeJoin(index)">
        Remove
      </button>
    </div>
    <button class="btn btn-primary" @click="addJoin">Add Join</button>
  </div>
</template>

<script setup>
import { joinQueryStarter } from "../../utils/query";
import QueryBuilder from "./QueryBuilder.vue";

const modelValue = defineModel();

function addJoin() {
  // modelValue.value.push({ table: "", alias: "", on: "", type: "INNER" });
  modelValue.value.push(joinQueryStarter);
}

function removeJoin(index) {
  modelValue.value.splice(index, 1);
}

function updateJoin(index, val) {
  modelValue.value[index] = val;
}
</script>

<style scoped>
.input {
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
}
.btn {
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
}
</style>
