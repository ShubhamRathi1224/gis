<template>
  <div class="border p-4 rounded mb-4 bg-gray-50">
    <label class="block text-sm font-medium text-gray-700">Column</label>
    <input v-model="condition.column" class="input" type="text" />

    <label class="block text-sm font-medium text-gray-700 mt-2">Operator</label>
    <select v-model="condition.operator" class="input">
      <option>=</option>
      <option>!=</option>
      <option>&lt;</option>
      <option>&gt;</option>
      <option>&lt;=</option>
      <option>&gt;=</option>
      <option>LIKE</option>
      <option>IN</option>
    </select>

    <label class="block text-sm font-medium text-gray-700 mt-2">Value</label>
    <input v-model="condition.value" class="input" type="text" />

    <button class="mt-2 text-red-500" @click="$emit('remove')">Remove</button>
  </div>
</template>

<script setup>
const props = defineProps({
  condition: Object,
});
</script>

<style scoped>
.input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
