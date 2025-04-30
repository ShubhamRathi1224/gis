<template>
  <div>
    <h2>Shapefile (.zip) Upload and Preview</h2>
    <input type="file" accept=".zip" @change="handleUpload" />
    <div id="map" class="map-container"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import JSZip from "jszip";
import * as shapefile from "shapefile";
import maplibregl from "maplibre-gl";
import * as turf from "@turf/turf";

const map = ref(null);

// Required fields
const REQUIRED_FIELDS = [
  "WSITENAME",
  "WORKSITEID",
  "STREETNAME",
  "STREETW",
  "PATHWIDTH",
  "PATHLENGTH",
  "PATHDEPTH",
  "ROADSCRAP",
  "PATHINDEX",
];

const initMap = () => {
  map.value = new maplibregl.Map({
    container: "map",
    style: "https://demotiles.maplibre.org/style.json",
    center: [0, 0],
    zoom: 2,
  });
};

onMounted(() => {
  initMap();
});

const handleUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.name.endsWith(".zip")) {
    alert("Please upload a .zip file only.");
    return;
  }

  try {
    const zip = await JSZip.loadAsync(file);

    // Find required files
    const files = Object.values(zip.files);
    const shpFile = files.find((f) => f.name.endsWith(".shp"));
    const shxFile = files.find((f) => f.name.endsWith(".shx"));
    const dbfFile = files.find((f) => f.name.endsWith(".dbf"));
    const prjFile = files.find((f) => f.name.endsWith(".prj"));

    // Validation
    const missingFiles = [];
    if (!shpFile) missingFiles.push(".shp");
    if (!shxFile) missingFiles.push(".shx");
    if (!dbfFile) missingFiles.push(".dbf");
    if (!prjFile) missingFiles.push(".prj");

    if (missingFiles.length > 0) {
      alert(`Invalid ZIP: Missing required files: ${missingFiles.join(", ")}`);
      return;
    }

    const shpBuffer = await shpFile.async("arraybuffer");
    const dbfBuffer = await dbfFile.async("arraybuffer");

    const geojson = await shapefile.read(shpBuffer, dbfBuffer);
    console.log("geojson: ", geojson);

    // New validations:

    // 1. Check all features are LineString
    const invalidGeometry = geojson.features.find(
      (f) =>
        !(
          f.geometry.type === "LineString" ||
          f.geometry.type === "MultiLineString"
        )
    );
    if (invalidGeometry) {
      alert("Geometry type must be POLYLINE (LineString) only.");
      return;
    }

    // 2. Check all required fields are present
    const featureProperties = geojson.features[0]?.properties;
    if (!featureProperties) {
      alert("No attributes found in shapefile.");
      return;
    }

    const missingFields = REQUIRED_FIELDS.filter(
      (field) => !(field in featureProperties)
    );
    if (missingFields.length > 0) {
      alert(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    // ✅ Passed validations
    // Remove old layer if any
    if (map.value.getSource("uploaded")) {
      map.value.removeLayer("uploaded-layer");
      map.value.removeSource("uploaded");
    }

    map.value.addSource("uploaded", {
      type: "geojson",
      data: geojson,
    });

    map.value.addLayer({
      id: "uploaded-layer",
      type: "line", // Use line because it's a LineString
      source: "uploaded",
      paint: {
        "line-color": "#3b82f6",
        "line-width": 3,
      },
    });

    const bbox = turf.bbox(geojson);
    map.value.fitBounds(bbox, { padding: 20 });
  } catch (err) {
    console.error("Error processing shapefile:", err);
    alert("Could not parse shapefile. Please check the file structure.");
  }
};
</script>

<style>
body {
  font-family: sans-serif;
  margin: 0;
  padding: 20px;
}
.map-container {
  width: calc(100vw - 40px);
  height: 700px;
  margin-top: 20px;
}
.maplibregl-control-container details {
  display: none;
}
</style>
