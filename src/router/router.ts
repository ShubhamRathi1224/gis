import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
// ----

import GeneralError from "../components/GeneralError.vue";
import HelloWorld from "../components/HelloWorld.vue";
import ShapeFileUploader from "../components/ShapeFileUploader.vue";
import ShapeFileGenerator from "../components/ShapeFileGenerator.vue";
import MapTilerShapefile from "../components/MapTilerShapefile.vue";
const routes: RouteRecordRaw[] = [
  {
    path: "/home",
    name: "home",
    component: HelloWorld,
  },
  {
    path: "/generate-shapefile",
    name: "generate-shapefile",
    component: ShapeFileGenerator,
  },
  {
    path: "/upload-shapefile",
    name: "upload-shapefile",
    component: ShapeFileUploader,
  },
  {
    path: "/maptiler-shapefile",
    name: "maptiler-shapefile",
    component: MapTilerShapefile,
  },
  {
    path: "/error",
    name: "error",
    component: GeneralError,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/home",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
  scrollBehavior(to, from, savedPosition) {
    // always scroll to top
    if (savedPosition) {
      return savedPosition;
    } else if (to.name !== from.name) {
      return { top: 0, behavior: "smooth" };
    }
  },
});
export default router;
