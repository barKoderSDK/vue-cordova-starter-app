<template>
  <div id="container">
    <div id="barkoderView" ref="barkoderView"></div>

    <div class="btnContainer">
      <button class="actionButton" @click="startScanning" :disabled="isScanning">Start Scanning</button>
      <button class="actionButton" @click="stopScanning" :disabled="!isScanning">Stop Scanning</button>
      <!-- <button @click="toggleFlash">Toggle Flash</button> -->
      <div v-if="scannedResult" class="resultContainer">
        <p>Result:
          <a :href="scannedResult.textualData"> {{ scannedResult.textualData }} </a>
        </p>
        <p>Type: {{ scannedResult.type }}</p>
        <img v-if="scannedResult?.thumbnailImage" class="resultImage" :src="scannedResult?.thumbnailImage" alt="Scanned Thumbnail" />
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
        window.Barkoder.setRegionOfInterest(5, 5, 90, 90);
        window.Barkoder.setCloseSessionOnResultEnabled( false );
        window.Barkoder.setImageResultEnabled( true );
        window.Barkoder.setBarcodeThumbnailOnResultEnabled( true );
        window.Barkoder.setBeepOnSuccessEnabled( true );
        window.Barkoder.setPinchToZoomEnabled( true );
        window.Barkoder.setZoomFactor( 2.0 );
      } catch (error) {
        console.error('Error setting Barkoder settings:', error);
        throw error; 
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

        window.Barkoder.registerWithLicenseKey({
          licenseKey: 'ADD_YOUR_LICENSE_KEY_HERE'
        });

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

    onMounted(() => {
      barkoderViewRef.value = document.getElementById('barkoderView');
    });

    return {
      barkoderViewRef,
      startScanning,
      stopScanning,
      scannedResult,
      isScanning
    };
  }
};
</script>

<style>
#container {
  margin-top: 30px;
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

#container a {
  text-decoration: none;
  color: #007bff;
  word-wrap: break-word;
}

#barkoderView {
  height: 400px;
}

.btnContainer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.actionButton {
  width: 100%;
  height: 40px;
  font-size: 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.actionButton:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.resultContainer {
  margin-top: 20px;
  width: 100%;
}

.resultImage {
  width: 100%;
  max-width: 200px;
  height: auto;
  margin-top: 10px;
  border-radius: 5px;
}
</style>
