<template>
  <div>
    <h2>Draw Polyline and Generate Shapefile</h2>

    <div class="manual-coord-form">
      <label>Start Latitude: <input v-model="manualCoords.startLat" /></label>
      <label>Start Longitude: <input v-model="manualCoords.startLng" /></label>
      <label>End Latitude: <input v-model="manualCoords.endLat" /></label>
      <label>End Longitude: <input v-model="manualCoords.endLng" /></label>
      <button @click="createOrUpdatePolyline">Create/Update Polyline</button>
    </div>

    <div id="map" class="map-container map-wrapper"></div>

    <button @click="captureMapSnapshot">Capture Map Snapshot</button>

    <div class="form-container">
      <label>WSITENAME: <input v-model="formData.WSITENAME" /></label>
      <label>WORKSITEID: <input v-model="formData.WORKSITEID" /></label>
      <label>STREETNAME: <input v-model="formData.STREETNAME" /></label>
      <label>STREETW: <input v-model="formData.STREETW" /></label>
      <label>PATHWIDTH: <input v-model="formData.PATHWIDTH" /></label>
      <label>PATHLENGTH: <input v-model="formData.PATHLENGTH" /></label>
      <label>PATHDEPTH: <input v-model="formData.PATHDEPTH" /></label>
      <label>ROADSCRAP: <input v-model="formData.ROADSCRAP" /></label>
      <label>PATHINDEX: <input v-model="formData.PATHINDEX" /></label>
    </div>
    <button @click="generateShapefile">Download Shapefile (.zip)</button>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import maplibregl from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import shpwrite from "@mapbox/shp-write";
import JSZip from "jszip";
import * as turf from "@turf/turf";
import {
  LINE_DETAILS_DEFAULTS,
  MANUAL_COORDS,
  MAPBOX_HIGHLIGHT_LAYER_DEFAULTS,
  MAPBOX_VALUE_DEFAULTS,
  MAPLIBRE_MAP_DEFAULT_CONFIG,
  MAPTILER_API_KEY,
} from "../utils/constants";
import {
  calculateLineLength,
  createOrUpdatePolylineOnMap,
  getLastCreatedLine,
  isStartOrEndPointOnLine,
  mapSnapshot,
  segmentsIntersect,
} from "../utils/utils";
// import "@maplibre/maplibre-gl-draw/dist/maplibre-gl-draw.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
// import "https://cdn.maptiler.com/maptiler-sdk-js/v1.1.2/maptiler-sdk.min.css";

const map = ref(null);
const draw = ref(null);
const lastDrawnFeature = ref(null);

const manualCoords = ref(MANUAL_COORDS);

const selectedFeatureId = ref(null);

// Form data for attributes
const formData = ref(LINE_DETAILS_DEFAULTS);

onMounted(() => {
  initMap();
});

