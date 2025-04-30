<template>
  <div>
    <Header />
    <div class="route-container grid">
      <router-view v-slot="{ Component, route }" :key="$route.fullPath">
        <transition :name="!route.meta.fullWidth ? 'bounce' : 'fade'">
          <component
            class="route-component w-full mx-auto"
            :class="{
              'max-w-screen-xl': !route.meta?.fullWidth,
              'pt-[125px]':
                !route.meta.transparentHeader && !route.meta.hideHeader,
            }"
            :is="Component"
          />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from "./components/Header.vue";
</script>
<style lang="scss" scoped>
.route-container {
  @apply items-start;
}
.route-component {
  --animate-duration: 0.15s;
  grid-area: 1/-1;
}
</style>
