<template>
  <div id="capture-area">
    <!-- Whatever part of the page you want to capture -->
    <h2>This area will be captured</h2>
  </div>

  <button @click="captureFullArea">Capture Div</button>
</template>

<script setup>
import domtoimage from "dom-to-image";

const captureFullArea = () => {
  const node = document.getElementById("capture-area");
  domtoimage.toPng(node).then((dataUrl) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "full_snapshot.png";
    link.click();
  });
};
</script>
