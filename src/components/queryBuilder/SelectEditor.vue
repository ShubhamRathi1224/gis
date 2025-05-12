<template>
  <div class="rounded-xl border p-4 shadow">
    <h3 class="text-lg font-semibold mb-2">SELECT Clause</h3>
    <div class="space-y-2">
      <div
        v-for="(col, index) in modelValue"
        :key="index"
        class="flex gap-2 items-center"
      >
        <input
          v-model="modelValue[index]"
          class="input input-bordered w-full"
          type="text"
        />
        <button class="btn btn-error" @click="modelValue.splice(index, 1)">
          Remove
        </button>
      </div>
      <button class="btn btn-primary mt-2" @click="modelValue.push('')">
        Add Column
      </button>
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
.btn {
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
}
</style>
