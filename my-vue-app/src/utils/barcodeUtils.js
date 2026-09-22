import { BARCODE_TYPES_1D } from '../constants/constants';

export const normalize = (value) => value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

export const is1D = (type) => {
  const normalizedType = normalize(type);
  return BARCODE_TYPES_1D.some(
    (item) => normalize(item.label) === normalizedType || normalize(item.id) === normalizedType,
  );
};

export const parseMrzData = (text) => {
  const fields = [];
  text.split('\n').forEach((line) => {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (!match) {
      return;
    }
    const key = match[1].trim();
    const value = match[2].trim();
    const label = key
      .split('_')
      .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
      .join(' ');
    fields.push({ id: key, label, value });
  });
  return fields;
};
