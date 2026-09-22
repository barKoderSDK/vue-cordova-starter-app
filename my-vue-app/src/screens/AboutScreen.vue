<template>
  <div class="page">
    <img :src="bgImage" alt="Background" class="page-background" />

    <div class="page-content">
      <header class="about-header">
        <button class="icon-button" aria-label="Back" @click="$router.back()">
          <img :src="chevron" alt="Back" class="chevron-icon" />
        </button>
        <img :src="logoBarkoder" alt="barKoder" class="about-logo" />
      </header>

      <div class="about-scroll">
        <section class="about-card">
          <h2>Barcode Scanner SDK by barKoder</h2>
          <p>
            <a href="https://barkoder.com/" target="_blank" rel="noreferrer">
              Barcode Scanner Demo by barKoder
            </a>
            showcases the enterprise-grade performance of the barKoder Barcode Scanner SDK along with
            most of its features in a wide variety of scanning scenarios.
          </p>
          <p>
            Whether from
            <a href="https://barkoder.com/barcode-types#1D-barcodes" target="_blank" rel="noreferrer">
              One-Dimensional
            </a>
            or
            <a href="https://barkoder.com/barcode-types#2D-barcodes" target="_blank" rel="noreferrer">
              Two-Dimensional
            </a>
            barcodes, the barKoder API captures data reliably and quickly.
          </p>
          <a href="https://barkoder.com/trial" target="_blank" rel="noreferrer" class="about-cta">
            Get a free trial demo
          </a>
        </section>

        <section class="about-card">
          <h2>Info</h2>
          <div class="about-info-row">
            <span>Device ID</span>
            <span>{{ deviceId || '-' }}</span>
          </div>
          <div class="about-divider" />
          <div class="about-info-row">
            <span>App Version</span>
            <span class="about-accent">1.0.0</span>
          </div>
          <div class="about-divider" />
          <div class="about-info-row">
            <span>SDK Version</span>
            <span>{{ sdkVersion }}</span>
          </div>
          <div class="about-divider" />
          <div class="about-info-row">
            <span>Lib Version</span>
            <span>{{ libVersion }}</span>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import bgImage from '../assets/images/BG.svg';
import chevron from '../assets/icons/chevron.svg';
import logoBarkoder from '../assets/images/logo_barkoder.svg';
import { Barkoder } from '../plugins/barkoder';
import { barkoderService } from '../services/barkoderService';
import { getDeviceIdentifier } from '../services/galleryPicker';

export default {
  name: 'AboutScreen',
  data() {
    return {
      bgImage,
      chevron,
      logoBarkoder,
      deviceId: '',
      sdkVersion: '1.7.2',
      libVersion: 'Vue 3',
    };
  },
  async mounted() {
    this.deviceId = getDeviceIdentifier();

    if (!barkoderService.isNativePlatform) {
      return;
    }

    try {
      const sdk = await Barkoder.getVersion();
      const lib = await Barkoder.getLibVersion();
      this.sdkVersion = String(sdk.version ?? '1.7.2');
      this.libVersion = String(lib.libVersion ?? 'unknown');
    } catch (error) {
      console.error(error);
    }
  },
};
</script>
