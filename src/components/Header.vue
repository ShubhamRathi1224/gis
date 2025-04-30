<template>
  <div class="header-container">
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/generate-shapefile">Generate shapefile</router-link>
      <router-link to="/upload-shapefile">Upload shapefile</router-link>
      <router-link to="/maptiler-shapefile">Maptiler shapefile</router-link>
    </nav>
  </div>
</template>
<style>
.header-container nav {
  display: flex;
  gap: 20px;
}
</style>
