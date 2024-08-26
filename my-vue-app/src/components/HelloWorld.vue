<template>
  <div id="container">
    <div class="app_title" :style="{backgroundPosition: isScanning || scannedResult?.thumbnailImage  ? 'top' : 'bottom' }">
      <div class="title_settings_container">
        <!-- <h4 v-if="isScanning && !scannedResult?.thumbnailImage" @click="stopScanning">Back</h4> -->
        <img v-if="isScanning && !scannedResult?.thumbnailImage" @click="stopScanning" alt="touch icon" src="../assets/close.svg">
        <h2 style="width: 100%;">Cordova + Vue</h2>
        <img alt="settings icon" src="../assets/Settings.svg" @click="handleSettingsClick"> 
      </div>
    </div>
    <div id="barkoderView" ref="barkoderView" style="height: 85vh" :style="{ minHeight: scannedResult?.thumbnailImage && !isScanning ? '85vh' : '85vh', top:   '60px'  }">
      <img v-if="scannedResult?.resultImage" class="fullResultImage" :src="scannedResult?.resultImage" @click="startScanning" alt="Scanned Thumbnail" />
      <div v-if="scannedResult?.resultImage" class="tap_anywhere_popup" @click="startScanning">
        <img alt="touch icon" src="../assets/touch_app.svg">
        <span>Tap anywhere to continue</span>
      </div>
    </div>




    <div class="btnContainer" :style="{borderRadius: !isScanning ? '28px 28px 0 0' : '0 0 0 0'}" :class="{ 'animate-btnContainer': scannedResult?.type  }">
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
          <div class="recent_scan_btn" v-if="!isScanning" @click="handleOpenRecentScansPopup">
            <img  width="40" alt="recent scan icon" src="../assets/recent.webp" />
            <span style="font-size: 14px;">Recent</span>
          </div>
          <div class="actionButton" v-if="!isScanning" @click="toggleScan">
            <img  width="40" alt="scan icon" src="../assets/scan-circle.svg" />
          </div>
          <div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;" v-if="!isScanning">
            <img  width="40" alt="info icon" src="../assets/info.svg" />
          </div>
          <div v-if="isScanning" class="scanning_on_buttons">
            <button v-if="isScanning && isFlashOn" @click="toggleFlash" class="click_btn"><img alt="flash icon" src="../assets/flash_on.svg" /></button>
            <button v-if="isScanning && !isFlashOn" @click="toggleFlash" class="click_btn"><img alt="flash icon" src="../assets/flash_off.svg"/></button>
            <button v-if="isScanning && currentZoomFactor > 1.0" @click="zoomOut" class="click_btn"><img alt="zoom out icon" src="../assets/zoom_out.svg" /></button>
            <button v-if="isScanning && currentZoomFactor <= 1.0" @click="zoomIn" class="click_btn"><img alt="zoom in icon" src="../assets/Zoom.svg" /></button>
          </div>
        </div>
      </div>
   
    </div>

    <div id="settingsPopup" v-if="isSettingsPopupVisible" >
      <div class="section_title_container">
        <img alt="back icon" src="../assets/back_arrow.svg" @click="closeSettings"> 
        <h2 style="width: 100%; text-align: start; color: #291716; font-size: 22px;">Settings</h2>
      </div>
    <div class="settings_container">
      <div class="settings_title">
        <h3 style="margin: 0">Webhook Settings</h3>
      </div>
      <div class="settings_item toggle_btn">
        <span>Enabled Webhook</span>
        <div class="toggle_switch">
          <input type="checkbox" id="enabled_webhook"  v-model="isWebhookEnabled">
          <label for="enabled_webhook"></label>
        </div>
      </div>
      <div class="settings_item" @click="handleWebhookConfigClick"  :class="{ disabled: !isWebhookEnabled }">
        <span>Webhook Config</span>
        <div class="arrow_settings_container"> <img alt="right icon" src="../assets/right_arrow.svg">  </div>
      </div>
      <div class="settings_item toggle_btn">
        <span>Webhook Confirmation Feedback</span>
        <div class="toggle_switch">
          <input type="checkbox" id="confirmation_feedback">
          <label for="confirmation_feedback"></label>
        </div>
      </div>
    </div>

    <div class="settings_container">
      <div class="settings_title">
        <h3 style="margin: 0">General Settings</h3>
      </div>
      <div class="settings_item toggle_btn">
        <span>Enabled Search on Web</span>
        <div class="toggle_switch">
          <input type="checkbox" id="enabled_websearch"  v-model="isWebSearchEnabled">
          <label for="enabled_websearch"></label>
        </div>
      </div>
      <div class="settings_item" @click="handleOpenEnginesPopup" :class="{ disabled: !isWebSearchEnabled }">
        <span>Default Search Engine</span>
        <div class="arrow_settings_container"> <img alt="right icon" src="../assets/right_arrow.svg">  </div>
      </div>
    </div>

    <div class="settings_container">
      <div class="settings_title">
        <h3 style="margin: 0">Scanning Mode Settings</h3>
      </div>
      <div class="settings_item">
        <span>All 1D Codes</span>
        <div class="arrow_settings_container"> <img alt="right icon" src="../assets/right_arrow.svg">  </div>
      </div>
      <div class="settings_item">
        <span>1D Industrial</span>
        <div class="arrow_settings_container"> <img alt="right icon" src="../assets/right_arrow.svg">  </div>
      </div>

    </div>

  </div>


  <div id="recentScansPopup" v-if="isRecentScansPopupVisible">
      <div class="section_title_container" style="position: relative;" >
        <img alt="back icon" src="../assets/back_arrow.svg" @click="closeRecentScans"> 
        <h2 style="width: 100%; text-align: start; color: #291716; font-size: 22px;">Recent Scans</h2>
        <img alt="more options" src="../assets/more_vert.svg" @click="openRecentScansMorePopup"> 
      </div>

      <div id="morePopup" v-if="isMorePopupVisible" ref="morePopupRef"> 
      <div class="more_popup_container">
        <div class="delete_all_container" :class="{ 'disabled': recentScans.length < 1 }" @click="recentScans.length > 0 ? openConfirmDeletePopup() : null">
          <img alt="delete icon" src="../assets/delete.svg" />
          <span>Delete All</span>
        </div>
      </div>

  </div>
      <div class="recent_scans_container">
      <div v-if="recentScans.length > 0" class="recent_scans_list">
        <div v-for="(scan, index) in recentScans" :key="index" class="recent_scan_item" @click="openBarcodeDetailsPopup(scan, index)">
          <div class="recent_scan_details">
            <div class="recent_scan_barcode_icon">
              <img alt="barcode icon" src="../assets/1d-barcode.svg" />
            </div>
            <div class="recent_text_info">
              <span class="recent_scan_title">{{ scan.textualData }}</span>
              <span class="recent_scan_subtitle">{{ scan.type }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <p>No recent scans.</p>
      </div>
    </div>

  </div>


  <div id="barcodeDetailsPopup" v-if="isBarcodeDetailsPopupVisible">
      <div class="section_title_container" style="position: relative;" >
        <img alt="back icon" src="../assets/back_arrow.svg" @click="closeBarcodeDetailsPopup"> 
        <h2 style="width: 100%; text-align: start; color: #291716; font-size: 22px;">Barcode Details</h2>
        <img alt="more options" src="../assets/more_vert.svg" @click="openDetailsMorePopup"> 
        <!-- <img alt="more options" src="../assets/more_vert.svg" @click="openConfirmDeletePopup(selectedBarcode.id)">  -->
      </div>
 
      <div class="details_image_container">
        <div class="details_icon_wrapper">
          <img width="48" alt="barcode icon" src="../assets/1d-barcode.svg" />
        </div>
      </div>
      <div class="details_section_title">
        <span>Data</span>
      </div>
      <div class="details_text_info">
        <span style="color:#666666; font-weight: 500; font-size: 12px;">Barcode Type</span>
        <span style="font-size: 16px; letter-spacing: 0.5px; font-weight: 500;">{{ selectedBarcode.type }}</span>
      </div>
      <div class="details_text_info">
        <span style="color:#666666; font-weight: 500; font-size: 12px;">Value</span>
        <span style="font-size: 16px; letter-spacing: 0.5px; font-weight: 500;">{{ selectedBarcode.textualData }}</span>
      </div>

      <div id="detailsMorePopup" v-if="isDetailsMorePopupVisible" ref="detailsMorePopupRef"> 
      <div class="more_popup_container">
        <div class="delete_all_container" @click="deleteScannedBarcode">
          <img alt="delete icon" src="../assets/delete.svg" />
          <span>Delete</span>
        </div>
      </div>
      </div>
     </div>


     <div id="confirmDeletePopup" v-if="isConfirmDeletePopupVisible" class="delete_popup_confirmation">
  <div>
    <h4>This action permanently deletes all recent scans</h4>
    <div class="confirm_delete_container">
      <span class="confirm_buttons" @click="closeConfirmDeletePopup">CANCEL</span>
      <span class="confirm_buttons" @click="deleteScan">DELETE ALL</span>
    </div>
  </div>
</div>


 
  <div id="webhookConfigPopup" v-if="isWebhookConfigVisible">
    <div class="section_title_container">
        <img alt="back icon" src="../assets/back_arrow.svg" @click="closeWebhookConfig"> 
      <h3 style="width: 100%; text-align: start; color: #291716; font-size: 16px;">Configure Webhook</h3>
      <span class="save_btn" @click="saveWebhookConfig">Save</span>
    </div>
    <div class="webhook_config_content">
        <input id="url" class="textInput" type="text" placeholder="Enter Wehbook url" v-model="webhookUrl" />
        <input id="secret_word" class="textInput" type="text" placeholder="Enter Secret Word"  v-model="secretWord"/>

      <div class="webhook_config_btn_container">
        <button @click="resetWebhookConfig">Reset Value</button>
      </div>
    </div>
  </div>

  <div id="overlay" v-if="isSearchEnginePopupVisible || isConfirmDeletePopupVisible"></div>
  <div id="searchEnginePopup" v-if="isSearchEnginePopupVisible">
    <div style="padding: 8px; height: auto; margin-bottom: 16px;">
      <h3 style="width: 100%; text-align: start; color: #291716; font-size: 24px; margin: 0;">Default Search Engine</h3>
    </div>

    <div class="engines_container">
      <div class="engine_checkbox_container">
        <input type="radio" name="engine_choice" id="google" value="google" v-model="temporaryEngine">
        <label for="google">Google</label>
      </div>
      <div class="engine_checkbox_container">
        <input  type="radio" name="engine_choice" id="yahoo" value="yahoo" v-model="temporaryEngine">
        <label for="yahoo">Yahoo</label>
      </div>
      <div class="engine_checkbox_container">
        <input  type="radio" name="engine_choice" id="duckDuckGo" value="duckDuckGo" v-model="temporaryEngine">
        <label for="duckDuckGo">DuckDuckGo</label>
      </div>
      <div class="engine_checkbox_container">
        <input  type="radio" name="engine_choice" id="yandex" value="yandex" v-model="temporaryEngine">
        <label for="yandex">Yandex</label>
      </div>
      <div class="engine_checkbox_container">
        <input  type="radio" name="engine_choice" id="bing"  value="bing" v-model="temporaryEngine">
        <label for="bing">Bing</label>
      </div>
      <div class="engine_checkbox_container">
        <input  type="radio" name="engine_choice" id="brave" value="brave" v-model="temporaryEngine">
        <label for="brave">Brave</label>
      </div>

    </div>
    <div class="footer_btn_container">
      <button @click="closeEnginesPopup">Cancel</button>
      <button @click="saveSelectedEngine">Save</button>
    </div>
  </div>

</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { BarcodeType } from '../../../plugins/barkoder-cordova-plugin/www/BarkoderConfig.js';

export default {
  setup() {
    const barkoderViewRef = ref('');
    const scannedResult = ref(null);
    const isSettingsPopupVisible = ref(false);
    const isWebhookConfigVisible = ref(false);
    const isSearchEnginePopupVisible = ref(false);
    const isRecentScansPopupVisible = ref(false);
    const isMorePopupVisible = ref(false);
    const isDetailsMorePopupVisible = ref(false);
    const isConfirmDeletePopupVisible = ref(false);
    const isBarcodeDetailsPopupVisible = ref(null);
    const isScanning = ref(false);
    const isFlashOn = ref(false);
    const isWebhookEnabled = ref(false);
    const isWebSearchEnabled = ref(false);
    const selectedBarcode = ref(null);
    const permanentEngine = ref('google');
    const temporaryEngine = ref('');
    const currentZoomFactor = ref(1.0);

    const webhookUrl = ref(localStorage.getItem('webhookUrl') || '');
    const secretWord = ref(localStorage.getItem('secretWord') || '');
    const recentScans = ref(localStorage.getItem('recentScans') || [])

    const morePopupRef = ref(null);
    const detailsMorePopupRef = ref(null);
    

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
      console.log(isScanning.value);
      if (isScanning.value) {
        stopScanning();
      } else {
        startScanning();
      }
    };

    const startScanning = async () => {
      scannedResult.value = null;
      isScanning.value = true;

      try {
        const boundingRect = await barkoderViewRef.value.getBoundingClientRect();

        window.Barkoder.registerWithLicenseKey('Your_license_key');

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

          scannedResult.value = {
            id: randomId,
            textualData: barkoderResult.textualData,
            type: barkoderResult.barcodeTypeName,
            resultImage: "data:image/jpeg;base64," + barkoderResult.resultImageAsBase64,
            thumbnailImage: "data:image/jpeg;base64," + barkoderResult.resultThumbnailAsBase64,
        };

        window.Barkoder.stopScanning();
        isScanning.value = false;

        recentScans.value.push(scannedResult.value);
        localStorage.setItem('recentScans', JSON.stringify(recentScans.value));
        
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
 
    const handleSettingsClick = () => {
      if (!isSettingsPopupVisible.value) {
        isSettingsPopupVisible.value = true;
      }

  if (isScanning.value) {
    stopScanning();
  }
 
};

const handleWebhookConfigClick = () => {
    loadWebhookConfig();
  if (!isWebhookConfigVisible.value) {
    isWebhookConfigVisible.value = true;
    
  }
}

const handleOpenEnginesPopup = () => {
  if (!isSearchEnginePopupVisible.value) {
    temporaryEngine.value = permanentEngine.value;
    isSearchEnginePopupVisible.value = true;
  }
}

const handleOpenRecentScansPopup = () => {
  if (!isRecentScansPopupVisible.value) {
    isRecentScansPopupVisible.value = true;
  }
}

const openRecentScansMorePopup = () => {
    isMorePopupVisible.value = true;
}

const openDetailsMorePopup = () => {
  isDetailsMorePopupVisible.value = true;
}

const closeSettings = () => {
  isSettingsPopupVisible.value = false;
};

const closeRecentScans = () => {
  isRecentScansPopupVisible.value = false;
}

const closeMorePopup = () => {
      isMorePopupVisible.value = false;
    };

const closeDetailsMorePopup = () => {
      isDetailsMorePopupVisible.value = false;
    };

const handleClickOutside = (event) => {
      if (morePopupRef.value && !morePopupRef.value.contains(event.target)) {
        closeMorePopup();
      }
      if (detailsMorePopupRef.value && !detailsMorePopupRef.value.contains(event.target)) {
        closeDetailsMorePopup();
      }
    };

const closeWebhookConfig = () => {
  isWebhookConfigVisible.value = false;
}

const closeEnginesPopup = () => {
  isSearchEnginePopupVisible.value = false;
}

const saveSelectedEngine = () => {
  permanentEngine.value = temporaryEngine.value;
  closeEnginesPopup()
}

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

    const handleWebhookConfiguration = async () => {
       console.log('Webhook URL:', webhookUrl.value); 
       if (!webhookUrl.value) {
         alert('The Webhook URL is not set.');
         return;
       }
     
       if (!scannedResult.value) {
         alert('No scanned result to send.');
         return;
       }
     
       try {
         alert('Send scanned result to: ' + webhookUrl.value);
         const response = await fetch(webhookUrl.value, {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify(scannedResult.value),
         });
       
         if (!response.ok) {
           throw new Error(`Network response was not ok. Status: ${response.statusText}`);
         }
       
         const result = await response.json();
         alert('Webhook response: ' + JSON.stringify(result));
       } catch (error) {
          alert('Error sending webhook request: ' + error.message);
      }
};

    const handleSearch = () => {
      if (scannedResult.value && scannedResult.value.textualData) {
        const searchQuery = encodeURIComponent(scannedResult.value.textualData);
        const searchEngines = {
          google: 'https://www.google.com/search?q=',
          yahoo: 'https://search.yahoo.com/search?p=',
          duckDuckGo: 'https://www.duckduckgo.com/?q=',
          yandex: 'https://yandex.com/search/?text=',
          bing: 'https://www.bing.com/search?q=',
          brave: 'https://search.brave.com/search?q='
        };

        const baseUrl = searchEngines[permanentEngine.value] || searchEngines.google;
        const searchUrl = `${baseUrl}${searchQuery}`;   
        window.open(searchUrl, '_blank');
      } else {
        console.error('No textual data available to search.');
      }
    };

    const saveWebhookConfig = () => {
      localStorage.setItem('webhookUrl', webhookUrl.value);
      localStorage.setItem('secretWord', secretWord.value);

      closeWebhookConfig();

    };

    const loadWebhookConfig = () => {
      webhookUrl.value = localStorage.getItem('webhookUrl') || '';
      secretWord.value = localStorage.getItem('secretWord') || '';
    };

    const resetWebhookConfig = () => {
      localStorage.removeItem('webhookUrl');
      localStorage.removeItem('secretWord');

      webhookUrl.value = '';
      secretWord.value = '';
    };

    const openConfirmDeletePopup = () => {
      isConfirmDeletePopupVisible.value = true;
    }

    const closeConfirmDeletePopup = () => {
      isConfirmDeletePopupVisible.value = false;
    };

    const deleteScan = () => {
        recentScans.value = [];
        localStorage.removeItem('recentScans');
        closeConfirmDeletePopup();  
    };

    const deleteScannedBarcode = () => {
      recentScans.value = recentScans.value.filter(barcode => barcode.id !== selectedBarcode.value.id);
      localStorage.setItem('recentScans', JSON.stringify(recentScans.value));
      closeBarcodeDetailsPopup();
    }

    const openBarcodeDetailsPopup = (barcode) => {
      isBarcodeDetailsPopupVisible.value = true;

      selectedBarcode.value = barcode;
    }

    const closeBarcodeDetailsPopup = () => {
      isBarcodeDetailsPopupVisible.value = false;
      selectedBarcode.value = null;
    }

    onMounted(() => {
      barkoderViewRef.value = document.getElementById('barkoderView');
      recentScans.value = JSON.parse(localStorage.getItem('recentScans') || '[]');
      document.addEventListener('mousedown', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('mousedown', handleClickOutside);
    });

    return {
      barkoderViewRef,
      startScanning,
      stopScanning,
      handleSettingsClick,
      closeSettings,
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
      handleWebhookConfiguration,
      isSettingsPopupVisible,
      isWebhookConfigVisible,
      isSearchEnginePopupVisible,
      handleOpenEnginesPopup,
      handleWebhookConfigClick,
      closeWebhookConfig,
      closeEnginesPopup,
      saveWebhookConfig,
      webhookUrl,
      secretWord,
      loadWebhookConfig,
      resetWebhookConfig,
      recentScans,
      closeRecentScans,
      isRecentScansPopupVisible,
      handleOpenRecentScansPopup,
      openRecentScansMorePopup,
      isMorePopupVisible,
      isDetailsMorePopupVisible,
      morePopupRef,
      isConfirmDeletePopupVisible,
      openConfirmDeletePopup,
      closeConfirmDeletePopup,
      deleteScan,
      isBarcodeDetailsPopupVisible,
      openBarcodeDetailsPopup,
      closeBarcodeDetailsPopup,
      selectedBarcode,
      isWebhookEnabled,
      isWebSearchEnabled,
      permanentEngine,
      temporaryEngine,
      saveSelectedEngine,
      detailsMorePopupRef,
      deleteScannedBarcode,
      openDetailsMorePopup,
      closeDetailsMorePopup
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
  position: relative;
  z-index: 1;
}

#settingsPopup, #webhookConfigPopup, #recentScansPopup, #barcodeDetailsPopup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1000;
  background-color: #FFFFFF;
}

#overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1000;
}

#searchEnginePopup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 16px;
    z-index: 1001; 
    width: 312px;
    min-width: 280px;
    max-width: 560px;
    background: #FFFAFA;
    border-radius: 28px;
}

.section_title_container {
  background-color: #FFF2F4;
  height: 80px;
  display: flex;
  align-items: center;
  padding-right: 16px;
}

.settings_container {
  text-align: start;
}

.settings_title {
  background-color: #FFFAFA;
  color: #FF3355;
  font-weight: 500;
  line-height: 20px;
  font-size: 14px;
  padding: 36px 16px 16px 16px;
}


.settings_item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  height: 72px;
  padding: 0 16px;
}

.settings_item span {
  font-size: 16px;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.settings_item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.settings_item.disabled:hover {
  pointer-events: none;
}

.toggle_btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle_switch {
  position: relative;
  display: inline-block;
  width: 56px;
  height: 36px;
}

.toggle_switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle_switch label {
  cursor: pointer;
  background-color: white;
  border-radius: 50px;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  transition: background-color 0.3s;
  border: 2px solid #916E6D;
  width: 52px;
  height: 32px;
}

.toggle_switch label::before {
  content: "";
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color:  #916E6D;
  left: 3px;
  bottom: 4px;
  transition: transform 0.3s; 
}

.toggle_switch input:checked + label {
  background-color: #E52E4C;
  border-color: #E52E4C;
}

.toggle_switch input:checked + label::before {
  transform: translateX(22px);
  background-color: white;
}

.arrow_settings_container {
  width: 40px; 
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  min-height: 85vh;
  height: 100%;
  position: relative;
  top: 60px;

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
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 8vh;
  height: fit-content;
  background-color: #FFFFFF;
  position: absolute;
  bottom: 0px;
  z-index: 9999;
  border-radius: 28px 28px 0 0;
  
  
}

.btnContainer .buttons {
  width: 80%;
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: space-between;
  align-items: center;
}

.actionButton {
  width: 50px;
  height: 50px;
  font-size: 16px;
  color: #fff;
  border: 2px solid black;
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
  top: 0;
  z-index: 50;
  background-color: transparent;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  width: 100%;
  background-image: url('../assets/bg-header.png');
  background-size: cover; 
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
  border: 2px solid #e31c30;
  border-radius: 8px;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ff9999;
}

.title_settings_container {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.recent_scans_container {
  width: 100%;
  padding: 0 20px;
}

.save_btn {
  width: 63px;
  font-weight: 600;
  font-size: 14px;
  color: #E52E4C;
  line-height: 21px;
}

.webhook_config_content {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 24px;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.webhook_config_btn_container {
  width: 100%;
  display: flex;
  gap: 8px;
  padding: 8px;
}

.textInput {
  height: 56px;
  border-radius: 4px;
  border: 1px solid #916E6D;
  font-size: 16px;
  outline: none;
  padding: 0 16px;
  transition: border-color 0.3s;
}

.textInput:focus {
  border-color:  #E52E4C;
}

.webhook_config_btn_container button {
  border-radius: 40px;
  height: 40px;
  width: 152px;
  background-color: #E52E4C;
  color: #FFFFFF;
  font-weight: 600;
  font-size: 16px;
  border: none;
}

.engines_container {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.engine_checkbox_container {
  display: flex;
  align-items: center;
  height: 56px;
  gap: 16px;
  padding: 0 16px;
  position: relative;
}

.engine_checkbox_container input[type="radio"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.engine_checkbox_container label {
  color: #000000;
  font-size: 16px;
  line-height: 24px;
  position: relative;
  cursor: pointer;
  padding-left: 40px; 
}

.engine_checkbox_container label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px; 
  height: 20px; 
  border-radius: 50%;
  background: #FFFAFA;
  border: 2px solid #000000;
  transition: background 0.3s, border 0.3s;
}

.engine_checkbox_container input[type="radio"] {
  display: none; 
}

.engine_checkbox_container input[type="radio"]:checked + label::before {
  border-color: #E52E4C;
}



.engine_checkbox_container input[type="radio"]:checked + label::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px; 
  height: 12px; 
  border-radius: 50%;
  background: #E52E4C; 
}

.footer_btn_container {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-bottom: 8px;
}

.footer_btn_container button {
  background-color: #FFFAFA;
  border: none;
  color: #E52E4C;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  padding: 10px 16px;
}

.recent_scan_barcode_icon {
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFFAFA;
  border-radius: 100px;
}

.recent_scan_details {
  display: flex;
  align-items: center;
  gap: 16px;
}

.recent_text_info {
  display: flex;
  flex-direction: column;
  align-items: self-start;
}

.recent_scan_item {
  height: 72px;
  display: flex;
  align-items: center;
}

#morePopup, #detailsMorePopup {
  position: absolute;
  z-index: 9999;
  top: 55px;
  right: 10px;
  width: 150px;
  height: fit-content;
  background: #FFFAFA;
  box-shadow: 0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  padding: 16px;
}

.more_popup_container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 56px;
}

.delete_all_container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.recent_scan_btn {
  display:flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.scanning_on_buttons {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

#confirmDeletePopup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); 
  width: 90%;
  z-index: 9999;
  background: #FFFAFA;
  box-shadow: 0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  padding: 16px;
}

.confirm_delete_container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.confirm_buttons {
  background-color: #FFFAFA;
  border: none;
  color: #E52E4C;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  padding: 10px 16px;
}

.delete_all_container.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete_all_container.disabled img {
  filter: grayscale(100%);
}

.details_image_container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 128px;
  background: #FFFAFA;
  padding: 16px;
}

.details_icon_wrapper {
  height: 96px;
  width: 96px;
  background: #FFFFFF;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.details_section_title {
  background-color: #FFFAFA;
  height: 72px;
  padding: 16px;
  display: flex;
  align-items: flex-end;
}

.details_section_title span {
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.1px;
  color: #FF3355;
}

.details_text_info {
  height: 57px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 5px;
  padding: 0 16px;
  border-bottom: 1px solid #fff2f4;
}
</style>
