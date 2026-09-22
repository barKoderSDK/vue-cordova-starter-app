import { createRouter, createWebHashHistory } from 'vue-router';
import HomeScreen from '../screens/HomeScreen.vue';
import ScannerScreen from '../screens/ScannerScreen.vue';
import BarcodeDetailsScreen from '../screens/BarcodeDetailsScreen.vue';
import RecentScanScreen from '../screens/RecentScanScreen.vue';
import AboutScreen from '../screens/AboutScreen.vue';

const routes = [
  { path: '/', component: HomeScreen },
  { path: '/scanner/:mode/:sessionId?', component: ScannerScreen },
  { path: '/details', component: BarcodeDetailsScreen },
  { path: '/history', component: RecentScanScreen },
  { path: '/about', component: AboutScreen },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

// Hash history keeps routing working from the file:// origin Cordova serves.
export default createRouter({
  history: createWebHashHistory(),
  routes,
});
