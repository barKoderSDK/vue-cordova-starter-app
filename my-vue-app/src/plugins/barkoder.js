// Promise-based wrapper around the callback-style Cordova Barkoder plugin,
// which clobbers itself onto window.Barkoder once `deviceready` has fired.

export const DecodingSpeed = {
  fast: 0,
  normal: 1,
  slow: 2,
  rigorous: 3,
};

export const BarkoderCameraPosition = {
  BACK: 0,
  FRONT: 1,
};

export const BarkoderResolution = {
  HD: 0,
  FHD: 1,
  UHD: 2,
};

export const BarcodeType = {
  aztec: 0,
  aztecCompact: 1,
  qr: 2,
  qrMicro: 3,
  code128: 4,
  code93: 5,
  code39: 6,
  codabar: 7,
  code11: 8,
  msi: 9,
  upcA: 10,
  upcE: 11,
  upcE1: 12,
  ean13: 13,
  ean8: 14,
  pdf417: 15,
  pdf417Micro: 16,
  datamatrix: 17,
  code25: 18,
  interleaved25: 19,
  itf14: 20,
  iata25: 21,
  matrix25: 22,
  datalogic25: 23,
  coop25: 24,
  code32: 25,
  telepen: 26,
  dotcode: 27,
  idDocument: 28,
  databar14: 29,
  databarLimited: 30,
  databarExpanded: 31,
  postalIMB: 32,
  postnet: 33,
  planet: 34,
  australianPost: 35,
  royalMail: 36,
  kix: 37,
  japanesePost: 38,
  maxiCode: 39,
  ocrText: 40,
};

export const BarkoderARMode = {
  off: 0,
  interactiveDisabled: 1,
  interactiveEnabled: 2,
  nonInteractive: 3,
};

export const BarkoderAROverlayRefresh = {
  smooth: 0,
  normal: 1,
};

export const BarkoderARLocationType = {
  none: 0,
  tight: 1,
  boundingBox: 2,
};

export const BarkoderARHeaderShowMode = {
  never: 0,
  always: 1,
  onSelected: 2,
};

export const IdDocumentMasterChecksumType = {
  disabled: 0,
  enabled: 1,
};

export class BarkoderConfig {
  constructor(config) {
    Object.assign(this, config);
  }
}

export class DekoderConfig {
  constructor(config) {
    Object.assign(this, config);
  }
}

export class BarcodeConfig {
  constructor(config) {
    Object.assign(this, config);
  }
}

export class BarcodeConfigWithLength {
  constructor(config) {
    Object.assign(this, config);
  }
}

export class BarcodeConfigWithDpmMode {
  constructor(config) {
    Object.assign(this, config);
  }
}

export class Code39BarcodeConfig {
  constructor(config) {
    Object.assign(this, config);
  }
}

export class IdDocumentBarcodeConfig {
  constructor(config) {
    Object.assign(this, config);
  }
}

const convertToBase64 = (data) => {
  if (!data) {
    return null;
  }
  return data.startsWith('data:') ? data : `data:image/jpeg;base64,${data}`;
};

export class DecoderResult {
  constructor(resultMap) {
    this.barcodeType = Number(resultMap.barcodeType ?? -1);
    this.barcodeTypeName = String(resultMap.barcodeTypeName ?? '');
    this.textualData = String(resultMap.textualData ?? '');
    this.locationPoints = Array.isArray(resultMap.locationPoints) ? resultMap.locationPoints : undefined;
  }
}

export class BarkoderResult {
  constructor(resultMap) {
    const decoderResultsRaw = resultMap.decoderResults;
    this.decoderResults = Array.isArray(decoderResultsRaw)
      ? decoderResultsRaw.map((result) => new DecoderResult(result))
      : [];

    const thumbnails = resultMap.resultThumbnailsAsBase64;
    this.resultThumbnailsAsBase64 = Array.isArray(thumbnails)
      ? thumbnails.map((thumbnail) => convertToBase64(thumbnail)).filter((thumbnail) => thumbnail !== null)
      : null;

    this.resultImageAsBase64 = convertToBase64(resultMap.resultImageAsBase64);
  }
}

const resultEventSubscribers = new Set();
const closeEventSubscribers = new Set();

const getPlugin = () => {
  const plugin = window.Barkoder;
  if (!plugin) {
    throw new Error('Cordova Barkoder plugin is not available.');
  }
  return plugin;
};

const normalizeError = (error) => {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === 'string') {
    return new Error(error);
  }
  return new Error('Unknown Barkoder error');
};

const invoke = (method, args = []) =>
  new Promise((resolve, reject) => {
    try {
      const plugin = getPlugin();
      const nativeMethod = plugin[method];

      if (typeof nativeMethod !== 'function') {
        reject(new Error(`Barkoder method "${method}" is not available.`));
        return;
      }

      nativeMethod(
        ...args,
        (value) => resolve(value),
        (error) => reject(normalizeError(error)),
      );
    } catch (error) {
      reject(normalizeError(error));
    }
  });

const emitResultEvent = (rawPayload) => {
  try {
    const result = rawPayload instanceof BarkoderResult ? rawPayload : new BarkoderResult(rawPayload ?? {});
    resultEventSubscribers.forEach((subscriber) => subscriber(result));
  } catch (error) {
    console.error('Failed to parse Barkoder result payload', error);
  }
};

// Scanning stays open and streams results through the success callback, so the
// promise resolves on the next tick rather than waiting for a first scan.
const startStreamingCall = (run) =>
  new Promise((resolve, reject) => {
    try {
      let settled = false;
      const settle = (fn, value) => {
        if (!settled) {
          settled = true;
          fn(value);
        }
      };

      run(
        (payload) => {
          emitResultEvent(payload);
          settle(resolve);
        },
        (error) => {
          if (settled) {
            console.error('Barkoder scanning error', error);
            return;
          }
          settle(reject, normalizeError(error));
        },
      );

      if (!settled) {
        settled = true;
        window.setTimeout(resolve, 0);
      }
    } catch (error) {
      reject(normalizeError(error));
    }
  });

