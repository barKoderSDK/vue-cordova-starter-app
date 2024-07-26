<template>
  <div id="container">
    <div class="app_title">
      <div class="title_settings_container">
        <h2 style="width: 100%;;">Cordova + Vue</h2>
        <img alt="settings icon" src="../assets/Settings.svg">
      </div>
    </div>
    <div id="barkoderView" ref="barkoderView" style="height: 90vh" :style="{ minHeight: scannedResult?.thumbnailImage && !isScanning ? '68vh' : '90vh' }">
      <img v-if="scannedResult?.resultImage" class="fullResultImage" :src="scannedResult?.resultImage" @click="startScanning" alt="Scanned Thumbnail" />
      <div v-if="scannedResult?.resultImage" class="tap_anywhere_popup" @click="startScanning">
        <img alt="touch icon" src="../assets/touch_app.svg">
        <span>Tap anywhere to continue</span>
      </div>
    </div>


    <div class="btnContainer" :class="{ 'animate-btnContainer': scannedResult?.type }">
        <div v-if="scannedResult?.type" class="resultContainer">
          <div class="line_container">
            <div class="results_line"></div>
          </div>

          <div class="result_text_img">
            <span class="result_title"> {{ scannedResult.type }}</span>
            <img v-if="scannedResult?.thumbnailImage" class="resultImage" :src="scannedResult?.thumbnailImage" alt="Scanned Thumbnail" />
            <p>Result:
              <a :href="scannedResult.textualData"> {{ scannedResult.textualData }} </a>
            </p>
          </div>
          <div class="results_btn_container">
            <button class="main_btn" @click="handleCopyToClipboard"><img alt="copy icon" src="../assets/Copy.svg" />Copy</button>
            <button class="main_btn"><img alt="csv icon" src="../assets/CSV.svg" />CSV</button>
            <button class="main_btn" @click="handleWebhookConfiguration"><img alt="webhook icon" src="../assets/Webhook.svg" />Webhook</button>
            <button class="main_btn" @click="handleSearch"><img alt="search icon" src="../assets/Search.svg" />Search</button>
          </div>
        </div>
        <div v-if="!scannedResult?.type" class="buttons">
          <div class="actionButton" v-if="!isScanning" @click="toggleScan">
            <img  width="40" alt="scan icon" src="../assets/scan-circle.svg" />
          </div>
          <button v-if="isScanning && isFlashOn" @click="toggleFlash" class="click_btn"><img alt="flash icon" src="../assets/flash_on.svg" /></button>
          <button v-if="isScanning && !isFlashOn" @click="toggleFlash" class="click_btn"><img alt="flash icon" src="../assets/flash_off.svg"/></button>
          <button v-if="isScanning && currentZoomFactor > 1.0" @click="zoomOut" class="click_btn"><img alt="zoom out icon" src="../assets/zoom_out.svg" /></button>
        <button v-if="isScanning && currentZoomFactor <= 1.0" @click="zoomIn" class="click_btn"><img alt="zoom in icon" src="../assets/Zoom.svg" /></button>
        </div>
      </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { BarcodeType } from '../../../plugins/barkoder-cordova-plugin/www/BarkoderConfig.js';

