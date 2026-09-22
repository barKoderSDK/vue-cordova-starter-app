# barKoder Barcode Scanner SDK — Vue + Cordova Starter

A starter application showing how to integrate the official barKoder Cordova plugin into a **Vue 3 app packaged with Apache Cordova** for Android and iOS. The plugin connects Cordova's JavaScript layer to the native barKoder Barcode Scanner SDK, providing reliable barcode capture for logistics, retail, manufacturing, automotive, field-service and identity workflows.

Use it as a starting point when your Vue application needs an embedded camera scanner with support for common barcode formats plus advanced scanning modes for difficult real-world codes.

## Quick links

- **Cordova Barcode Scanner SDK:** [https://barkoder.com/barcode-scanner-sdk/frameworks/cordova](https://barkoder.com/barcode-scanner-sdk/frameworks/cordova)
- **npm package:** [https://www.npmjs.com/package/barkoder-cordova](https://www.npmjs.com/package/barkoder-cordova)
- **Installation guide:** [https://barkoder.com/docs/v1/cordova/cordova-installation](https://barkoder.com/docs/v1/cordova/cordova-installation)
- **Examples:** [https://barkoder.com/docs/v1/cordova/cordova-examples](https://barkoder.com/docs/v1/cordova/cordova-examples)
- **API reference:** [https://barkoder.com/docs/v1/cordova/cordova-sdk-api-reference](https://barkoder.com/docs/v1/cordova/cordova-sdk-api-reference)
- **Full demo app:** [https://github.com/barKoderSDK/barkoder-cordova-full-demo-app](https://github.com/barKoderSDK/barkoder-cordova-full-demo-app)
- **Free trial:** [https://barkoder.com/trial](https://barkoder.com/trial)

## Key capabilities

barKoder is designed for production barcode capture workflows where speed and decode reliability matter. Depending on the license and configuration, the SDK supports capabilities such as:

- 30+ 1D and 2D barcode symbologies, including QR Code, Data Matrix, PDF417, Code 128, Code 39, EAN/UPC, Aztec, DotCode and GS1 formats
- [Direct Part Marking (DPM) scanning](https://barkoder.com/barcode-scanner-sdk/dpm) for difficult Data Matrix codes on metal, plastic and other industrial surfaces
- [Batch MultiScan](https://barkoder.com/barcode-scanner-sdk/batch-multiscan) for decoding multiple barcodes in a single camera view
- [VIN barcode scanning](https://barkoder.com/barcode-scanner-sdk/vin-scanning) for automotive workflows
- [MRZ scanning](https://barkoder.com/barcode-scanner-sdk/mrz) for passports, ID cards and travel documents
- Continuous scanning, image/gallery scanning and configurable regions of interest
- Advanced decoding for damaged, deformed, low-quality and blurry barcodes
- On-device scanning for normal mobile scanning workflows

For the complete feature set and platform-specific configuration options, use the official documentation linked below.

## What this starter contains

The Vue application lives in [`my-vue-app/`](./my-vue-app) and builds into the Cordova `www/` folder. It is organised as a small multi-screen app rather than a single view:

| Screen | Purpose |
| --- | --- |
| Home | Grid of scanning modes (1D, 2D, Continuous, MultiScan, VIN, DPM, DeBlur, DotCode, AR Mode, MRZ, Gallery) |
| Scanner | Live camera scanning with flash, zoom, camera switch, a results sheet and a full settings panel |
| Recent Scans | Scan history grouped by day, persisted in local storage |
| Barcode Details | Full data for one scan, with copy and web-search actions |
| About | SDK, library and device information |

Supporting code is split into `components/`, `screens/`, `composables/`, `services/`, `constants/` and `utils/`, with `src/plugins/barkoder.js` wrapping the callback-based Cordova plugin API in promises.

## Getting started

Install the JavaScript dependencies for both the Cordova shell and the Vue app:

```bash
npm install
cd my-vue-app && npm install
```

Add the platform and the scanner plugin:

```bash
cordova platform add android
cordova plugin add barkoder-cordova
```

Build the Vue app (this writes into the Cordova `www/` folder), then build and run through Cordova:

```bash
cd my-vue-app && npm run build && cd ..
cordova run android
```

Re-run `npm run build` inside `my-vue-app` after changing any Vue source, otherwise Cordova will package the previous bundle.

## License key

The scanner reads its license key from `my-vue-app/.env`:

```
VUE_APP_BARKODER_LICENSE_KEY=your_key_here
```

The file is git-ignored, and Vue CLI inlines the value at build time, so rebuild the Vue app after changing it. The SDK will scan without a valid license, but results are partially masked and marked as unlicensed.

Complete the Android/iOS project configuration and permissions using the [Cordova installation guide](https://barkoder.com/docs/v1/cordova/cordova-installation).

## Examples

Use the official documentation for current initialization and API examples:

- [Cordova examples](https://barkoder.com/docs/v1/cordova/cordova-examples)
- [Cordova API reference](https://barkoder.com/docs/v1/cordova/cordova-sdk-api-reference)
- [Full Cordova demo app](https://github.com/barKoderSDK/barkoder-cordova-full-demo-app)

## Trial license

You can evaluate barKoder in your own application with a free trial license:

**[Get a free barKoder SDK trial](https://barkoder.com/trial)**

The SDK can be initialized without a valid license for integration testing, but decoded results may be partially masked or marked as unlicensed. Use a valid trial or production license for complete results and licensed functionality.

Do not publish a trial license in a production application or public source repository.

## Support

Need help with integration or testing?

- Documentation: [https://barkoder.com/docs/v1/home](https://barkoder.com/docs/v1/home)
- Technical support: [support@barkoder.com](mailto:support@barkoder.com)
- Sales and licensing: [sales@barkoder.com](mailto:sales@barkoder.com)

## License

See the `LICENSE` file in this repository for the terms applicable to the repository contents. Use of the barKoder SDK itself is subject to the applicable barKoder license agreement.
