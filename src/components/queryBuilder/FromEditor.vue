<template>
  <div class="rounded-xl border p-4 shadow">
    <h3 class="text-lg font-semibold mb-2">FROM Clause</h3>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Table</label>
        <input
          v-model="modelValue.table"
          class="input input-bordered w-full"
          type="text"
        />
        <!-- </div>
      <div> -->
        <label class="block text-sm font-medium mb-1">Alias</label>
        <input
          v-model="modelValue.alias"
          class="input input-bordered w-full"
          type="text"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const modelValue = defineModel();
</script>

<style scoped>
.input {
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
}
</style>
