<template>
  <div class="scanner-controls-wrap">
    <div v-if="activeBarcodeText" class="scanner-types-pill">{{ activeBarcodeText }}</div>

    <div v-if="showButtons" class="scanner-controls-row">
      <button class="scanner-control-btn" @click="$emit('toggle-zoom')">
        <img :src="zoomLevel === 1 ? zoomIn : zoomOut" alt="Zoom" />
      </button>

      <button class="scanner-control-btn" @click="$emit('toggle-flash')">
        <img :src="isFlashOn ? flashOff : flashOn" alt="Flash" />
      </button>

      <button class="scanner-control-btn" @click="$emit('toggle-camera')">
        <img :src="cameraSwitch" alt="Camera" />
      </button>
    </div>
  </div>
</template>

<script>
import cameraSwitch from '../assets/icons/camera_switch.svg';
import flashOff from '../assets/icons/flash_off.svg';
import flashOn from '../assets/icons/flash_on.svg';
import zoomIn from '../assets/icons/zoom_in.svg';
import zoomOut from '../assets/icons/zoom_out.svg';

export default {
  name: 'BottomControls',
  props: {
    activeBarcodeText: { type: String, default: '' },
    zoomLevel: { type: Number, default: 1 },
    isFlashOn: { type: Boolean, default: false },
    showButtons: { type: Boolean, default: true },
  },
  emits: ['toggle-zoom', 'toggle-flash', 'toggle-camera'],
  data() {
    return { cameraSwitch, flashOff, flashOn, zoomIn, zoomOut };
  },
};
</script>
