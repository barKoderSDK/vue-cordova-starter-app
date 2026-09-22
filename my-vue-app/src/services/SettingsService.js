const SETTINGS_KEY = 'scanner_settings';

const readAllSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Error reading settings:', error);
    return {};
  }
};

export const SettingsService = {
  async getSettings(mode) {
    return readAllSettings()[mode] ?? null;
  },

  async saveSettings(mode, settings) {
    try {
      const allSettings = readAllSettings();
      allSettings[mode] = settings;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(allSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },
};
