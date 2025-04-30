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

// ✅ Use correct import (no require needed)
import shpwrite from "@mapbox/shp-write";
import JSZip from "jszip";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
// import "https://cdn.maptiler.com/maptiler-sdk-js/v1.1.2/maptiler-sdk.min.css";
// import "@maplibre/maplibre-gl-draw/dist/maplibre-gl-draw.css";

const map = ref(null);
const draw = ref(null);

const manualCoords = ref({
  startLat: "",
  startLng: "",
  endLat: "",
  endLng: "",
});

const selectedFeatureId = ref(null);

const MAPTILER_API_KEY = "NntEHIOqXdAtLme0lFus"; // 🔑 Replace this

// Form data for attributes
const formData = ref({
  WSITENAME: "1",
  WORKSITEID: "2",
  STREETNAME: "3",
  STREETW: "4",
  PATHWIDTH: "5",
  PATHLENGTH: "6",
  PATHDEPTH: "7",
  ROADSCRAP: "8",
  PATHINDEX: "9",
});

const initMap = () => {
  map.value = new maplibregl.Map({
    container: "map",
    // style: "https://demotiles.maplibre.org/style.json",
    style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_API_KEY}`,
    // center: [46.6753, 24.7136], // Riyadh coordinates (optional)
    center: [0, 0], // center
    zoom: 2,
  });

  draw.value = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      line_string: true, // ✅ Only allow polylines
      trash: true,
    },
    styles: [
      // Default (non-selected) lines
      {
        id: "gl-draw-lines",
        type: "line",
        filter: [
          "all",
          ["==", "$type", "LineString"],
          ["!=", "user_is_selected", true],
        ],
        paint: {
          "line-color": "#f00",
          "line-width": 3,
          "line-dasharray": ["literal", [0.5, 2]],
        },
      },
      // Highlighted (selected) line
      {
        id: "gl-draw-lines-highlighted",
        type: "line",
        filter: [
          "all",
          ["==", "$type", "LineString"],
          ["==", "user_is_selected", true],
        ],
        paint: {
          "line-color": "#007bff", // Blue highlight
          "line-width": 3,
          "line-dasharray": ["literal", [0.5, 2]],
        },
      },
    ],
  });

  // map.value.addControl(draw.value, "top-left");
  map.value.addControl(new maplibregl.NavigationControl(), "top-left");

  // map.value.on("draw.create", (e) => {
  //   console.log("Feature drawn:", e.features);
  // });

  // map.value.on("draw.selectionchange", (e) => {
  //   const allFeatures = draw.value.getAll().features;

  //   allFeatures.forEach((feature) => {
  //     feature.properties.user_is_selected = false;
  //     if (e.features[0]?.id === feature?.id) {
  //       feature.properties.user_is_selected = true;
  //     }
  //   });

  //   console.log("allFeatures: ", allFeatures);
  //   // Update the entire set to reflect selection state
  //   draw.value.set({
  //     type: "FeatureCollection",
  //     features: allFeatures,
  //   });
  // });

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

    map.value.addLayer({
      id: "highlight-line",
      type: "line",
      source: "highlight",
      layout: {},
      paint: {
        "line-color": "#007bff", // Blue color
        "line-width": 3,
        "line-dasharray": ["literal", [0.5, 2]],
      },
    });
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
  });
};

const createOrUpdatePolyline = () => {
  const { startLat, startLng, endLat, endLng } = manualCoords.value;

  if (
    !startLat ||
    !startLng ||
    !endLat ||
    !endLng ||
    isNaN(startLat) ||
    isNaN(startLng) ||
    isNaN(endLat) ||
    isNaN(endLng)
  ) {
    alert("Please enter valid start and end coordinates.");
    return;
  }

  const line = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [parseFloat(startLng), parseFloat(startLat)],
        [parseFloat(endLng), parseFloat(endLat)],
      ],
    },
    properties: {},
  };

  if (selectedFeatureId.value) {
    // Update existing feature
    draw.value.delete(selectedFeatureId.value);
    const [newId] = draw.value.add(line);
    selectedFeatureId.value = newId;
  } else {
    // Add new line
    const [newId] = draw.value.add(line);
    selectedFeatureId.value = newId;
  }
};

onMounted(() => {
  initMap();
});

// Helper: Calculate Line Length (in meters)
function calculateLineLength(coordinates) {
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const [lon1, lat1] = coordinates[i - 1];
    const [lon2, lat2] = coordinates[i];
    total += haversineDistance(lat1, lon1, lat2, lon2);
  }
  return total;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371000; // Radius of Earth in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

function segmentsIntersect([p1, p2], [q1, q2]) {
  const ccw = (a, b, c) =>
    (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
  return (
    ccw(p1, q1, q2) !== ccw(p2, q1, q2) && ccw(p1, p2, q1) !== ccw(p1, p2, q2)
  );
}

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

    console.log("formData: ", formData);
    const missingFields1 = REQUIRED_FIELDS.filter(
      (field) => !formData.value?.[field]
    );
    console.log("missingFields1: ", missingFields1);
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
.map-wrapper * {
  all: revert;
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
