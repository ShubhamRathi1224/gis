export const MAPTILER_API_KEY = "NntEHIOqXdAtLme0lFus";

export const MANUAL_COORDS = {
  startLat: "",
  startLng: "",
  endLat: "",
  endLng: "",
};

export const LINE_DETAILS_DEFAULTS = {
  WSITENAME: "1",
  WORKSITEID: "2",
  STREETNAME: "3",
  STREETW: "4",
  PATHWIDTH: "5",
  PATHLENGTH: "6",
  PATHDEPTH: "7",
  ROADSCRAP: "8",
  PATHINDEX: "9",
};

export const MAPLIBRE_MAP_DEFAULT_CONFIG = {
  container: "map",
  // style: "https://demotiles.maplibre.org/style.json",
  style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_API_KEY}`,
  center: [46.667717, 24.767861], // Riyadh coordinates (optional)24.767861, 46.667717
  // center: [0, 0], // center
  zoom: 15, // 2,
  // 👇 Add this line:
  crossSourceCollisions: false,
  preserveDrawingBuffer: true, // Enable buffer preservation
};

export const MAPBOX_VALUE_DEFAULTS = {
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
};

export const MAPBOX_HIGHLIGHT_LAYER_DEFAULTS = {
  id: "highlight-line",
  type: "line",
  source: "highlight",
  layout: {},
  paint: {
    "line-color": "#007bff", // Blue color
    "line-width": 3,
    "line-dasharray": ["literal", [0.5, 2]],
  },
};
