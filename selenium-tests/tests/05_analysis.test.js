'use strict';

require('dotenv').config();
const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const DriverManager = require('../utils/driverManager');
const AuthPage = require('../pages/AuthPage');
const AnalysisPage = require('../pages/AnalysisPage');
const WaitHelpers = require('../utils/waitHelpers');
const logger = require('../utils/logger');
const config = require('../config/testConfig');

describe('05 - Analysis / Scan Upload', function () {
  this.timeout(90000);
  let driver, authPage, analysisPage;
  let isLoggedIn = false;

  before(async function () {
    driver       = await DriverManager.getDriver();
    authPage     = new AuthPage(driver);
    analysisPage = new AnalysisPage(driver);

    await authPage.open('doctor');
    await authPage.login(config.testEmail, config.testPassword);
    await WaitHelpers.sleep(5000);
    const url = await driver.getCurrentUrl();
    isLoggedIn = url.includes('/dashboard');
    logger.info(`Analysis suite auth: ${isLoggedIn}`);
  });

  // ─── Protected Route ──────────────────────────────────────────────────────
  describe('Protected Route', function () {
    it('TC-120 | /analysis redirects unauthenticated users to /welcome', async function () {
      if (isLoggedIn) { this.skip(); }
      await analysisPage.clearAuth();
      await analysisPage.navigate('/#/analysis');
      await WaitHelpers.sleep(3500);
      expect(await driver.getCurrentUrl()).to.include('/welcome');
    });
  });

  // ─── Analysis Page Structure ──────────────────────────────────────────────
  describe('Analysis Page – Structure', function () {
    beforeEach(async function () {
      if (!isLoggedIn) { this.skip(); return; }
      await analysisPage.open();
    });

    it('TC-121 | upload-analysis container is visible', async function () {
      expect(await analysisPage.isVisible()).to.be.true;
    });

    it('TC-122 | page title is "New Scan Analysis" for doctor role', async function () {
      const h = await analysisPage.getHeading();
      expect(h).to.include('Scan Analysis');
    });

    it('TC-123 | subtitle "Upload intraoral or panoramic images" is present', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Upload intraoral');
    });

    it('TC-124 | patient-selector dropdown is visible for doctor', async function () {
      expect(await analysisPage.isDisplayed(analysisPage.locators.patientSelector)).to.be.true;
    });

    it('TC-125 | default patient selector shows "Choose a patient"', async function () {
      const opts = await analysisPage.getPatientOptions();
      expect(opts.length).to.be.at.least(1);
      const firstText = await opts[0].getText();
      expect(firstText).to.include('Choose a patient');
    });

    it('TC-126 | locked-overlay is shown when no patient is selected', async function () {
      expect(await analysisPage.isLockedOverlayVisible()).to.be.true;
    });

    it('TC-127 | locked-overlay contains lock icon text "Patient Selection Required"', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Patient Selection Required');
    });

    it('TC-128 | empty-state panel is shown in results section initially', async function () {
      expect(await analysisPage.isEmptyStateVisible()).to.be.true;
    });

    it('TC-129 | results section shows "Awaiting Image" text', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Awaiting Image');
    });

    it('TC-130 | back button (ArrowLeft) is present', async function () {
      expect(await analysisPage.isPresent(analysisPage.locators.backBtn)).to.be.true;
    });

    it('TC-131 | back button navigates to /dashboard', async function () {
      await analysisPage.jsClick(analysisPage.locators.backBtn);
      await WaitHelpers.sleep(1500);
      expect(await driver.getCurrentUrl()).to.include('/dashboard');
    });

    it('TC-132 | analysis-grid layout is present', async function () {
      await analysisPage.open();
      const src = await driver.getPageSource();
      expect(src).to.include('analysis-grid');
    });

    it('TC-133 | upload-section has glass-panel class', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('glass-panel');
    });

    it('TC-134 | patient selector label says "Select Patient"', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Select Patient');
    });

    it('TC-135 | selecting a patient (if available) removes locked overlay', async function () {
      await analysisPage.open();
      const opts = await analysisPage.getPatientOptions();
      if (opts.length <= 1) { this.skip(); return; }
      const val = await opts[1].getAttribute('value');
      if (!val) { this.skip(); return; }
      await analysisPage.executeScript(
        `const s=document.querySelector('.patient-selector select');
         s.value=arguments[0];
         s.dispatchEvent(new Event('change',{bubbles:true}));`, val);
      await WaitHelpers.sleep(1000);
      expect(await analysisPage.isLockedOverlayVisible()).to.be.false;
    });

    it('TC-136 | upload-zone appears after patient is selected', async function () {
      if (!isLoggedIn) { this.skip(); return; }
      await analysisPage.open();
      const opts = await analysisPage.getPatientOptions();
      if (opts.length <= 1) { this.skip(); return; }
      const val = await opts[1].getAttribute('value');
      if (!val) { this.skip(); return; }
      await analysisPage.executeScript(
        `const s=document.querySelector('.patient-selector select');
         s.value=arguments[0];
         s.dispatchEvent(new Event('change',{bubbles:true}));`, val);
      await WaitHelpers.sleep(1000);
      expect(await analysisPage.isUploadZoneVisible()).to.be.true;
    });

    it('TC-137 | upload zone has drag-and-drop support text', async function () {
      await analysisPage.open();
      const opts = await analysisPage.getPatientOptions();
      if (opts.length <= 1) { this.skip(); return; }
      const val = await opts[1].getAttribute('value');
      if (!val) { this.skip(); return; }
      await analysisPage.executeScript(
        `const s=document.querySelector('.patient-selector select');
         s.value=arguments[0];
         s.dispatchEvent(new Event('change',{bubbles:true}));`, val);
      await WaitHelpers.sleep(1000);
      const src = await driver.getPageSource();
      expect(src).to.include('Drag');
    });

    it('TC-138 | file upload input element exists', async function () {
      await analysisPage.open();
      const opts = await analysisPage.getPatientOptions();
      if (opts.length <= 1) { this.skip(); return; }
      const val = await opts[1].getAttribute('value');
      if (!val) { this.skip(); return; }
      await analysisPage.executeScript(
        `const s=document.querySelector('.patient-selector select');
         s.value=arguments[0];
         s.dispatchEvent(new Event('change',{bubbles:true}));`, val);
      await WaitHelpers.sleep(1000);
      expect(await analysisPage.isPresent(analysisPage.locators.fileInput)).to.be.true;
    });

    it('TC-139 | Browse Files label is visible', async function () {
      await analysisPage.open();
      const opts = await analysisPage.getPatientOptions();
      if (opts.length <= 1) { this.skip(); return; }
      const val = await opts[1].getAttribute('value');
      if (!val) { this.skip(); return; }
      await analysisPage.executeScript(
        `const s=document.querySelector('.patient-selector select');
         s.value=arguments[0];
         s.dispatchEvent(new Event('change',{bubbles:true}));`, val);
      await WaitHelpers.sleep(1000);
      const src = await driver.getPageSource();
      expect(src).to.include('Browse Files');
    });
  });
});
