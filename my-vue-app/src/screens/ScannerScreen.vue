<template>
  <div v-if="isGalleryMode" class="scanner-page scanner-page-gallery">
    <div ref="scannerEl" class="scanner-gallery-anchor" />
    <div v-if="isGalleryProcessing" class="gallery-processing-overlay" aria-label="Processing image">
      <div class="gallery-processing-spinner" />
    </div>
  </div>

  <div v-else class="scanner-page">
    <div v-if="showScannerUi" class="scanner-top-wrap">
      <TopBar v-if="!isSettingsOpen" transparent :on-menu-press="openSettings" :on-close="goBack" />
    </div>

    <div class="scanner-content-wrap" :class="{ 'scanner-content-loading': !isReady }">
      <div ref="scannerEl" class="scanner-native-surface" />

      <div v-if="!isNativePlatform" class="scanner-fallback">
        Native scanner preview is available in the Cordova Android/iOS build.
      </div>

      <div v-if="!isReady" class="scanner-loading-overlay" aria-label="Preparing scanner">
        <div class="gallery-processing-spinner" />
        <div class="scanner-loading-text">{{ statusMessage || 'Preparing scanner...' }}</div>
      </div>

      <PauseOverlay
        v-if="showScannerUi && isScanningPaused"
        :is-sheet-expanded="isResultSheetExpanded"
        :frozen-image="frozenImage"
        @resume="handleResumeScanning"
      />
    </div>

    <BottomControls
      v-if="showScannerUi"
      :active-barcode-text="activeBarcodeText"
      :zoom-level="zoomLevel"
      :is-flash-on="isFlashOn"
      :show-buttons="!isResultSheetOpen"
      @toggle-zoom="runSafely(toggleZoom)"
      @toggle-flash="runSafely(toggleFlash)"
      @toggle-camera="runSafely(toggleCamera)"
    />

    <div v-if="showScannerUi" class="scanner-bottom-wrap">
      <ScannedResultSheet
        :scanned-items="scannedItems"
        :last-scan-count="lastScanCount"
        :show-result-sheet="isResultSheetOpen"
        @copy="handleCopy"
        @csv="handleCsv"
        @details="handleDetails"
        @close="isResultSheetHidden = true"
        @expanded-change="(expanded) => (isResultSheetExpanded = expanded)"
      />
    </div>

    <UnifiedSettings
      v-if="showScannerUi"
      :visible="isSettingsOpen"
      :settings="settings"
      :enabled-types="enabledTypes"
      :mode="mode"
      @update-setting="(key, value) => runSafely(() => onUpdateSetting(key, value))"
      @toggle-type="(typeId, enabled) => runSafely(() => onToggleBarcodeType(typeId, enabled))"
      @enable-all="(enabled, category) => runSafely(() => onEnableAllBarcodeTypes(enabled, category))"
      @reset-config="runSafely(resetConfig)"
      @close="closeSettings"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Barkoder } from '../plugins/barkoder';
import { BARCODE_TYPES_1D, BARCODE_TYPES_2D, MODES } from '../constants/constants';
import { useScannerLogic } from '../composables/useScannerLogic';
import { setDetailsItem } from '../services/detailsStore';
import BottomControls from '../components/BottomControls.vue';
import PauseOverlay from '../components/PauseOverlay.vue';
import ScannedResultSheet from '../components/ScannedResultSheet.vue';
import TopBar from '../components/TopBar.vue';
import UnifiedSettings from '../components/UnifiedSettings.vue';

const ALL_TYPES = [...BARCODE_TYPES_1D, ...BARCODE_TYPES_2D];

const route = useRoute();
const router = useRouter();

const mode = route.params.mode ?? MODES.ANYSCAN;
const isGalleryMode = mode === MODES.GALLERY;

const scannerEl = ref(null);
const isSettingsOpen = ref(false);
const isResultSheetExpanded = ref(false);
const isResultSheetHidden = ref(false);

const {
  scannedItems,
  lastScanCount,
  enabledTypes,
  settings,
  isScanningPaused,
  frozenImage,
  isReady,
  isGalleryProcessing,
  galleryScanOutcome,
  statusMessage,
  isFlashOn,
  zoomLevel,
  isNativePlatform,
  initializeScanner,
  startScanning,
  onUpdateSetting,
  onToggleBarcodeType,
  onEnableAllBarcodeTypes,
  resetConfig,
  toggleFlash,
  toggleZoom,
  toggleCamera,
} = useScannerLogic(mode);

const showScannerUi = computed(() => !isGalleryMode && isReady.value);

const activeBarcodeText = computed(() =>
  ALL_TYPES.filter((item) => enabledTypes.value[item.id])
    .map((item) => item.label)
    .join(', '),
);

const isResultSheetOpen = computed(
  () => settings.showResultSheet !== false && scannedItems.value.length > 0 && !isResultSheetHidden.value,
);

const runSafely = (action) => {
  Promise.resolve()
    .then(action)
    .catch((error) => console.error(error));
};

const goBack = () => router.back();

const openSettings = () => {
  if (isReady.value) {
    Barkoder.stopScanning().catch(() => undefined);
  }
  isSettingsOpen.value = true;
};

const closeSettings = () => {
  isSettingsOpen.value = false;
  if (!isGalleryMode) {
    runSafely(startScanning);
  }
};

const handleResumeScanning = () => {
  isResultSheetHidden.value = true;
  isResultSheetExpanded.value = false;
  isScanningPaused.value = false;
  frozenImage.value = null;
  runSafely(startScanning);
};

const handleDetails = (item) => {
  setDetailsItem({ item, returnToHome: isGalleryMode });
  router.push('/details');
};

const handleCopy = async () => {
  if (!scannedItems.value.length) {
    return;
  }

  try {
    await navigator.clipboard.writeText(scannedItems.value.map((item) => item.text).join('\n'));
  } catch (error) {
    console.error('Failed to copy to clipboard', error);
  }
};

const handleCsv = () => {
  if (!scannedItems.value.length) {
    return;
  }

  const header = 'Barcode,Type\n';
  const rows = scannedItems.value
    .map((item) => `"${item.text.replace(/"/g, '""')}","${item.type}"`)
    .join('\n');

  const blob = new Blob([`${header}${rows}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'scanned_barcodes.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

watch(scannedItems, () => {
  isResultSheetHidden.value = false;
});

watch(galleryScanOutcome, (outcome) => {
  if (!isGalleryMode) {
    return;
  }

  if (outcome === 'success' && scannedItems.value.length > 0) {
    setDetailsItem({ item: scannedItems.value[0], returnToHome: true });
    router.push('/details');
    return;
  }

  if (outcome === 'empty') {
    window.alert('No barcode has been detected in the selected image.');
    router.replace('/');
    return;
  }

  if (outcome === 'cancelled') {
    router.replace('/');
  }
});

onMounted(() => {
  // The native view attaches against this element's bounds, so give the
  // browser a frame to lay it out before initializing.
  window.setTimeout(
    () => {
      if (scannerEl.value) {
        initializeScanner(scannerEl.value).catch((error) => console.error(error));
      }
    },
    isGalleryMode ? 0 : 150,
  );
});

onBeforeUnmount(() => {
  if (isReady.value) {
    Barkoder.stopScanning().catch(() => undefined);
  }
});
</script>