const initMap = () => {
  map.value = new maplibregl.Map(MAPLIBRE_MAP_DEFAULT_CONFIG);

  draw.value = new MapboxDraw(MAPBOX_VALUE_DEFAULTS);

  map?.value?.once("load", () => {
    const canvas = map.value.getCanvas();
    canvas.crossOrigin = "anonymous";
  });

  map.value.addControl(draw.value, "top-left");
  // map.value.addControl(new maplibregl.NavigationControl(), "top-left");

  map.value.on("draw.create", (e) => {
    const newFeature = e.features[0];

    const newCoords = newFeature.geometry.coordinates;

    if (!lastDrawnFeature.value) {
      lastDrawnFeature.value = newFeature;
      return;
    }

    // 50 meter logic
    const lastCoords = lastDrawnFeature.value.geometry.coordinates;
    const isValidWithin50Meters = isWithin50Meters(lastCoords, newCoords);
    if (!isValidWithin50Meters) {
      alert(
        "At least one point on the new line must be within 50 meters of the previous line."
      );
      draw.value.delete(newFeature.id);
    } else {
      lastDrawnFeature.value = newFeature;
    }

    // // Replace this with your logic to find the correct existing line to compare with
    // const existingFeature = getLastCreatedLine(draw); // your function
    // if (!existingFeature) return;
    // const existingCoords = existingFeature.geometry.coordinates;
    // const isValidReplacePartLine = isStartOrEndPointOnLine(
    //   newCoords,
    //   existingCoords
    // );
    // if (!isValidReplacePartLine) {
    //   alert("❌ Invalid: Line must start or end on an existing line.");
    //   draw.value.delete(newFeature.id); // Optional: remove the invalid line
    // } else {
    //   console.log("✅ Line is valid and connected to existing line.");
    // }
  });

  // map.value.on("draw.update", handleDrawUpdate);

  // function handleDrawUpdate(e) {
  //   const newFeature = e.features[0];

  //   if (newFeature.geometry.type !== "LineString") return;

  //   const newCoords = newFeature.geometry.coordinates;

  //   // Replace this with your logic to find the correct existing line to compare with
  //   const existingFeature = getLastCreatedLine(draw); // your function
  //   if (!existingFeature) return;
  //   const existingCoords = existingFeature.geometry.coordinates;
  //   const isValidReplacePartLine = isStartOrEndPointOnLine(
  //     newCoords,
  //     existingCoords
  //   );
  //   if (!isValidReplacePartLine) {
  //     alert("❌ Invalid: Line must start or end on an existing line.");
  //     draw.value.delete(newFeature.id); // Optional: remove the invalid line
  //   } else {
  //     console.log("✅ Line is valid and connected to existing line.");
  //   }
  // }

  map.value.on("draw.selectionchange", (e) => {
    const selected = e.features[0];
    if (!selected) {
      selectedFeatureId.value = null;

      manualCoords.value.startLng = "";
      manualCoords.value.startLat = "";
      manualCoords.value.endLng = "";
      manualCoords.value.endLat = "";
      // Remove highlight if nothing is selected
      if (map.value.getSource("highlight")) {
        map.value.removeLayer("highlight-line");
        map.value.removeSource("highlight");
      }
      return;
    }

    selectedFeatureId.value = selected.id;

    const coords = selected.geometry.coordinates;
    if (coords.length >= 2) {
      manualCoords.value.startLng = coords[0][0];
      manualCoords.value.startLat = coords[0][1];
      manualCoords.value.endLng = coords[coords.length - 1][0];
      manualCoords.value.endLat = coords[coords.length - 1][1];
    }

    // Remove existing layer if any
    if (map.value.getLayer("highlight-line")) {
      map.value.removeLayer("highlight-line");
    }
    if (map.value.getSource("highlight")) {
      map.value.removeSource("highlight");
    }

    map.value.addSource("highlight", {
      type: "geojson",
      data: selected,
    });

    map.value.addLayer(MAPBOX_HIGHLIGHT_LAYER_DEFAULTS);
  });

  map.value.on("draw.delete", () => {
    selectedFeatureId.value = null;

    manualCoords.value.startLng = "";
    manualCoords.value.startLat = "";
    manualCoords.value.endLng = "";
    manualCoords.value.endLat = "";

    // Remove highlight source & layer if they exist
    if (map.value.getLayer("highlight-line")) {
      map.value.removeLayer("highlight-line");
    }
    if (map.value.getSource("highlight-line")) {
      map.value.removeSource("highlight-line");
    }

    lastDrawnFeature.value = null;
  });
};

const createOrUpdatePolyline = () => {
  createOrUpdatePolylineOnMap(manualCoords, selectedFeatureId, draw);
};

// Helper: Check for Intersections
function hasIntersections(features) {
  const allSegments = [];

  for (let f of features) {
    const coords = f.geometry.coordinates;
    for (let i = 0; i < coords.length - 1; i++) {
      allSegments.push([coords[i], coords[i + 1]]);
    }
  }

  // Check each segment against every other (O(n^2))
  for (let i = 0; i < allSegments.length; i++) {
    for (let j = i + 1; j < allSegments.length; j++) {
      if (segmentsIntersect(allSegments[i], allSegments[j])) {
        return true;
      }
    }
  }
  return false;
}

// max dist b/w 2 excavations must not exceeds 50 meter(farthest point)(adjacent excavations) ???? - minimum(coordinate) distance should not be greater than 50 mtr

