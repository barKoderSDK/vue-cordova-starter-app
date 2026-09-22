<template>
  <div v-if="visible" class="settings-overlay">
    <img :src="bgImage" alt="Background" class="page-background" />

    <div class="settings-header">
      <button class="icon-button" aria-label="Back" @click="$emit('close')">
        <img :src="chevron" alt="Back" class="chevron-icon" />
      </button>
      <h2>Settings</h2>
    </div>

    <div class="settings-scroll">
      <h3 class="settings-section-title">General Settings</h3>
      <div v-if="generalSettings.length" class="settings-group">
        <template v-for="(item, index) in generalSettings" :key="item.key">
          <SettingSwitch
            v-if="item.type === 'switch'"
            :label="item.label"
            :value="Boolean(settings[item.key])"
            :is-last="index === generalSettings.length - 1"
            @change="(value) => $emit('update-setting', item.key, value)"
          />
          <SettingDropdown
            v-else
            :label="item.label"
            :options="item.options || []"
            :selected-value="settings[item.key]"
            :is-last="index === generalSettings.length - 1"
            @select="(value) => $emit('update-setting', item.key, value)"
          />
        </template>
      </div>

      <template v-if="decodingSettings.length">
        <h3 class="settings-section-title">Decoding Settings</h3>
        <div class="settings-group">
          <SettingDropdown
            v-for="(item, index) in decodingSettings"
            :key="item.key"
            :label="item.label"
            :options="item.options || []"
            :selected-value="settings[item.key]"
            :is-last="index === decodingSettings.length - 1"
            @select="(value) => $emit('update-setting', item.key, value)"
          />
        </div>
      </template>

      <template v-for="category in ['1D', '2D']" :key="category">
        <template v-if="filteredTypes(category).length">
          <h3 class="settings-section-title">{{ category }} Barcodes</h3>
          <div class="settings-group">
            <SettingSwitch
              label="Enable All"
              :value="allEnabled(category)"
              @change="(value) => $emit('enable-all', value, category)"
            />
            <SettingSwitch
              v-for="(type, index) in filteredTypes(category)"
              :key="type.id"
              :label="type.label"
              :value="Boolean(enabledTypes[type.id])"
              :is-last="index === filteredTypes(category).length - 1"
              @change="(value) => $emit('toggle-type', type.id, value)"
            />
          </div>
        </template>
      </template>

      <button class="settings-reset" @click="$emit('reset-config')">Reset All Settings</button>
    </div>
  </div>
</template>

<script>
import {
  BarkoderARHeaderShowMode,
  BarkoderARLocationType,
  BarkoderARMode,
  BarkoderAROverlayRefresh,
  BarkoderResolution,
  DecodingSpeed,
} from '../plugins/barkoder';
import bgImage from '../assets/images/BG.svg';
import chevron from '../assets/icons/chevron.svg';
import { BARCODE_TYPES_1D, BARCODE_TYPES_2D, MODES } from '../constants/constants';
import SettingDropdown from './SettingDropdown.vue';
import SettingSwitch from './SettingSwitch.vue';

