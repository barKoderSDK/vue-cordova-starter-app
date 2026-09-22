<template>
  <div class="page">
    <img :src="bgImage" alt="Background" class="page-background" />

    <div v-if="!item" class="page-content centered">
      <p>No barcode selected.</p>
      <button class="about-cta" @click="goBack">Go Back</button>
    </div>

    <div v-else class="page-content">
      <header class="screen-header">
        <button class="icon-button" aria-label="Back" @click="goBack">
          <img :src="chevron" alt="Back" class="chevron-icon" />
        </button>
        <h1>Barcode Details</h1>
      </header>

      <div class="details-scroll">
        <div class="details-image-card">
          <img v-if="item.image" :src="item.image" alt="Scanned barcode" class="details-image" />
          <div v-else class="details-placeholder">
            <img :src="is1D(item.type) ? icon1D : icon2D" alt="Barcode type" />
          </div>
        </div>

        <p class="details-section-label">DATA</p>

        <div v-for="detail in details" :key="detail.id" class="details-info-card">
          <span>{{ detail.label }}</span>
          <span :class="{ 'details-value-multiline': detail.multiline }">{{ detail.value }}</span>
        </div>
      </div>

      <div class="details-bottom-bar">
        <button class="result-action" @click="copyText">
          <img :src="iconCopy" alt="Copy" />
          <span>Copy</span>
        </button>
        <button class="result-action" @click="searchText">
          <img :src="iconSearch" alt="Search" />
          <span>Search</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import bgImage from '../assets/images/BG.svg';
import chevron from '../assets/icons/chevron.svg';
import icon1D from '../assets/icons/icon_1d.svg';
import icon2D from '../assets/icons/icon_2d.svg';
import iconCopy from '../assets/icons/icon_copy.svg';
import iconSearch from '../assets/icons/icon_search.svg';
import { is1D, parseMrzData } from '../utils/barcodeUtils';
import { consumeDetailsItem } from '../services/detailsStore';

export default {
  name: 'BarcodeDetailsScreen',
  data() {
    const payload = consumeDetailsItem();
    return {
      bgImage,
      chevron,
      icon1D,
      icon2D,
      iconCopy,
      iconSearch,
      item: payload?.item ?? null,
      returnToHome: Boolean(payload?.returnToHome),
    };
  },
  computed: {
    details() {
      if (!this.item) {
        return [];
      }

      if (this.item.type.toLowerCase() === 'mrz') {
        return [{ id: 'type', label: 'Barcode Type', value: this.item.type }, ...parseMrzData(this.item.text)];
      }

      return [
        { id: 'type', label: 'Barcode Type', value: this.item.type },
        { id: 'value', label: 'Value', value: this.item.text, multiline: true },
      ];
    },
  },
  methods: {
    is1D,
    goBack() {
      if (this.returnToHome) {
        this.$router.replace('/');
        return;
      }
      this.$router.back();
    },
    async copyText() {
      try {
        await navigator.clipboard.writeText(this.item.text);
      } catch (error) {
        console.error('Failed to copy to clipboard', error);
      }
    },
    searchText() {
      const url = `https://www.google.com/search?q=${encodeURIComponent(this.item.text)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    },
  },
};
</script>
