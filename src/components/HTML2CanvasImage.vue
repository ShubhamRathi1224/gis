<template>
  <div id="capture-area">
    <!-- Whatever part of the page you want to capture -->
    <h2>This area will be captured</h2>
  </div>

  <button @click="captureDiv">Capture Div</button>
</template>

<script setup>
import html2canvas from "html2canvas";

const captureDiv = async () => {
  const element = document.getElementById("capture-area");
  if (!element) return alert("Element not found.");

  const canvas = await html2canvas(element);
  const dataURL = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "screenshot.png";
  link.click();
};
</script>
