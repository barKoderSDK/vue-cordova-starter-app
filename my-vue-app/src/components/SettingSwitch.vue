<template>
  <label class="setting-row" :class="{ 'setting-row-last': isLast }">
    <span>{{ label }}</span>
    <input type="checkbox" :checked="value" @change="$emit('change', $event.target.checked)" />
  </label>
</template>

<script>
export default {
  name: 'SettingSwitch',
  props: {
    label: { type: String, required: true },
    value: { type: Boolean, default: false },
    isLast: { type: Boolean, default: false },
  },
  emits: ['change'],
};
</script>
