<template>
  <div v-if="scannedItems.length && showResultSheet">
    <div class="result-sheet">
      <ResultSheetContent v-bind="contentProps" v-on="contentListeners" />
    </div>

    <div v-if="isExpanded" class="result-sheet-modal">
      <div class="result-sheet-modal-content">
        <ResultSheetContent v-bind="contentProps" v-on="contentListeners" />
      </div>
    </div>
  </div>
</template>

<script>
import ResultSheetContent from './ResultSheetContent.vue';

export default {
  name: 'ScannedResultSheet',
  components: { ResultSheetContent },
  props: {
    scannedItems: { type: Array, default: () => [] },
    lastScanCount: { type: Number, default: 0 },
    showResultSheet: { type: Boolean, default: true },
  },
  emits: ['copy', 'csv', 'details', 'close', 'expanded-change'],
  data() {
    return { isExpanded: false };
  },
  computed: {
    uniqueItems() {
      return this.scannedItems.reduce((acc, item) => {
        if (!acc.some((candidate) => candidate.text === item.text)) {
          acc.push(item);
        }
        return acc;
      }, []);
    },
    scanCount() {
      return this.lastScanCount > 0 ? this.lastScanCount : this.uniqueItems.length;
    },
    contentProps() {
      return {
        scannedItems: this.scannedItems,
        uniqueItems: this.uniqueItems,
        scanCount: this.scanCount,
        isExpanded: this.isExpanded,
      };
    },
    contentListeners() {
      return {
        copy: () => this.$emit('copy'),
        csv: () => this.$emit('csv'),
        details: (item) => this.$emit('details', item),
        close: () => this.$emit('close'),
        'toggle-expanded': () => this.toggleExpanded(),
      };
    },
  },
  methods: {
    toggleExpanded() {
      this.isExpanded = !this.isExpanded;
      this.$emit('expanded-change', this.isExpanded);
    },
  },
};
</script>
