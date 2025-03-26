# Cordova with Vue Starter Example with barKoder Barcode Scanner SDK
## Introduction
This is a starter app example with VueJS, showcasing the integration of the barKoder Barcode Scanner SDK for Cordova. The barKoder Barcode Scanner SDK is an enterprise-grade solution that provides a highly customizable interface for barcode scanning in both iOS and Android apps.

## Key Features:
* Utilizes VueJS for building the app's user interface.
* Integrates the barKoder Barcode Scanner SDK to enable advanced barcode scanning.
* Leverages Cordova for seamless cross-platform deployment to iOS and Android.
* Supports a wide range of barcode types, including 1D and 2D barcodes.

# barKoder Barcode Scanner SDK plugin for Cordova
The barKoder Barcode Scanner SDK is designed to transform smartphones and tablets into rugged barcode scanning devices. It boasts a robust barcode reading engine that supports various barcode types with exceptional speed and recognition rates.

## Supported Barcode Types:
* 1D: Codabar, Code 11, Code 25, Code 39, Code 93, Code 128, DotCode, EAN-8, EAN-13, Interleaved 2 of 5, ITF-14, MSI Plessey, Pharmacode, Telepen, UPC-A, UPC-E.
* 2D: Aztec Code, Aztec Compact, Data Matrix, PDF417, Micro PDF417, QR Code, Micro QR Code.

## Advanced Features:
* DPM Mode for decoding Data Matrix barcodes engraved using any DPM technique.
* MatrixSight algorithm for scanning QR Codes or Data Matrix barcodes with missing patterns.
* Segment Decoding for recognizing 1D barcodes with deformations along their Z axis.
* VIN Barcode Scanning Mode for advanced scanning of Vehicle Identification Numbers.
* DeBlur Mode for eliminating blur in EAN or UPC barcodes.
* PDF417-LineSight for detecting severely damaged PDF417 codes.

## Documentation
You can find full documentation about the barKoder Barcode Reader SDK here: https://docs.barkoder.com

## Trial License

