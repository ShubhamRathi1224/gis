import * as turf from "@turf/turf";

export const createOrUpdatePolylineOnMap = (
  manualCoords,
  selectedFeatureId,
  draw
) => {
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

// function isWithin50Meters(line1Coords, line2Coords) {
//   const line1DensePoints = getInterpolatedPoints(line1Coords, 1); // adjust interval as needed
//   const line2DensePoints = getInterpolatedPoints(line2Coords, 1);

//   for (const p2 of line2DensePoints) {
//     for (const p1 of line1DensePoints) {
//       const dist = turf.distance(turf.point(p1), turf.point(p2), {
//         units: "meters",
//       });
//       if (dist <= 50) return true;
//     }
//   }

//   return false;
// }

// export function getInterpolatedPoints(coords, intervalMeters = 1) {
//   const line = turf.lineString(coords);
//   const length = turf.length(line, { units: "meters" }); // Total length in meters

//   const points = [];
//   for (let dist = 0; dist <= length; dist += intervalMeters) {
//     const pointOnLine = turf.along(line, dist, { units: "meters" });
//     points.push(pointOnLine.geometry.coordinates);
//   }

//   return points;
// }

// replace a part of path?

// Function to Get Existing Line
export function getLastCreatedLine(draw) {
  const all = draw.value.getAll().features;
  return all.length > 1 ? all[all.length - 2] : null;
}

export function isStartOrEndPointOnLine(
  newLineCoords,
  existingLineCoords,
  tolerance = 1
) {
  const existingLine = turf.lineString(existingLineCoords);
  const start = turf.point(newLineCoords[0]);
  const end = turf.point(newLineCoords[newLineCoords.length - 1]);

  const startDist = turf.pointToLineDistance(start, existingLine, {
    units: "meters",
  });
  const endDist = turf.pointToLineDistance(end, existingLine, {
    units: "meters",
  });

  return startDist <= tolerance || endDist <= tolerance;
}

// replace a part of path?

// Helper: Calculate Line Length (in meters)
export function calculateLineLength(coordinates) {
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

// // Helper: Check for Intersections
// export function hasIntersections(features) {
//   const allSegments = [];

//   for (let f of features) {
//     const coords = f.geometry.coordinates;
//     for (let i = 0; i < coords.length - 1; i++) {
//       allSegments.push([coords[i], coords[i + 1]]);
//     }
//   }

//   // Check each segment against every other (O(n^2))
//   for (let i = 0; i < allSegments.length; i++) {
//     for (let j = i + 1; j < allSegments.length; j++) {
//       if (segmentsIntersect(allSegments[i], allSegments[j])) {
//         return true;
//       }
//     }
//   }
//   return false;
// }

export function segmentsIntersect([p1, p2], [q1, q2]) {
  const ccw = (a, b, c) =>
    (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
  return (
    ccw(p1, q1, q2) !== ccw(p2, q1, q2) && ccw(p1, p2, q1) !== ccw(p1, p2, q2)
  );
}

export const mapSnapshot = (map) => {
  const canvas = map.value?.getCanvas();
  if (!canvas) {
    alert("Map not initialized yet.");
    return;
  }

  map.value.once("idle", () => {
    const canvas = map.value.getCanvas();
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "map_snapshot.png";
    link.click();
  });
};
