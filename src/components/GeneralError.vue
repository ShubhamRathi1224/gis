<template>
  <div>
    <div class="heading pb-4 pt-4">
      <h1 class="text-3xl">Error Page</h1>
    </div>
    <div class="min-h-[30rem] flex flex-col page py-14">
      <div class="max-w-lg mx-auto">
        <h1 class="text-xl text-danger-dark text-center">
          This page is unaccessible
        </h1>
        <div class="flex gap-4 mt-10 justify-center">
          <button class="btn-primary" @click="goToHomePage">Home</button>
          <button class="btn-secondary" @click="back">Back</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
const { back, push } = useRouter();

function goToHomePage() {
  push({ name: "home" });
}
</script>

<style lang="scss" scoped>
//scoped style
</style>
