<template>
  <button
    class="pause-overlay"
    :class="{ 'pause-overlay-expanded': isSheetExpanded }"
    aria-label="Resume scanning"
    @click="$emit('resume')"
  >
    <img v-if="frozenImage" class="pause-preview-image" :src="frozenImage" alt="Last scanned frame" />
    <span class="pause-message">
      <img :src="touchIcon" alt="Touch" />
      <span>Tap anywhere to continue</span>
    </span>
  </button>
</template>

<script>
import touchIcon from '../assets/icons/touch_icon.svg';

export default {
  name: 'PauseOverlay',
  props: {
    isSheetExpanded: { type: Boolean, default: false },
    frozenImage: { type: String, default: null },
  },
  emits: ['resume'],
  data() {
    return { touchIcon };
  },
};
</script>
