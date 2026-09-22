const HISTORY_KEY = 'scan_history';

const readHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading history:', error);
    return [];
  }
};

export const HistoryService = {
  async getHistory() {
    return readHistory();
  },

  async addScan(item) {
    try {
      const history = readHistory();
      const existingIndex = history.findIndex((entry) => entry.text === item.text && entry.type === item.type);

      if (existingIndex >= 0) {
        const updated = { ...history[existingIndex] };
        updated.count += 1;
        updated.timestamp = Date.now();
        if (item.image) {
          updated.image = item.image;
        }
        history.splice(existingIndex, 1);
        history.unshift(updated);
      } else {
        history.unshift({
          ...item,
          timestamp: Date.now(),
          count: 1,
        });
      }

      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  },

  async clearHistory() {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  },
};
