<template>
  <div class="page">
    <img :src="bgImage" alt="Background" class="page-background" />
    <div class="page-content">
      <header class="screen-header">
        <button class="icon-button" aria-label="Back" @click="$router.back()">
          <img :src="chevron" alt="Back" class="chevron-icon" />
        </button>
        <h1>Recent Scans</h1>
      </header>

      <div v-if="isLoading" class="loading-wrap">Loading...</div>

      <div v-else class="history-scroll">
        <section v-for="group in groupedHistory" :key="group.date" class="history-section">
          <h2 class="history-date">{{ group.date }}</h2>

          <div v-for="(item, index) in group.items" :key="`${item.text}-${index}`" class="history-item">
            <div class="history-item-left">
              <img v-if="item.image" :src="item.image" alt="Scanned" class="history-thumb" />
              <div v-else class="history-thumb history-thumb-placeholder">
                <img :src="is1D(item.type) ? icon1D : icon2D" alt="Barcode type" />
              </div>

              <div>
                <p class="history-text">{{ item.text }}</p>
                <p class="history-type">{{ item.type }}</p>
              </div>
            </div>

            <div class="history-item-right">
              <span v-if="item.count > 1">({{ item.count }})</span>
              <button class="icon-button" aria-label="Details" @click="openDetails(item)">
                <img :src="iconInfo" alt="Details" class="bottom-tab-icon" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import bgImage from '../assets/images/BG.svg';
import chevron from '../assets/icons/chevron.svg';
import icon1D from '../assets/icons/icon_1d.svg';
import icon2D from '../assets/icons/icon_2d.svg';
import iconInfo from '../assets/icons/info.svg';
import { HistoryService } from '../services/HistoryService';
import { is1D } from '../utils/barcodeUtils';
import { setDetailsItem } from '../services/detailsStore';

export default {
  name: 'RecentScanScreen',
  data() {
    return {
      bgImage,
      chevron,
      icon1D,
      icon2D,
      iconInfo,
      history: [],
      isLoading: true,
    };
  },
  computed: {
    groupedHistory() {
      const groups = new Map();

      this.history.forEach((item) => {
        const date = new Date(item.timestamp).toLocaleDateString('en-GB');
        if (!groups.has(date)) {
          groups.set(date, []);
        }
        groups.get(date).push(item);
      });

      return Array.from(groups, ([date, items]) => ({ date, items }));
    },
  },
  async mounted() {
    this.history = await HistoryService.getHistory();
    this.isLoading = false;
  },
  methods: {
    is1D,
    openDetails(item) {
      setDetailsItem({ item });
      this.$router.push('/details');
    },
  },
};
</script>
