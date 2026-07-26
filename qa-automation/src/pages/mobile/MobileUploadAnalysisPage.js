const BaseMobilePage = require('./BaseMobilePage');
const logger = require('../../utils/Logger');

class MobileUploadAnalysisPage extends BaseMobilePage {
    // ----------------------------------------------------------------------
    // Selectors
    // ----------------------------------------------------------------------
    get pageHeader() { return $('.page-title'); }
    
    // Patient Selection (Doctor Only)
    get selectPatient() { return $('.patient-selector select'); }
    get lockedOverlay() { return $('.locked-overlay'); }
    
    // Mobile Native Upload Zone Actions
    get btnTakePhoto() { return $('.native-upload-zone button.btn-primary'); }
    get btnChooseFromGallery() { return $('.native-upload-zone button.btn-outline'); }
    
    // States
    get emptyState() { return $('.empty-state'); }
    get scanningState() { return $('.scanning-state'); }
    get resultsState() { return $('.results-state'); }
    
    // Results
    get imagePreview() { return $('.image-preview'); }
    get boundingBoxes() { return $$('.bounding-box'); }
    get findingsTable() { return $('.findings-table'); }
    get btnSaveReport() { return $('.results-state button:nth-of-type(1)'); }
    get btnScanAnother() { return $('.results-state button:nth-of-type(2)'); }

    // ----------------------------------------------------------------------
    // Native Android Selectors
    // ----------------------------------------------------------------------
    get nativeShutterBtn() { 
        return $('//android.widget.ImageView[@content-desc="Shutter" or @resource-id="com.android.camera2:id/shutter_button" or @resource-id="com.android.camera:id/shutter_button" or @content-desc="Take picture"]'); 
    }
    
    get nativeCameraAcceptBtn() { 
        return $('//android.widget.ImageView[@content-desc="Done" or @resource-id="com.android.camera2:id/done_button" or @text="OK" or @text="SAVE" or @resource-id="com.android.camera2:id/confirm_button"]'); 
    }

    get nativeFirstGalleryItem() {
        return $('//android.widget.ImageView[contains(@resource-id, "icon") or contains(@resource-id, "thumbnail") or @content-desc="Photo" or @index="0"]');
    }

    // ----------------------------------------------------------------------
    // Methods
    // ----------------------------------------------------------------------

    /**
     * Triggers the native camera and captures an image
     */
    async captureImageFromNativeCamera() {
        logger.info('Appium: Tapping native Take Photo button in WebView');
        await this.clickElement(this.btnTakePhoto);
        
        // Handle native permissions
        await this.handlePermissionDialogIfShown();
        
        // Switch to native context for camera interactions
        await this.switchToNativeContext();
        
        logger.info('Appium Native: Clicking camera shutter button');
        await this.clickElement(this.nativeShutterBtn);
        await browser.pause(2000); // Wait for capture processing
        
        logger.info('Appium Native: Clicking accept/confirm picture button');
        await this.clickElement(this.nativeCameraAcceptBtn);
        
        // Switch back to WebView context
        await this.switchToWebViewContext();
    }

    /**
     * Selects an image from the device's native gallery picker
     */
    async selectImageFromNativeGallery() {
        logger.info('Appium: Tapping native Choose from Gallery button in WebView');
        await this.clickElement(this.btnChooseFromGallery);
        
        // Handle native permissions
        await this.handlePermissionDialogIfShown();
        
        // Switch to native context
        await this.switchToNativeContext();
        
        logger.info('Appium Native: Selecting first image thumbnail from native photo gallery');
        await this.clickElement(this.nativeFirstGalleryItem);
        
        // Switch back to WebView context
        await this.switchToWebViewContext();
    }

    /**
     * Selects a patient from the dropdown (Doctor)
     */
    async selectFirstPatient() {
        logger.info('Appium: Selecting patient from dropdown');
        await this.waitForElement(this.selectPatient);
        await this.selectPatient.selectByIndex(1);
        await browser.waitUntil(async () => {
            return !(await this.lockedOverlay.isDisplayed());
        }, { timeout: 5000 });
    }
}

module.exports = new MobileUploadAnalysisPage();
