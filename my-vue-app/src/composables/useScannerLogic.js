import { onUnmounted, reactive, ref, watch } from 'vue';
import {
  Barkoder,
  BarcodeType,
  BarkoderARHeaderShowMode,
  BarkoderARMode,
  BarkoderCameraPosition,
  BarkoderConfig,
  DekoderConfig,
} from '../plugins/barkoder';
import { HistoryService } from '../services/HistoryService';
import { SettingsService } from '../services/SettingsService';
import { barkoderService } from '../services/barkoderService';
import { pickGalleryImageAsBase64 } from '../services/galleryPicker';
import { BARCODE_TYPES_1D, BARCODE_TYPES_2D, MODES } from '../constants/constants';
import {
  createBarcodeConfig,
  getInitialEnabledTypes,
  getInitialSettings,
  normalizeEnabledTypesForMode,
  VIN_ALLOWED_TYPE_IDS,
} from '../utils/scannerConfig';

const ALL_TYPES = [...BARCODE_TYPES_1D, ...BARCODE_TYPES_2D];

const getConfigurableTypesForMode = (mode) => {
  if (mode === MODES.MRZ) {
    return ALL_TYPES.filter((barcodeType) => barcodeType.id === 'idDocument');
  }
  if (mode === MODES.VIN) {
    return ALL_TYPES.filter((barcodeType) => VIN_ALLOWED_TYPE_IDS.includes(barcodeType.id));
  }
  return ALL_TYPES.filter((barcodeType) => barcodeType.id !== 'ocrText' && barcodeType.id !== 'idDocument');
};

const toDataUrl = (value) => {
  if (!value) {
    return undefined;
  }
  return value.startsWith('data:') ? value : `data:image/jpeg;base64,${value}`;
};