If you run the barKoder Barcode Scanner SDK without a valid trial or production license, all results upon successful barcode scans will be partially masked by asterisks (*). You can get a trial license simply by [registering on the barKoder Portal](https://barkoder.com/register) and utilizing the self-service for [Evaluation License Generation](https://barkoder.com/spr/new)! Each trial license will be good for an initial duration of 30 days and can be deployed to up to 25 devices. For any custom requirements, contact our sales team via sales@barkoder.com

**Note:** Trial licenses are for development or staging environments only. Do not publish a trial license with your app to public stores.

## Free Developer Support

Our support is completely free for integration or testing purposes and granted through the [barKoder Portal](https://barkoder.com/login). After registering and logging into your account, you only need to submit a [Support Issue](https://barkoder.com/issues) form. Alternatively, you can contact us by email via support@barkoder.com.


## Requirements

Cordova is a cross-platform app runtime that makes it easy to build web apps that run natively on iOS, Android and the web. To get started with building apps using Cordova, you'll need to meet certain requirements:

1. **Node.js and npm:**
   - Ensure you have Node.js installed on your machine. Cordova requires Node.js version 10 or later.
   - npm (Node Package Manager) is also required. It usually comes with Node.js.
2. **Text Editor or IDE:**
   - Choose a text editor or IDE for coding (e.g., Visual Studio Code).
3. **Git:**
   - Install Git for managing projects.
4. **Command Line Interface (CLI):**
   - Cordova commands are executed via the command line. Make sure you have a command line interface (CLI) installed and accessible on your system.
5. **Mobile Development SDKs:**
   - For iOS: Install Xcode (macOS).
   - For Android: Install Android Studio.


# Getting Started
1. **install Cordova globally on your machine:**
   ```bash
   npm install -g cordova
   ```
2. **Create a New Cordova Project:**
  ```bash
   cordova create my-cordova-app com.example.cordovaapp CordovaApp
   ```
3. **Navigate into the Cordova Project:**
  ```bash
   cd my-cordova-app
   ```
3.1 **Add Android Platform:**
  ```bash
   cordova platform add android
   ```
3.2 **Add barkoder-cordova Plugin:**
  ```bash
   cordova plugin add barkoder-cordova
   ```
4. **Install Vue.js Inside Cordova Project:**
  ```bash
   npm install -g @vue/cli
   ```
5. **Create a New Vue.js Application:**
  ```bash
   vue create vue_app
   ```
6. **Configure Vue.js Build Output for Cordova:** </br>
>
   Update the Vue.js project's build configuration to output to the www directory, which is used by Cordova for building mobile applications.
   Edit vue.config.js in your Vue.js project (src) to set the output directory to ../www:
  ```bash
  module.exports = {
  outputDir: '../www',
  publicPath: './',
  chainWebpack: config => {
    config.module
      .rule('typescript')
      .test(/\.ts$/)
      .use('ts-loader')
      .loader('ts-loader')
      .end();
  }
};
   ```
7. **Configure typescript - create or update tsconfig.json file in vue app root folder:**
  ```bash
  {
    "compilerOptions": {
      "target": "es5",
      "lib": ["dom", "es2015"],
      "allowJs": true,
      "jsx": "preserve",
      "module": "esnext",
      "moduleResolution": "node",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    },
    "include": [
      "src/**/*.ts",
      "src/**/*.d.ts",
      "src/**/*.tsx",
      "src/**/*.vue"
    ],
    "exclude": [
      "node_modules"
    ]
  }
  ```
   
8. **Build Vue.js Application:**
  ```bash
   cd vue_app
  npm run build
   ```
9. **Make sure cordova.js script is included in public/index.html:**
  ```bash
      <script src="cordova.js"></script>
   ```
10. **Test and Run Your App:**
    > back to cordova project root
  ```bash
    cd .. 
    cordova build android
    cordova run android or cordova run ios
   ```


## Using the plugin
## Vue:
**In your components/[fileName].vue:**
  ```bash
  <template>
    <div id="barkoderView" ref="barkoderView"></div>
  </template>
   ```

  ```bash
  <script>
    import { ref, onMounted, reactive } from 'vue';
    import { BarcodeType } from '../plugins/BarkoderConfig.ts';

export default {
  setup() {
    const barkoderViewRef = ref('');
    const scannedResult = ref(null);
    const isScanning = ref(false);
    const recentScans = ref(localStorage.getItem('recentScans') || [])

    const barcodeTypes = [
      { name: "QR", type: "qr", mode: "2d" },
      { name: "Qr Micro", type: "qrMicro",  mode: "2d" },
      { name: "Aztec Compact", type: "aztecCompact", mode: "2d" },
      { name: "Aztec", type: "aztec", mode: "2d" },
      { name: "Datamatrix", type: "datamatrix", mode: "2d" },
      { name: "Dotcode", type: "dotcode", mode: "2d" },
      { name: "Code 128", type: "code128",  mode: "1d" },
      { name: "Code 93", type: "code93",  mode: "1d" },
      { name: "Code 39", type: "code39",  mode: "1d" },
      { name: "Codabar", type: "codabar",  mode: "1d" },
      { name: "Code 11", type: "code11",  mode: "1d" },
      { name: "Ean 8", type: "ean8",  mode: "1d" },
      { name: "Ean 13", type: "ean13",  mode: "1d" },
      { name: "Msi", type: "msi",  mode: "1d" },
      { name: "UpcA", type: "upcA",  mode: "1d" },
      { name: "UpcE", type: "upcE",  mode: "1d" },
      { name: "PDF 417", type: "pdf417",  mode: "2d" },
      { name: "Databar 14", type: "databar14",  mode: "1d" },
      { name: "Databar Limited", type: "databarLimited",  mode: "1d" },
      { name: "Databar Expanded", type: "databarExpanded",  mode: "1d" },
      { name: "Postal IMB", type: "postalIMB",  mode: "1d" },
      { name: "Postnet", type: "postnet",  mode: "1d" },
      { name: "Planet", type: "planet",  mode: "1d" },
      { name: "Australian Post", type: "australianPost",  mode: "1d" },
      { name: "Royal Mail", type: "royalMail",  mode: "1d" },
      { name: "KIX", type: "kix",  mode: "1d" },
      { name: "Japanese Post", type: "japanesePost",  mode: "1d" }
    ];

     const enabledBarcodes = reactive(
      barcodeTypes.reduce((acc, barcode) => {
        acc[barcode.type] = true;
          return acc;
      }, {})
    );

    const setActiveBarcodeTypes = async () => {
      try {
      Object.keys(enabledBarcodes).forEach((barcodeType) => {
        const isEnabled = enabledBarcodes[barcodeType];
        window.Barkoder.setBarcodeTypeEnabled(BarcodeType[barcodeType], isEnabled);
      });
      } catch (error) {
        console.error("Error setting active barcode types:", error);
      }
    };

    const setBarkoderSettings = async () => {
      try {
        window.Barkoder.setRegionOfInterestVisible(true);
        window.Barkoder.setRegionOfInterest(5, 30, 90, 40);
        window.Barkoder.setCloseSessionOnResultEnabled(true);
        window.Barkoder.setMaximumResultsCount(200);
        window.Barkoder.setImageResultEnabled(true);
        window.Barkoder.setLocationInImageResultEnabled(true);
        window.Barkoder.setLocationInPreviewEnabled(true);
        window.Barkoder.setBarcodeThumbnailOnResultEnabled(true);
        window.Barkoder.setBeepOnSuccessEnabled(true);
        window.Barkoder.setVibrateOnSuccessEnabled(true);
        window.Barkoder.setPinchToZoomEnabled(true);
        window.Barkoder.setZoomFactor(currentZoomFactor.value);
      } catch (error) {
        console.error('Error setting Barkoder settings:', error);
        throw error; 
      }
    };

    const startScanning = async () => {
      scannedResult.value = null;
      isScanning.value = true;
      try {
        const boundingRect = await barkoderViewRef.value.getBoundingClientRect();
        window.Barkoder.registerWithLicenseKey('YOUR_LICENSE_KEY');
        await new Promise((resolve, reject) => {
          window.Barkoder.initialize(
             Math.round(boundingRect.width),
                 Math.round(boundingRect.height),
                 Math.round(boundingRect.x),
                 Math.round(boundingRect.y),
            () => {
              resolve();
            },
            (error) => {
              reject('Initialization error: ' + error);
            }
          );
        });
        await setBarkoderSettings();
        await setActiveBarcodeTypes();
        document.addEventListener('deviceready', () => {
          if (window.Barkoder) {
            window.Barkoder.startScanning(
              (barkoderResult) => {
                const randomId = Math.floor(Math.random() * 1000000);
                if (barkoderResult) {
                  window.Barkoder.stopScanning();
                  isScanning.value = false;
                }
                scannedResult.value = {
                  id: randomId,
                  textualData: barkoderResult.decoderResults[0].textualData || 'No data available',
                  type: barkoderResult.decoderResults[0].barcodeTypeName || 'Unknown type',
                  resultImage: `data:image/jpeg;base64,${barkoderResult.resultImageAsBase64 || ''}`,
                  thumbnailImage: `data:image/jpeg;base64,${barkoderResult.resultThumbnailsAsBase64[0] || ''}`,
                };
                const results = barkoderResult.decoderResults.map((decoderResult) => ({
                  id: randomId,
                  textualData: decoderResult.textualData || 'No data available',
                  type: decoderResult.barcodeTypeName || 'Unknown type',
                }));
                recentScans.value.push(...results);
                localStorage.setItem('recentScans', JSON.stringify(recentScans.value));
              },
              (error) => {
                console.error('Scanning error:', error);
                isScanning.value = false;
              }
            );
          } else {
            console.error('BarkoderScanner plugin not available');
            isScanning.value = false;
          }
        }, false);
      } catch (error) {
        alert(`Error: ${error}`);
        isScanning.value = false;
      }
    };

    const stopScanning = () => {
      document.addEventListener('deviceready', () => {
        if (window.Barkoder) {
          window.Barkoder.stopScanning(
            () => isScanning.value = false,
            (error) => console.error('Stop scanning error:', error)
          );
        } else {
          console.error('BarkoderScanner plugin not available');
        }
      }, false);
    };

     onMounted(() => {
      barkoderViewRef.value = document.getElementById('barkoderView');
      recentScans.value = JSON.parse(localStorage.getItem('recentScans') || '[]');
    });

    return {
      barkoderViewRef,
      startScanning,
      stopScanning,
      scannedResult,
      isScanning,
      recentScans,
      enabledBarcodes
    };
  }
};
</script>
   ```

  ```bash
<style>
  #barkoderView {
    height: 400px;
  }
 // other styles as needed
</style>

   ```

10. **If cannot read from BarkoderConfig.ts** - In plugins/barkoder-cordova-plugin/www/ -> create file BarkoderConfig.js that is coppy from BarkoderConfig.ts 
  

 
