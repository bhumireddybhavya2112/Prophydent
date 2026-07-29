const BasePage = require('./BasePage');
const logger = require('../utils/Logger');

class UploadAnalysisPage extends BasePage {
    // ----------------------------------------------------------------------
    // Selectors
    // ----------------------------------------------------------------------
    get pageHeader() { return $('.page-title'); }
    
    // Patient Selection (Doctor Only)
    get selectPatient() { return $('.patient-selector select'); }
    get lockedOverlay() { return $('.locked-overlay'); }
    
    // Upload Zone
    get uploadZone() { return $('.upload-zone'); }
    get inputFile() { return $('input#file-upload'); }
    get btnBrowse() { return $('label[for="file-upload"]'); }
    
    // States
    get emptyState() { return $('.empty-state'); }
    get scanningState() { return $('.scanning-state'); }
    get resultsState() { return $('.results-state'); }
    
    // Results
    get imagePreview() { return $('.image-preview'); }
    get boundingBoxes() { return $$('.bounding-box'); }
    get findingsTable() { return $('.findings-table'); }
    get markdownReport() { return $('.gemini-primary-report'); }
    
    // Actions
    get btnSaveReport() { return $('.results-state button:nth-of-type(1)'); }
    get btnScanAnother() { return $('.results-state button:nth-of-type(2)'); }

    // ----------------------------------------------------------------------
    // Methods
    // ----------------------------------------------------------------------

    /**
     * Navigates directly to analysis (requires auth session)
     */
    async open() {
        logger.info('Navigating to Upload & Analysis Page');
        await super.open('analysis');
        await this.waitForElement(this.pageHeader);
    }

    /**
     * Selects a patient from the dropdown (Doctor)
     */
    async selectFirstPatient() {
        logger.info('Selecting first available patient from dropdown');
        await this.waitForElement(this.selectPatient);
        
        // Wait for options to populate (skipping the placeholder)
        await browser.waitUntil(async () => {
            const options = await this.selectPatient.$$('option');
            return options.length > 1;
        }, { timeout: 10000, timeoutMsg: 'Patient list failed to load' });
        
        await this.selectPatient.selectByIndex(1);
        // Wait for locked overlay to disappear
        await browser.waitUntil(async () => {
            return !(await this.lockedOverlay.isDisplayed());
        }, { timeout: 5000 });
    }

    /**
     * Uploads an image using WebdriverIO setValue on the hidden input
     * @param {string} localFilePath 
     */
    async uploadImage(localFilePath) {
        logger.info(`Uploading image from path: ${localFilePath}`);
        // In WebdriverIO, if the input is hidden, we use execute to unhide it or just set value directly
        await browser.execute(function() {
            document.getElementById('file-upload').style.display = 'block';
        });
        
        await this.inputFile.setValue(localFilePath);
    }

    /**
     * Waits for the AI analysis to complete
     */
    async waitForAnalysisCompletion() {
        logger.info('Waiting for AI analysis to complete');
        await browser.waitUntil(async () => {
            return await this.resultsState.isDisplayed();
        }, { timeout: 30000, timeoutMsg: 'AI Analysis timed out or failed' });
    }
}

module.exports = new UploadAnalysisPage();
