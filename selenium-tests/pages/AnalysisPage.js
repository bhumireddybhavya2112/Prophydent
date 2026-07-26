'use strict';

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class AnalysisPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      container:       By.css('.upload-analysis'),
      heading:         By.css('.page-title'),
      uploadZone:      By.css('.upload-zone'),
      fileInput:       By.css('input#file-upload'),
      browseBtn:       By.css('label[for="file-upload"]'),
      patientSelector: By.css('.patient-selector select'),
      lockedOverlay:   By.css('.locked-overlay'),
      scanningState:   By.css('.scanning-state'),
      resultsState:    By.css('.results-state'),
      emptyState:      By.css('.empty-state'),
      imagePreview:    By.css('.image-preview'),
      backBtn:         By.css('.btn-icon')
    };
  }

  async open() {
    await this.navigate('/#/analysis');
    await this.waitForElement(this.locators.container, 20000);
  }

  async isVisible()             { return this.isDisplayed(this.locators.container); }
  async getHeading()            { return this.getText(this.locators.heading); }
  async isUploadZoneVisible()   { return this.isDisplayed(this.locators.uploadZone); }
  async isLockedOverlayVisible(){ return this.isDisplayed(this.locators.lockedOverlay); }
  async isEmptyStateVisible()   { return this.isDisplayed(this.locators.emptyState); }

  async getPatientOptions() {
    try {
      const sel = await this.driver.findElement(this.locators.patientSelector);
      return sel.findElements(By.css('option'));
    } catch (e) { return []; }
  }
}

module.exports = AnalysisPage;