export const useScannerLogic = (mode) => {
  const scannedItems = ref([]);
  const lastScanCount = ref(0);
  const enabledTypes = ref(getInitialEnabledTypes(mode));
  const settings = reactive(getInitialSettings(mode));
  const isScanningPaused = ref(false);
  const frozenImage = ref(null);
  const isReady = ref(false);
  const isGalleryProcessing = ref(false);
  const galleryScanOutcome = ref('idle');
  const statusMessage = ref('Preparing scanner...');
  const isFlashOn = ref(false);
  const zoomLevel = ref(1.0);
  const selectedCameraId = ref('back');

  let isSettingsHydrated = false;
  let isInitializing = false;
  let galleryFallbackTimer = null;
  let unsubscribeResults = null;

  const clearGalleryFallbackTimer = () => {
    if (galleryFallbackTimer !== null) {
      window.clearTimeout(galleryFallbackTimer);
      galleryFallbackTimer = null;
    }
  };

  const startScanning = async () => {
    if (!barkoderService.isNativePlatform || mode === MODES.GALLERY) {
      return;
    }
    try {
      await Barkoder.startScanning();
    } catch (error) {
      console.error('[ScannerFlow] startScanning failed', error);
    }
  };

  const applyDecoderConfig = async (types) => {
    const normalizedTypes = normalizeEnabledTypesForMode(mode, types);
    const decoderConfig = {};
    const configurableTypes = getConfigurableTypesForMode(mode).filter(
      (barcodeType) => !(mode === MODES.VIN && barcodeType.id === 'ocrText' && !normalizedTypes.ocrText),
    );

    configurableTypes.forEach((barcodeType) => {
      decoderConfig[barcodeType.id] = createBarcodeConfig(
        barcodeType.id,
        Boolean(normalizedTypes[barcodeType.id]),
      );
    });

    await Barkoder.configureBarkoder({
      barkoderConfig: new BarkoderConfig({
        decoder: new DekoderConfig(decoderConfig),
        imageResultEnabled: true,
        locationInImageResultEnabled: true,
        pinchToZoomEnabled: settings.pinchToZoom,
        locationInPreviewEnabled: settings.locationInPreview,
        regionOfInterestVisible: settings.regionOfInterest,
        beepOnSuccessEnabled: settings.beepOnSuccess,
        vibrateOnSuccessEnabled: settings.vibrateOnSuccess,
      }),
    });
  };

  const applyModeConfig = async () => {
    await Barkoder.setEnableComposite({ value: mode === MODES.ANYSCAN && settings.compositeMode ? 1 : 0 });
    await Barkoder.setUpcEanDeblurEnabled({ enabled: settings.scanBlurred });
    await Barkoder.setMisshaped1DEnabled({ enabled: settings.scanDeformed });
    await Barkoder.setDecodingSpeed({ value: settings.decodingSpeed });
    await Barkoder.setBarkoderResolution({ value: settings.resolution });
    await Barkoder.setCloseSessionOnResultEnabled({ enabled: !settings.continuousScanning });
    await Barkoder.setBarcodeThumbnailOnResultEnabled({ enabled: true });
    await Barkoder.setMaximumResultsCount({ value: 200 });

    if (settings.continuousScanning) {
      await Barkoder.setThresholdBetweenDuplicatesScans({ value: settings.continuousThreshold ?? 0 });
    }

    if (mode !== MODES.VIN) {
      await Barkoder.setBarcodeTypeEnabled({ type: BarcodeType.ocrText, enabled: false });
    }
    await Barkoder.setBarcodeTypeEnabled({ type: BarcodeType.idDocument, enabled: mode === MODES.MRZ });

    if (mode === MODES.MULTISCAN) {
      await Barkoder.setMulticodeCachingDuration({ value: 3000 });
      await Barkoder.setMulticodeCachingEnabled({ enabled: true });
    } else if (mode === MODES.VIN) {
      try {
        await Barkoder.setBarcodeTypeEnabled({
          type: BarcodeType.ocrText,
          enabled: enabledTypes.value.ocrText,
        });
        await Barkoder.setCustomOption({
          option: 'enable_ocr_functionality',
          value: enabledTypes.value.ocrText ? 1 : 0,
        });
      } catch (error) {
        console.warn('VIN OCR could not be configured. Continuing with barcode scanning only.', error);
      }
      await Barkoder.setEnableVINRestrictions({ value: true });
      await Barkoder.setRegionOfInterest({ left: 0, top: 35, width: 100, height: 30 });
    } else if (mode === MODES.DPM) {
      await Barkoder.setBarcodeTypeEnabled({ type: BarcodeType.datamatrix, enabled: true });
      await Barkoder.setDatamatrixDpmModeEnabled({ enabled: true });
      await Barkoder.setRegionOfInterest({ left: 40, top: 40, width: 20, height: 10 });
    } else if (mode === MODES.AR_MODE) {
      await Barkoder.setARMode({ value: BarkoderARMode.interactiveEnabled });
      await Barkoder.setARSelectedLocationColor({ value: '#00FF00' });
      await Barkoder.setARNonSelectedLocationColor({ value: '#FF0000' });
      await Barkoder.setARHeaderShowMode({ value: BarkoderARHeaderShowMode.onSelected });
    } else if (mode === MODES.DOTCODE) {
      await Barkoder.setBarcodeTypeEnabled({ type: BarcodeType.dotcode, enabled: true });
      await Barkoder.setRegionOfInterest({ left: 30, top: 40, width: 40, height: 9 });
    }
  };

  const scanImagePressed = async () => {
    if (!barkoderService.isNativePlatform) {
      return;
    }

    try {
      clearGalleryFallbackTimer();
      galleryScanOutcome.value = 'idle';

      const base64 = await pickGalleryImageAsBase64();
      if (!base64) {
        isGalleryProcessing.value = false;
        galleryScanOutcome.value = 'cancelled';
        return;
      }

      isGalleryProcessing.value = true;

      const ready = await barkoderService.ensureImageScanReady();
      if (!ready) {
        isGalleryProcessing.value = false;
        galleryScanOutcome.value = 'cancelled';
        return;
      }

      await applyDecoderConfig(enabledTypes.value);
      await applyModeConfig();
      await Barkoder.scanImage({ base64 });

      galleryFallbackTimer = window.setTimeout(() => {
        if (isGalleryProcessing.value) {
          isGalleryProcessing.value = false;
          galleryScanOutcome.value = 'empty';
        }
      }, 3000);
    } catch (error) {
      console.error('Error scanning image from gallery', error);
      clearGalleryFallbackTimer();
      isGalleryProcessing.value = false;
      galleryScanOutcome.value = 'cancelled';
    }
  };

  const initializeScanner = async (container, options) => {
    if (isInitializing) {
      return;
    }
    isInitializing = true;

    try {
      statusMessage.value = 'Preparing scanner...';

      if (!barkoderService.isNativePlatform) {
        isReady.value = true;
        return;
      }

      if (mode === MODES.GALLERY) {
        statusMessage.value = '';
        isReady.value = true;
        if (options?.autoStart ?? true) {
          await scanImagePressed();
        }
        return;
      }

      const ready = await barkoderService.ensureReady(container);
      if (!ready) {
        statusMessage.value = 'Camera permission is required to start scanning.';
        isReady.value = false;
        return;
      }

      await applyDecoderConfig(enabledTypes.value);
      await applyModeConfig();

      statusMessage.value = '';
      isReady.value = true;

      if (options?.autoStart ?? true) {
        await startScanning();
      }
    } catch (error) {
      console.error('Failed to initialize scanner', error);
      statusMessage.value = 'Failed to initialize scanner.';
      isReady.value = false;
    } finally {
      isInitializing = false;
    }
  };

  const applySettings = async () => {
    await Barkoder.setImageResultEnabled({ enabled: true });
    await Barkoder.setBarcodeThumbnailOnResultEnabled({ enabled: true });
    await Barkoder.setEnableComposite({
      value: mode === MODES.ANYSCAN && settings.compositeMode ? 1 : 0,
    });
    await Barkoder.setPinchToZoomEnabled({ enabled: settings.pinchToZoom });
    await Barkoder.setLocationInPreviewEnabled({ enabled: settings.locationInPreview });
    await Barkoder.setRegionOfInterestVisible({ value: settings.regionOfInterest });

    if (settings.regionOfInterest && mode !== MODES.VIN && mode !== MODES.DPM) {
      await Barkoder.setRegionOfInterest({ left: 5, top: 5, width: 90, height: 90 });
    }

    await Barkoder.setBeepOnSuccessEnabled({ enabled: settings.beepOnSuccess });
    await Barkoder.setVibrateOnSuccessEnabled({ enabled: settings.vibrateOnSuccess });
    await Barkoder.setUpcEanDeblurEnabled({ enabled: settings.scanBlurred });
    await Barkoder.setMisshaped1DEnabled({ enabled: settings.scanDeformed });
    await Barkoder.setCloseSessionOnResultEnabled({ enabled: !settings.continuousScanning });
    await Barkoder.setDecodingSpeed({ value: settings.decodingSpeed });
    await Barkoder.setBarkoderResolution({ value: settings.resolution });

    if (settings.continuousScanning) {
      await Barkoder.setThresholdBetweenDuplicatesScans({ value: settings.continuousThreshold ?? 0 });
    }
  };

  const onUpdateSetting = async (key, value) => {
    settings[key] = value;

    if (!isReady.value || !barkoderService.isNativePlatform) {
      return;
    }

    try {
      switch (key) {
        case 'compositeMode':
          await Barkoder.setEnableComposite({ value: mode === MODES.ANYSCAN && value ? 1 : 0 });
          break;
        case 'pinchToZoom':
          await Barkoder.setPinchToZoomEnabled({ enabled: value });
          break;
        case 'locationInPreview':
          await Barkoder.setLocationInPreviewEnabled({ enabled: value });
          break;
        case 'regionOfInterest':
          await Barkoder.setRegionOfInterestVisible({ value });
          if (value && mode !== MODES.VIN && mode !== MODES.DPM) {
            await Barkoder.setRegionOfInterest({ left: 5, top: 5, width: 90, height: 90 });
          }
          break;
        case 'beepOnSuccess':
          await Barkoder.setBeepOnSuccessEnabled({ enabled: value });
          break;
        case 'vibrateOnSuccess':
          await Barkoder.setVibrateOnSuccessEnabled({ enabled: value });
          break;
        case 'scanBlurred':
          await Barkoder.setUpcEanDeblurEnabled({ enabled: value });
          break;
        case 'scanDeformed':
          await Barkoder.setMisshaped1DEnabled({ enabled: value });
          break;
        case 'continuousScanning':
          await Barkoder.setCloseSessionOnResultEnabled({ enabled: !value });
          isScanningPaused.value = false;
          frozenImage.value = null;
          await Barkoder.stopScanning();
          await startScanning();
          break;
        case 'decodingSpeed':
          await Barkoder.setDecodingSpeed({ value });
          break;
        case 'resolution':
          await Barkoder.setBarkoderResolution({ value });
          break;
        case 'arMode':
          await Barkoder.setARMode({ value });
          break;
        case 'arLocationType':
          await Barkoder.setARLocationType({ value });
          break;
        case 'arHeaderShowMode':
          await Barkoder.setARHeaderShowMode({ value });
          break;
        case 'arOverlayRefresh':
          await Barkoder.setAROverlayRefresh({ value });
          break;
        case 'arDoubleTapToFreeze':
          await Barkoder.setARDoubleTapToFreezeEnabled({ enabled: value });
          break;
        case 'continuousThreshold':
          await Barkoder.setThresholdBetweenDuplicatesScans({ value });
          if (settings.continuousScanning) {
            await Barkoder.stopScanning();
            await startScanning();
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Failed to apply setting "${key}"`, error);
    }
  };

  const onToggleBarcodeType = async (typeId, enabled) => {
    if (typeId === 'ocrText' && mode !== MODES.VIN) {
      return;
    }
    if (typeId === 'idDocument' && mode !== MODES.MRZ) {
      return;
    }
    if (mode === MODES.MRZ && typeId !== 'idDocument') {
      return;
    }

    const nextEnabledTypes = normalizeEnabledTypesForMode(mode, {
      ...enabledTypes.value,
      [typeId]: enabled,
    });
    enabledTypes.value = nextEnabledTypes;

    if (!isReady.value || !barkoderService.isNativePlatform) {
      return;
    }

    try {
      await applyDecoderConfig(nextEnabledTypes);

      if (typeId === 'ocrText' && mode === MODES.VIN) {
        await Barkoder.setBarcodeTypeEnabled({ type: BarcodeType.ocrText, enabled });
        await Barkoder.setCustomOption({ option: 'enable_ocr_functionality', value: enabled ? 1 : 0 });
      }
    } catch (error) {
      console.error('Failed to toggle barcode type', error);
    }
  };

  const onEnableAllBarcodeTypes = async (enabled, category) => {
    const categoryTypes = category === '1D' ? BARCODE_TYPES_1D : BARCODE_TYPES_2D;
    const nextEnabledTypes = { ...enabledTypes.value };

    getConfigurableTypesForMode(mode)
      .filter((barcodeType) => categoryTypes.some((item) => item.id === barcodeType.id))
      .forEach((barcodeType) => {
        nextEnabledTypes[barcodeType.id] = enabled;
      });

    enabledTypes.value = normalizeEnabledTypesForMode(mode, nextEnabledTypes);

    if (isReady.value && barkoderService.isNativePlatform) {
      try {
        await applyDecoderConfig(enabledTypes.value);
      } catch (error) {
        console.error('Failed to enable all barcode types', error);
      }
    }
  };

  const resetConfig = async () => {
    Object.assign(settings, getInitialSettings(mode));
    enabledTypes.value = getInitialEnabledTypes(mode);

    if (isReady.value && barkoderService.isNativePlatform) {
      try {
        await applySettings();
        await applyDecoderConfig(enabledTypes.value);
      } catch (error) {
        console.error('Failed to reset configuration', error);
      }
    }
  };

  const resetSession = () => {
    scannedItems.value = [];
    lastScanCount.value = 0;
    isScanningPaused.value = false;
    frozenImage.value = null;
    clearGalleryFallbackTimer();
    isGalleryProcessing.value = false;
    galleryScanOutcome.value = 'idle';
  };

  const toggleFlash = async () => {
    isFlashOn.value = !isFlashOn.value;
    await Barkoder.setFlashEnabled({ enabled: isFlashOn.value });
  };

  const toggleZoom = async () => {
    zoomLevel.value = zoomLevel.value === 1.0 ? 1.5 : 1.0;
    await Barkoder.setZoomFactor({ value: zoomLevel.value });
  };

  const toggleCamera = async () => {
    selectedCameraId.value = selectedCameraId.value === 'back' ? 'front' : 'back';
    await Barkoder.setCamera({
      value: selectedCameraId.value === 'back' ? BarkoderCameraPosition.BACK : BarkoderCameraPosition.FRONT,
    });
  };

  const handleResult = async (result) => {
    if (mode === MODES.GALLERY) {
      clearGalleryFallbackTimer();
    }

    if (!result.decoderResults || result.decoderResults.length === 0) {
      if (mode === MODES.GALLERY) {
        isGalleryProcessing.value = false;
        galleryScanOutcome.value = 'empty';
      }
      return;
    }

    const shouldPause = !settings.continuousScanning && mode !== MODES.GALLERY;

    if (shouldPause) {
      Barkoder.pauseScanning().catch(() => undefined);
      isScanningPaused.value = true;
    }

    const fullImage = toDataUrl(result.resultImageAsBase64);
    const thumbnail = result.resultThumbnailsAsBase64?.[0];
    const fallbackImage = toDataUrl(thumbnail) ?? fullImage;

    const newItems = result.decoderResults.map((decoded) => ({
      text: decoded.textualData,
      type: decoded.barcodeTypeName,
      image: fallbackImage,
    }));

    newItems.forEach((item) => {
      HistoryService.addScan(item);
    });

    scannedItems.value = [...newItems, ...scannedItems.value];
    lastScanCount.value = newItems.length;

    if (mode === MODES.GALLERY) {
      isGalleryProcessing.value = false;
      galleryScanOutcome.value = 'success';
    }

    if (shouldPause) {
      frozenImage.value = fullImage ?? fallbackImage ?? null;
    }
  };

  const hydrateSavedSettings = async () => {
    const saved = await SettingsService.getSettings(mode);

    if (saved?.enabledTypes) {
      const merged =
        mode === MODES.GALLERY
          ? getInitialEnabledTypes(mode)
          : { ...getInitialEnabledTypes(mode), ...saved.enabledTypes };
      if (mode === MODES.VIN) {
        merged.ocrText = true;
      }
      enabledTypes.value = normalizeEnabledTypesForMode(mode, merged);
    }

    if (saved?.scannerSettings) {
      Object.assign(settings, { ...getInitialSettings(mode), ...saved.scannerSettings });
    }

    isSettingsHydrated = true;
  };

  let saveTimer = null;
  const scheduleSave = () => {
    if (!isSettingsHydrated) {
      return;
    }
    if (saveTimer !== null) {
      window.clearTimeout(saveTimer);
    }
    saveTimer = window.setTimeout(() => {
      SettingsService.saveSettings(mode, {
        enabledTypes: enabledTypes.value,
        scannerSettings: { ...settings },
      });
    }, 300);
  };

  watch(enabledTypes, scheduleSave, { deep: true });
  watch(settings, scheduleSave, { deep: true });

  hydrateSavedSettings();

  barkoderService.subscribeResults((result) => {
    handleResult(result);
  }).then((unsubscribe) => {
    unsubscribeResults = unsubscribe;
  });

  onUnmounted(() => {
    clearGalleryFallbackTimer();
    if (saveTimer !== null) {
      window.clearTimeout(saveTimer);
    }
    if (unsubscribeResults) {
      unsubscribeResults();
    }
  });

  return {
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
    selectedCameraId,
    isNativePlatform: barkoderService.isNativePlatform,
    initializeScanner,
    startScanning,
    scanImagePressed,
    onUpdateSetting,
    onToggleBarcodeType,
    onEnableAllBarcodeTypes,
    resetConfig,
    resetSession,
    toggleFlash,
    toggleZoom,
    toggleCamera,
  };
};
