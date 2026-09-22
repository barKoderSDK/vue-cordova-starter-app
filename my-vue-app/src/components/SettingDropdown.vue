<template>
  <label class="setting-row" :class="{ 'setting-row-last': isLast }">
    <span>{{ label }}</span>
    <select class="setting-select" :value="selectedValue" @change="$emit('select', Number($event.target.value))">
      <option v-for="option in options" :key="`${label}-${option.value}`" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>

<script>
export default {
  name: 'SettingDropdown',
  props: {
    label: { type: String, required: true },
    options: { type: Array, default: () => [] },
    selectedValue: { type: Number, default: undefined },
    isLast: { type: Boolean, default: false },
  },
  emits: ['select'],
};
</script>