export default {
  setup() {
    const barkoderViewRef = ref('');
    const scannedResult = ref(null);
    const isScanning = ref(false);
    const isFlashOn = ref(false);
    const currentZoomFactor = ref(1.0);

    const setActiveBarcodeTypes = async () => {
      try {
        await window.Barkoder.setBarcodeTypeEnabled(BarcodeType.code128, true );
        await window.Barkoder.setBarcodeTypeEnabled(BarcodeType.ean13, true);
      } catch (error) {
        console.error('Error setting active barcode types:', error);
        throw error; 
      }
    };

    const setBarkoderSettings = async () => {
      try {
        window.Barkoder.setRegionOfInterestVisible(true);
        window.Barkoder.setRegionOfInterest(5, 30, 90, 40);
        window.Barkoder.setCloseSessionOnResultEnabled( false );
        window.Barkoder.setImageResultEnabled( true );
        window.Barkoder.setBarcodeThumbnailOnResultEnabled( true );
        window.Barkoder.setBeepOnSuccessEnabled( true );
        window.Barkoder.setPinchToZoomEnabled( true );
        window.Barkoder.setZoomFactor(currentZoomFactor.value);
      } catch (error) {
        console.error('Error setting Barkoder settings:', error);
        throw error; 
      }
    };

    const toggleFlash = () => {
      if (window.Barkoder) {
        isFlashOn.value = !isFlashOn.value;
        window.Barkoder.setFlashEnabled(isFlashOn.value);
      } else {
        console.error('BarkoderScanner plugin not available');
      }
    };

    const toggleScan = () => {
      if (isScanning.value) {
        stopScanning();
      } else {
        startScanning();
      }
    };

    const startScanning = async () => {
      scannedResult.value = {
        textualData: null,
        type: null,
        thumbnailImage: null,
      };
      isScanning.value = true;

      try {
        const boundingRect = await barkoderViewRef.value.getBoundingClientRect();

        window.Barkoder.registerWithLicenseKey('ADD_YOUR_LICENSE_KEY_HERE');

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
          scannedResult.value = {
            textualData: barkoderResult.textualData,
            type: barkoderResult.barcodeTypeName,
            resultImage: "data:image/jpeg;base64," + barkoderResult.resultImageAsBase64,
            thumbnailImage: "data:image/jpeg;base64," + barkoderResult.resultThumbnailAsBase64,
        };
        window.Barkoder.stopScanning();
        isScanning.value = false;
      },
      (error) => {
        console.error('Scanning error:', error);
      }
    );
          } else {
            console.error('BarkoderScanner plugin not available');
          }
        }, false);
      } catch (error) {
        alert('Error: ' + error);
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

    const zoomIn = async () => {
      try {
        currentZoomFactor.value += 1.0; 
        window.Barkoder.setZoomFactor(currentZoomFactor.value);
      } catch (error) {
        console.error('Error zooming in:', error);
      }
    };

    const zoomOut = async () => {
      try {
        currentZoomFactor.value -= 1.0;
        window.Barkoder.setZoomFactor(currentZoomFactor.value);
      } catch (error) {
        console.error('Error zooming out:', error);
      }
    };

    const handleCopyToClipboard = () => {
          alert('Text copied to clipboard ', scannedResult.value.textualData);
    };

    const handleWebhookConfiguration = () => {
      alert('The Webhook configuration for this application is not set.');
    }
    const handleSearch = () => {
      console.log('im here');
      if (scannedResult.value && scannedResult.value.textualData) {
        const searchQuery = encodeURIComponent(scannedResult.value.textualData);
        const searchUrl = `https://www.google.com/search?q=${searchQuery}`;     
        window.open(searchUrl, '_blank');
      } else {
        console.error('No textual data available to search.');
      }
    };

    onMounted(() => {
      barkoderViewRef.value = document.getElementById('barkoderView');
    });

    return {
      barkoderViewRef,
      startScanning,
      stopScanning,
      toggleScan,
      scannedResult,
      isScanning,
      isFlashOn ,
      toggleFlash,
      zoomIn,
      zoomOut,
      currentZoomFactor,
      handleCopyToClipboard,
      handleSearch,
      handleWebhookConfiguration
      
    };
  }
};
</script>

<style>
#container {
  height: 100vh;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0;
  padding: 0;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.results_btn_container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 16px;
  gap: 8px;
}

#container p, .result_text_img a {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

#container a {
  text-decoration: none;
  word-wrap: break-word;
}

#barkoderView {
  min-height: 60vh;
  height: 100%;
}

#barkoderView .fullResultImage {
  height: 100%;
  width: 100%;
}

.animate-btnContainer {
  animation: slideUp 0.5s ease-out;
}

.btnContainer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: flex-end;
  width: 100%;
  min-height: 8vh;
  height: fit-content;
  background-color: #FFFFFF;
  position: absolute;
  bottom: 0px;
  z-index: 9999;
  border-radius: 10px 10px 0 0;
  
}

.btnContainer .buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
  margin-bottom: 15px;
}

.actionButton {
  width: 50px;
  height: 50px;
  font-size: 16px;
  color: #fff;
  border: 1.5px solid gray;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.actionButton:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.resultContainer {
  width: 100%;
}

.resultImage {
  width: 160px;
  height: 90px;
  border-radius: 5px;
}

.active {
  background-color: #E62E40; 
}

.app_title {
  position: absolute;
  background-color: transparent;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  width: 100%;
  background-image: url('../assets/bg-header.png');
  background-size: cover; 
  background-position: bottom; 
  background-repeat: no-repeat;
}


.app_title h2 {
 margin: 0
}

.tap_anywhere_popup {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 24px 8px 24px;
  border-radius: 20px;
  background-color: #00000080;
  position: absolute;
  z-index: 999;
  top: 50%;
  left: 50%;
  transform: translate(-50%, 50%);
  color: #FFFFFF;
  width: 240px;
}

.main_btn {
  background: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 16px;
  gap: 8px;
  width: 152px;
  min-width: 140px;
  height: 40px;
  border: 1px solid #FF3347;
  color: #FF3347;
  border-radius: 40px;
  height: 40px;
}

.line_container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
}

.line_container .results_line {
  height: 4px;
  width: 80px;
  border-radius: 2px;
  background: #00000033;
}

.result_text_img {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.result_title {
  color: #000000;
  opacity: 0.5;
  font-size: 18px;
  line-height: 27px;
  text-align: center;
}

.click_btn {
  border: 1px solid #FF3347;
  border-radius: 8px;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: black;
}

.title_settings_container {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

</style>