export const Barkoder = {
  addListener(eventName, listener) {
    const subscribers = eventName === 'barkoderResultEvent' ? resultEventSubscribers : closeEventSubscribers;
    subscribers.add(listener);
    return Promise.resolve({
      remove: async () => {
        subscribers.delete(listener);
      },
    });
  },

  initialize({ width, height, x, y }) {
    return invoke('initialize', [width, height, x, y]);
  },

  registerWithLicenseKey({ licenseKey }) {
    return invoke('registerWithLicenseKey', [licenseKey]);
  },

  startScanning() {
    return startStreamingCall((success, error) => getPlugin().startScanning(success, error));
  },

  scanImage({ base64 }) {
    return startStreamingCall((success, error) => getPlugin().scanImage(base64, success, error));
  },

  stopScanning() {
    return invoke('stopScanning');
  },

  pauseScanning() {
    return invoke('pauseScanning');
  },

  configureBarkoder({ barkoderConfig }) {
    return invoke('configureBarkoder', [barkoderConfig]);
  },

  setZoomFactor({ value }) {
    return invoke('setZoomFactor', [value]);
  },

  setFlashEnabled({ enabled }) {
    return invoke('setFlashEnabled', [enabled]);
  },

  setCloseSessionOnResultEnabled({ enabled }) {
    return invoke('setCloseSessionOnResultEnabled', [enabled]);
  },

  setImageResultEnabled({ enabled }) {
    return invoke('setImageResultEnabled', [enabled]);
  },

  setLocationInImageResultEnabled({ enabled }) {
    return invoke('setLocationInImageResultEnabled', [enabled]);
  },

  setRegionOfInterest({ left, top, width, height }) {
    return invoke('setRegionOfInterest', [left, top, width, height]);
  },

  setLocationInPreviewEnabled({ enabled }) {
    return invoke('setLocationInPreviewEnabled', [enabled]);
  },

  setPinchToZoomEnabled({ enabled }) {
    return invoke('setPinchToZoomEnabled', [enabled]);
  },

  setRegionOfInterestVisible({ value }) {
    return invoke('setRegionOfInterestVisible', [value]);
  },

  setBarkoderResolution({ value }) {
    return invoke('setBarkoderResolution', [value]);
  },

  setBeepOnSuccessEnabled({ enabled }) {
    return invoke('setBeepOnSuccessEnabled', [enabled]);
  },

  setVibrateOnSuccessEnabled({ enabled }) {
    return invoke('setVibrateOnSuccessEnabled', [enabled]);
  },

  setDecodingSpeed({ value }) {
    return invoke('setDecodingSpeed', [value]);
  },

  setBarcodeTypeEnabled({ type, enabled }) {
    return invoke('setBarcodeTypeEnabled', [type, enabled]);
  },

  setMulticodeCachingEnabled({ enabled }) {
    return invoke('setMulticodeCachingEnabled', [enabled]);
  },

  setMulticodeCachingDuration({ value }) {
    return invoke('setMulticodeCachingDuration', [value]);
  },

  setMaximumResultsCount({ value }) {
    return invoke('setMaximumResultsCount', [value]);
  },

  setBarcodeThumbnailOnResultEnabled({ enabled }) {
    return invoke('setBarcodeThumbnailOnResultEnabled', [enabled]);
  },

  setThresholdBetweenDuplicatesScans({ value }) {
    return invoke('setThresholdBetweenDuplicatesScans', [value]);
  },

  setUpcEanDeblurEnabled({ enabled }) {
    return invoke('setUpcEanDeblurEnabled', [enabled]);
  },

  setMisshaped1DEnabled({ enabled }) {
    return invoke('setMisshaped1DEnabled', [enabled]);
  },

  setEnableVINRestrictions({ value }) {
    return invoke('setEnableVINRestrictions', [value]);
  },

  setDatamatrixDpmModeEnabled({ enabled }) {
    return invoke('setDatamatrixDpmModeEnabled', [enabled]);
  },

  setCustomOption({ option, value }) {
    return invoke('setCustomOption', [option, value]);
  },

  setEnableComposite({ value }) {
    return invoke('setEnableComposite', [value]);
  },

  setCamera({ value }) {
    return invoke('setCamera', [value]);
  },

  setARMode({ value }) {
    return invoke('setARMode', [value]);
  },

  setAROverlayRefresh({ value }) {
    return invoke('setAROverlayRefresh', [value]);
  },

  setARSelectedLocationColor({ value }) {
    return invoke('setARSelectedLocationColor', [value]);
  },

  setARNonSelectedLocationColor({ value }) {
    return invoke('setARNonSelectedLocationColor', [value]);
  },

  setARLocationType({ value }) {
    return invoke('setARLocationType', [value]);
  },

  setARDoubleTapToFreezeEnabled({ enabled }) {
    return invoke('setARDoubleTapToFreezeEnabled', [enabled]);
  },

  setARHeaderShowMode({ value }) {
    return invoke('setARHeaderShowMode', [value]);
  },

  async getVersion() {
    const value = await invoke('getVersion');
    if (typeof value === 'string' || typeof value === 'number') {
      return { version: value };
    }
    return value ?? {};
  },

  async getLibVersion() {
    const value = await invoke('getLibVersion');
    if (typeof value === 'string' || typeof value === 'number') {
      return { libVersion: value };
    }
    return value ?? {};
  },
};
