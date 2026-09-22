import { Barkoder } from '../plugins/barkoder';

const isNativePlatform = typeof window !== 'undefined' && !!window.cordova;

let registered = false;
let resultListener = null;
let closeListener = null;
let hiddenInitializationElement = null;
let deviceReadyPromise = null;

const resultSubscribers = new Set();
const closeSubscribers = new Set();

const getLicenseKey = () => (process.env.VUE_APP_BARKODER_LICENSE_KEY ?? '').trim();

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const waitForDeviceReady = async () => {
  if (!isNativePlatform || window.Barkoder) {
    return;
  }

  if (!deviceReadyPromise) {
    deviceReadyPromise = new Promise((resolve) => {
      document.addEventListener('deviceready', () => resolve(), { once: true });
      window.setTimeout(resolve, 4000);
    });
  }

  return deviceReadyPromise;
};

const ensureListeners = async () => {
  if (!isNativePlatform) {
    return;
  }

  if (!resultListener) {
    resultListener = await Barkoder.addListener('barkoderResultEvent', (result) => {
      resultSubscribers.forEach((subscriber) => subscriber(result));
    });
  }

  if (!closeListener) {
    closeListener = await Barkoder.addListener('barkoderCloseButtonTappedEvent', () => {
      closeSubscribers.forEach((subscriber) => subscriber());
    });
  }
};

const getHiddenInitializationElement = () => {
  if (!hiddenInitializationElement) {
    hiddenInitializationElement = document.createElement('div');
    hiddenInitializationElement.style.position = 'fixed';
    hiddenInitializationElement.style.left = '200vw';
    hiddenInitializationElement.style.top = '200vh';
    hiddenInitializationElement.style.width = '2px';
    hiddenInitializationElement.style.height = '2px';
    hiddenInitializationElement.style.opacity = '0';
    hiddenInitializationElement.style.pointerEvents = 'none';
  }

  if (document.body && !hiddenInitializationElement.isConnected) {
    document.body.appendChild(hiddenInitializationElement);
  }

  return hiddenInitializationElement;
};

const getValidBounds = async (element) => {
  let rect = element.getBoundingClientRect();

  for (let attempt = 0; attempt < 12; attempt += 1) {
    if (rect.width > 1 && rect.height > 1) {
      return rect;
    }
    await sleep(50);
    rect = element.getBoundingClientRect();
  }

  return rect;
};

const initializeWithBounds = async (element, options) => {
  const rect = await getValidBounds(element);
  const fullscreen = options?.fullscreen ?? true;
  const width = fullscreen ? Math.max(rect.width, window.innerWidth) : rect.width;
  const height = fullscreen ? Math.max(rect.height, window.innerHeight) : rect.height;
  const x = fullscreen ? 0 : rect.left;
  const y = fullscreen ? 0 : rect.top;

  await Barkoder.initialize({
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
    x: Math.max(0, Math.round(x)),
    y: Math.max(0, Math.round(y)),
  });

  // The native plugin resolves initialize before the UI-thread view attach completes.
  await sleep(120);
};

const ensureRegistered = async () => {
  if (registered) {
    return;
  }

  await Barkoder.registerWithLicenseKey({ licenseKey: getLicenseKey() });
  registered = true;
};

export const barkoderService = {
  isNativePlatform,

  async ensureReady(element, options) {
    if (!isNativePlatform) {
      return false;
    }

    await waitForDeviceReady();
    await ensureRegistered();
    await initializeWithBounds(element, { fullscreen: options?.fullscreen ?? true });
    await ensureListeners();
    return true;
  },

  async ensureImageScanReady() {
    if (!isNativePlatform) {
      return false;
    }

    await waitForDeviceReady();
    await ensureRegistered();
    await initializeWithBounds(getHiddenInitializationElement(), { fullscreen: false });
    await ensureListeners();
    return true;
  },

  async subscribeResults(callback) {
    resultSubscribers.add(callback);
    await ensureListeners();

    return () => {
      resultSubscribers.delete(callback);
    };
  },

  subscribeClose(callback) {
    closeSubscribers.add(callback);
    return () => {
      closeSubscribers.delete(callback);
    };
  },
};