function isWithin50Meters(line1Coords, line2Coords) {
  const line1DensePoints = getInterpolatedPoints(line1Coords, 1); // adjust interval as needed
  const line2DensePoints = getInterpolatedPoints(line2Coords, 1);

  for (const p2 of line2DensePoints) {
    for (const p1 of line1DensePoints) {
      const dist = turf.distance(turf.point(p1), turf.point(p2), {
        units: "meters",
      });
      if (dist <= 50) return true;
    }
  }

  return false;
}

function getInterpolatedPoints(coords, intervalMeters = 1) {
  const line = turf.lineString(coords);
  const length = turf.length(line, { units: "meters" }); // Total length in meters

  const points = [];
  for (let dist = 0; dist <= length; dist += intervalMeters) {
    const pointOnLine = turf.along(line, dist, { units: "meters" });
    points.push(pointOnLine.geometry.coordinates);
  }

  return points;
}

// max dist b/w 2 excavations must not exceeds 50 meter(farthest point)(adjacent excavations) ???? - minimum(coordinate) distance should not be greater than 50 mtr

const captureMapSnapshot = () => {
  mapSnapshot(map);
};

const generateShapefile = async () => {
  try {
    const features = draw.value.getAll().features;

    if (features.length === 0) {
      alert("Please draw a polyline first.");
      return;
    }

    // Check if all features are LineString
    const invalid = features.some((f) => f.geometry.type !== "LineString");
    if (invalid) {
      alert("Only polylines are allowed. Remove other shapes.");
      return;
    }

    // ✅ Validation 1: Max 5 polylines
    if (features.length > 5) {
      alert("A maximum of 5 polylines is allowed.");
      return;
    }

    // ✅ Validation 2: Total path length ≤ 1km
    const totalLengthMeters = features.reduce((sum, feature) => {
      return sum + calculateLineLength(feature.geometry.coordinates);
    }, 0);

    if (totalLengthMeters > 1000) {
      alert(
        `Total path length is ${totalLengthMeters.toFixed(
          2
        )} meters, which exceeds 1 km.`
      );
      return;
    }

    // ✅ Validation 3: No intersections between polylines
    if (hasIntersections(features)) {
      alert("Polylines must not intersect or converge.");
      return;
    }

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

    const missingFields = REQUIRED_FIELDS.filter(
      (field) => !formData.value?.[field]
    );

    if (missingFields.length > 0) {
      alert(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    const options = {
      folder: "my_internal_shapes_folder",
      filename: "my_zip_filename",
      outputType: "blob",
      compression: "DEFLATE",
      types: {
        point: "mypoints",
        polygon: "mypolygons",
        polyline: "mylines",
      },
    };

    // Prepare GeoJSON
    const geojson = {
      type: "FeatureCollection",
      features: features.map((f) => ({
        type: "Feature",
        geometry: f.geometry,
        properties: formData.value,
      })),
    };

    const shapefile = shpwrite.zip(geojson, options);

    // Create a zip file
    const zip = new JSZip();
    zip.file("shapefile.zip", shapefile, { binary: true });

    // Generate and download the file
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    // link.download = "shapefile.zip";
    link.download = "shapefile";
    link.click();
  } catch (error) {
    console.error("Error generating shapefile:", error);
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
  position: relative; /* ✨ ADD this */
  width: calc(100vw - 40px);
  height: 600px;
  margin-bottom: 20px;
}
.manual-coord-form {
  display: grid;
  gap: 10px;
  margin: 20px 0;
  grid-template-columns: repeat(2, 1fr);
}
.form-container {
  display: grid;
  gap: 10px;
  margin-bottom: 10px;
  grid-template-columns: auto auto auto;
  justify-items: self-start;
}
input {
  width: 250px;
}
button {
  width: 250px;
  padding: 10px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.maplibregl-control-container {
  position: absolute;
  top: 0px;
  left: 0px;
  padding: 10px;
}
.maplibregl-control-container details {
  /* display: none; */
}

.maplibregl-control-container .mapboxgl-ctrl-group.mapboxgl-ctrl {
  gap: 10px;
  display: flex;
}
</style>
