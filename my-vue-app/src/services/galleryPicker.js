const CANCELLED_CAMERA_MESSAGES = ['cancel', 'no image selected'];

const isCancelledCameraMessage = (message) => {
  const normalized = message.trim().toLowerCase();
  return CANCELLED_CAMERA_MESSAGES.some((value) => normalized.includes(value));
};

const readFileAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '');
      const base64 = dataUrl.split(',')[1] ?? '';
      if (!base64) {
        reject(new Error('Could not read selected image.'));
        return;
      }
      resolve(base64.replace(/\s/g, ''));
    };
    reader.onerror = () => reject(new Error('Failed to read selected image.'));
    reader.readAsDataURL(file);
  });

const pickImageUsingFileInput = () =>
  new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        resolve(await readFileAsBase64(file));
      } catch (error) {
        reject(error);
      }
    };

    input.onerror = () => reject(new Error('Unable to open gallery picker.'));

    document.body.appendChild(input);
    input.click();
    window.setTimeout(() => input.remove(), 1000);
  });

export const pickGalleryImageAsBase64 = async () => {
  const camera = navigator.camera;

  if (window.cordova && camera) {
    return new Promise((resolve, reject) => {
      camera.getPicture(
        (imageData) => {
          const normalizedBase64 = String(imageData ?? '')
            .replace(/^data:[^;]+;base64,/, '')
            .replace(/\s/g, '');
          resolve(normalizedBase64 || null);
        },
        (message) => {
          if (!message || isCancelledCameraMessage(message)) {
            resolve(null);
            return;
          }
          reject(new Error(message));
        },
        {
          quality: 95,
          destinationType: window.Camera?.DestinationType?.DATA_URL ?? 0,
          sourceType: window.Camera?.PictureSourceType?.PHOTOLIBRARY ?? 0,
          mediaType: window.Camera?.MediaType?.PICTURE ?? 0,
          encodingType: window.Camera?.EncodingType?.JPEG ?? 0,
          correctOrientation: true,
        },
      );
    });
  }

  return pickImageUsingFileInput();
};

const DEVICE_FALLBACK_KEY = 'device_uuid_fallback';

export const getDeviceIdentifier = () => {
  if (window.device?.uuid) {
    return window.device.uuid;
  }

  const existing = localStorage.getItem(DEVICE_FALLBACK_KEY);
  if (existing) {
    return existing;
  }

  const generated = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(DEVICE_FALLBACK_KEY, generated);
  return generated;
};
