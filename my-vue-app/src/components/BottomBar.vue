<template>
  <div class="bottom-bar">
    <button class="bottom-tab" @click="$router.push('/history')">
      <img :src="iconRecent" alt="Recent" class="bottom-tab-icon" />
      <span class="bottom-tab-label">Recent</span>
    </button>

    <div class="bottom-tab-center">
      <button class="bottom-fab" aria-label="Start" @click="startAnyscan">
        <img :src="iconStart" alt="Start" class="bottom-fab-icon" />
      </button>
      <span class="bottom-tab-label">Anyscan</span>
    </div>

    <button class="bottom-tab" @click="$router.push('/about')">
      <img :src="iconInfo" alt="About" class="bottom-tab-icon" />
      <span class="bottom-tab-label">About</span>
    </button>
  </div>
</template>

<script>
import iconInfo from '../assets/icons/info.svg';
import iconRecent from '../assets/icons/recent.svg';
import iconStart from '../assets/icons/start.svg';
import { MODES } from '../constants/constants';

export default {
  name: 'BottomBar',
  data() {
    return { iconInfo, iconRecent, iconStart };
  },
  methods: {
    startAnyscan() {
      this.$router.push(`/scanner/${MODES.ANYSCAN}/${Date.now()}`);
    },
  },
};
</script>