export default {
  name: 'UnifiedSettings',
  components: { SettingDropdown, SettingSwitch },
  props: {
    visible: { type: Boolean, default: false },
    settings: { type: Object, required: true },
    enabledTypes: { type: Object, required: true },
    mode: { type: String, default: '' },
  },
  emits: ['update-setting', 'toggle-type', 'enable-all', 'reset-config', 'close'],
  data() {
    return { bgImage, chevron };
  },
  computed: {
    isDpmMode() {
      return this.mode === MODES.DPM;
    },
    isARMode() {
      return this.mode === MODES.AR_MODE;
    },
    isVinMode() {
      return this.mode === MODES.VIN;
    },
    isMrzMode() {
      return this.mode === MODES.MRZ;
    },
    isDotcodeMode() {
      return this.mode === MODES.DOTCODE;
    },
    generalSettings() {
      const items = [];

      if (this.mode === MODES.ANYSCAN) {
        items.push({ type: 'switch', key: 'compositeMode', label: 'Composite Mode' });
      }

      items.push({ type: 'switch', key: 'pinchToZoom', label: 'Allow Pinch to Zoom' });

      if (!this.isDpmMode && !this.isARMode && !this.isVinMode && !this.isMrzMode) {
        items.push({ type: 'switch', key: 'locationInPreview', label: 'Location in Preview' });
      }

      if (!this.isDpmMode && !this.isARMode && !this.isMrzMode) {
        items.push({
          type: 'switch',
          key: 'regionOfInterest',
          label: this.isVinMode ? 'Narrow Viewfinder' : 'Region of Interest',
        });
      }

      items.push({ type: 'switch', key: 'beepOnSuccess', label: 'Beep on Success' });
      items.push({ type: 'switch', key: 'vibrateOnSuccess', label: 'Vibrate on Success' });
      items.push({ type: 'switch', key: 'showResultSheet', label: 'Show Result Sheet' });

      if (!this.isDpmMode && !this.isARMode && !this.isVinMode && !this.isMrzMode && !this.isDotcodeMode) {
        items.push({ type: 'switch', key: 'scanBlurred', label: 'Scan Blurred UPC/EAN' });
        items.push({ type: 'switch', key: 'scanDeformed', label: 'Scan Deformed Codes' });
      }

      if (!this.isARMode) {
        items.push({ type: 'switch', key: 'continuousScanning', label: 'Continuous Scanning' });

        if (this.settings.continuousScanning) {
          items.push({
            type: 'dropdown',
            key: 'continuousThreshold',
            label: 'Duplicate Threshold',
            options: Array.from({ length: 11 }, (_, index) => ({ label: `${index}s`, value: index })),
          });
        }
      } else {
        items.push({ type: 'switch', key: 'arDoubleTapToFreeze', label: 'Double Tap to Freeze' });
        items.push({
          type: 'dropdown',
          key: 'arMode',
          label: 'AR Mode',
          options: [
            { label: 'Disabled', value: BarkoderARMode.interactiveDisabled },
            { label: 'Enabled', value: BarkoderARMode.interactiveEnabled },
            { label: 'Always', value: BarkoderARMode.nonInteractive },
          ],
        });
        items.push({
          type: 'dropdown',
          key: 'arLocationType',
          label: 'Location Type',
          options: [
            { label: 'None', value: BarkoderARLocationType.none },
            { label: 'Tight', value: BarkoderARLocationType.tight },
            { label: 'Box', value: BarkoderARLocationType.boundingBox },
          ],
        });
        items.push({
          type: 'dropdown',
          key: 'arHeaderShowMode',
          label: 'Header Show Mode',
          options: [
            { label: 'Never', value: BarkoderARHeaderShowMode.never },
            { label: 'Always', value: BarkoderARHeaderShowMode.always },
            { label: 'Selected', value: BarkoderARHeaderShowMode.onSelected },
          ],
        });
        items.push({
          type: 'dropdown',
          key: 'arOverlayRefresh',
          label: 'Overlay Refresh',
          options: [
            { label: 'Smooth', value: BarkoderAROverlayRefresh.smooth },
            { label: 'Normal', value: BarkoderAROverlayRefresh.normal },
          ],
        });
      }

      return items;
    },
    decodingSettings() {
      if (this.isDpmMode || this.isARMode || this.isVinMode || this.isMrzMode || this.isDotcodeMode) {
        return [];
      }

      return [
        {
          type: 'dropdown',
          key: 'decodingSpeed',
          label: 'Decoding Speed',
          options: [
            { label: 'Fast', value: DecodingSpeed.fast },
            { label: 'Normal', value: DecodingSpeed.normal },
            { label: 'Slow', value: DecodingSpeed.slow },
          ],
        },
        {
          type: 'dropdown',
          key: 'resolution',
          label: 'Resolution',
          options: [
            { label: 'HD', value: BarkoderResolution.HD },
            { label: 'FHD', value: BarkoderResolution.FHD },
          ],
        },
      ];
    },
  },
  methods: {
    filteredTypes(category) {
      if (this.isMrzMode) {
        return category === '1D' ? [] : BARCODE_TYPES_2D.filter((item) => item.id === 'idDocument');
      }

      let types = category === '1D' ? BARCODE_TYPES_1D : BARCODE_TYPES_2D;

      if (this.isDpmMode) {
        types = types.filter((item) => ['datamatrix', 'qr', 'qrMicro'].includes(item.id));
      } else if (this.isDotcodeMode) {
        types = types.filter((item) => item.id === 'dotcode');
      } else if (this.isVinMode) {
        types = types.filter((item) => ['code39', 'code128', 'datamatrix', 'qr', 'ocrText'].includes(item.id));
      } else if (this.mode === MODES.MODE_1D && category === '2D') {
        return [];
      } else if (this.mode === MODES.MODE_2D && category === '1D') {
        return [];
      }

      if (!this.isVinMode) {
        types = types.filter((item) => item.id !== 'ocrText');
      }

      return types.filter((item) => item.id !== 'idDocument');
    },
    allEnabled(category) {
      const types = this.filteredTypes(category);
      return types.length > 0 && types.every((item) => this.enabledTypes[item.id]);
    },
  },
};
</script>
