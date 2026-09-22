<template>
  <div class="page home-page">
    <img :src="bgImage" alt="Background" class="page-background" />
    <div class="page-content">
      <TopBar logo-position="left" />

      <div v-if="!isNativePlatform" class="native-banner">
        Scanner and gallery scanning work in the Cordova Android/iOS build.
      </div>

      <HomeGrid :sections="sections" @item-press="handlePress" />

      <BottomBar />
    </div>
  </div>
</template>

<script>
import bgImage from '../assets/images/BG.svg';
import { SECTIONS } from '../constants/constants';
import { barkoderService } from '../services/barkoderService';
import BottomBar from '../components/BottomBar.vue';
import HomeGrid from '../components/HomeGrid.vue';
import TopBar from '../components/TopBar.vue';

export default {
  name: 'HomeScreen',
  components: { BottomBar, HomeGrid, TopBar },
  data() {
    return {
      bgImage,
      sections: SECTIONS,
      isNativePlatform: barkoderService.isNativePlatform,
    };
  },
  methods: {
    handlePress(item) {
      if (item.action === 'url' && item.url) {
        window.open(item.url, '_blank', 'noopener,noreferrer');
        return;
      }

      this.$router.push(`/scanner/${item.mode}/${Date.now()}`);
    },
  },
};
</script>
