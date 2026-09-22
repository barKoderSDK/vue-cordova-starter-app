<template>
  <div class="topbar">
    <div class="topbar-side">
      <img v-if="logoPosition === 'left'" :src="logoSrc" alt="barKoder" class="topbar-logo" />
      <button v-else-if="onClose" class="icon-button" aria-label="Close" @click="onClose">
        <svg viewBox="0 0 24 24" width="28" height="28" :fill="iconColor">
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
    </div>

    <img v-if="logoPosition !== 'left'" :src="logoSrc" alt="barKoder" class="topbar-logo" />

    <div class="topbar-side topbar-side-right">
      <button v-if="onMenuPress" class="icon-button" aria-label="Settings" @click="onMenuPress">
        <svg viewBox="0 0 24 24" width="28" height="28" :fill="iconColor">
          <path d="M19.14 12.94a7.07 7.07 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.62l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.58.24-1.12.56-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.67 8.86a.5.5 0 0 0 .12.62l2.03 1.58a7.07 7.07 0 0 0 0 1.88l-2.03 1.58a.5.5 0 0 0-.12.62l1.92 3.32c.13.22.39.31.6.22l2.39-.96c.5.38 1.04.7 1.62.94l.36 2.54c.04.24.25.42.5.42h3.84c.25 0 .46-.18.5-.42l.36-2.54c.58-.24 1.12-.56 1.62-.94l2.39.96c.22.09.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.62zM12 15.6A3.6 3.6 0 1 1 15.6 12 3.6 3.6 0 0 1 12 15.6z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import logoBarkoder from '../assets/images/logo_barkoder.svg';
import logoBarkoderWhite from '../assets/images/logo_barkoder_white.svg';

export default {
  name: 'TopBar',
  props: {
    onMenuPress: { type: Function, default: null },
    onClose: { type: Function, default: null },
    logoPosition: { type: String, default: 'center' },
    transparent: { type: Boolean, default: false },
  },
  computed: {
    iconColor() {
      return this.transparent ? '#ffffff' : '#000000';
    },
    logoSrc() {
      return this.transparent ? logoBarkoderWhite : logoBarkoder;
    },
  },
};
</script>
