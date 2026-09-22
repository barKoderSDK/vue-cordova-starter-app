<template>
  <div class="result-sheet-inner">
    <div class="result-sheet-header">
      <span>{{ scanCount }} result{{ scanCount === 1 ? '' : 's' }} found ({{ scannedItems.length }} total)</span>
      <button class="icon-button" aria-label="Close" @click="$emit('close')">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="#6C757D">
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
    </div>

    <div class="result-sheet-list" :class="{ 'result-sheet-list-expanded': isExpanded }">
      <button
        v-for="(item, index) in uniqueItems"
        :key="`${item.text}-${index}`"
        class="result-sheet-item"
        :class="{ 'result-sheet-item-primary': index === 0 }"
        @click="$emit('details', item)"
      >
        <div>
          <div class="result-sheet-type">{{ item.type }}</div>
          <div class="result-sheet-text">{{ displayText(item) }}</div>
        </div>
        <div class="result-sheet-meta">
          <span v-if="countFor(item) > 1">({{ countFor(item) }})</span>
        </div>
      </button>
    </div>

    <div class="result-sheet-actions">
      <button class="result-action" @click="$emit('copy')">
        <img :src="iconCopy" alt="Copy" />
        <span>Copy</span>
      </button>
      <button class="result-action" @click="$emit('csv')">
        <img :src="iconCsv" alt="CSV" />
        <span>CSV</span>
      </button>
      <button class="result-action" @click="$emit('toggle-expanded')">
        <img :src="iconExpand" alt="Expand" />
        <span>{{ isExpanded ? 'Collapse' : 'Expand' }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import iconCopy from '../assets/icons/icon_copy.svg';
import iconCsv from '../assets/icons/icon_csv.svg';
import iconExpand from '../assets/icons/expand_all.svg';
import { parseMrzData } from '../utils/barcodeUtils';

const findMrzField = (fields, keys) => {
  const loweredKeys = keys.map((key) => key.toLowerCase());
  return fields.find((field) => {
    const haystack = `${field.id} ${field.label}`.toLowerCase();
    return loweredKeys.some((key) => haystack.includes(key));
  });
};

export default {
  name: 'ResultSheetContent',
  props: {
    scannedItems: { type: Array, required: true },
    uniqueItems: { type: Array, required: true },
    scanCount: { type: Number, required: true },
    isExpanded: { type: Boolean, default: false },
  },
  emits: ['copy', 'csv', 'details', 'close', 'toggle-expanded'],
  data() {
    return { iconCopy, iconCsv, iconExpand };
  },
  methods: {
    displayText(item) {
      if (item.type.toLowerCase() !== 'mrz') {
        return item.text;
      }

      const mrzFields = parseMrzData(item.text);
      const name = findMrzField(mrzFields, ['name', 'given name', 'forename']);
      const surname = findMrzField(mrzFields, ['surname', 'last name', 'family name']);
      const nameParts = [name?.value, surname?.value].filter(Boolean);

      return nameParts.length > 0 ? nameParts.join(' ') : 'Name/Surname not found';
    },
    countFor(item) {
      return this.scannedItems.filter((entry) => entry.text === item.text).length;
    },
  },
};
</script>
