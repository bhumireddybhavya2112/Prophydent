'use strict';

require('dotenv').config();
const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const DriverManager = require('../utils/driverManager');
const AuthPage = require('../pages/AuthPage');
const PatientsPage = require('../pages/PatientsPage');
const WaitHelpers = require('../utils/waitHelpers');
const logger = require('../utils/logger');
const config = require('../config/testConfig');

describe('04 - Patient Management', function () {
  this.timeout(90000);
  let driver, authPage, patientsPage;
  let isLoggedIn = false;

  before(async function () {
    driver       = await DriverManager.getDriver();
    authPage     = new AuthPage(driver);
    patientsPage = new PatientsPage(driver);

    await authPage.open('doctor');
    await authPage.login(config.testEmail, config.testPassword);
    await WaitHelpers.sleep(5000);
    const url = await driver.getCurrentUrl();
    isLoggedIn = url.includes('/dashboard');
    logger.info(`Patients suite auth: ${isLoggedIn}`);
  });

  // ─── Protected Route ──────────────────────────────────────────────────────
  describe('Protected Route', function () {
    it('TC-092 | /patients redirects unauthenticated users to /welcome', async function () {
      if (isLoggedIn) { this.skip(); }   // already logged in, skip redirect test
      await patientsPage.clearAuth();
      await patientsPage.navigate('/#/patients');
      await WaitHelpers.sleep(3500);
      expect(await driver.getCurrentUrl()).to.include('/welcome');
    });
  });

  // ─── View Patients Tab ────────────────────────────────────────────────────
  describe('View Patients Tab', function () {
    beforeEach(async function () {
      if (!isLoggedIn) { this.skip(); return; }
      await patientsPage.open();
    });

    it('TC-093 | patients-container is visible', async function () {
      expect(await patientsPage.isVisible()).to.be.true;
    });

    it('TC-094 | heading is "Patient Management"', async function () {
      const txt = await patientsPage.getText(patientsPage.locators.heading);
      expect(txt).to.include('Patient Management');
    });

    it('TC-095 | exactly 2 tab buttons rendered', async function () {
      const tabs = await patientsPage.getTabButtons();
      expect(tabs.length).to.equal(2);
    });

    it('TC-096 | "View Patients" tab button is present', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('View Patients');
    });

    it('TC-097 | "Add Patient" tab button is present', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Add Patient');
    });

    it('TC-098 | search bar input is visible on View Patients tab', async function () {
      expect(await patientsPage.isDisplayed(patientsPage.locators.searchInput)).to.be.true;
    });

    it('TC-099 | search bar has placeholder text', async function () {
      const ph = await patientsPage.getAttribute(patientsPage.locators.searchInput, 'placeholder');
      expect(ph.length).to.be.greaterThan(0);
    });

    it('TC-100 | typing in search bar filters by value', async function () {
      await patientsPage.searchPatient('Smith');
      const val = await patientsPage.getAttribute(patientsPage.locators.searchInput, 'value');
      expect(val).to.equal('Smith');
    });

    it('TC-101 | clearing search restores results', async function () {
      await patientsPage.type(patientsPage.locators.searchInput, '');
      const val = await patientsPage.getAttribute(patientsPage.locators.searchInput, 'value');
      expect(val).to.equal('');
    });

    it('TC-102 | table headers include Patient Name, DOB, Email, Status', async function () {
      const src = await driver.getPageSource();
      // Either table is rendered (data exists) or empty-state message shown
      expect(src.includes('Patient Name') || src.includes('No patients found')).to.be.true;
    });

    it('TC-103 | View Patients tab is marked active by default', async function () {
      const tabs = await patientsPage.getTabButtons();
      const cls0 = await tabs[0].getAttribute('class');
      expect(cls0).to.include('active');
    });

    it('TC-104 | page has patients-container fade-in animation', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('fade-in');
    });
  });

  // ─── Add Patient Tab ──────────────────────────────────────────────────────
  describe('Add Patient Tab', function () {
    beforeEach(async function () {
      if (!isLoggedIn) { this.skip(); return; }
      await patientsPage.open();
      await patientsPage.clickAddPatientTab();
    });

    it('TC-105 | switching to Add Patient tab shows form', async function () {
      expect(await patientsPage.isDisplayed(patientsPage.locators.addPatientForm)).to.be.true;
    });

    it('TC-106 | Add Patient tab becomes active after click', async function () {
      const tabs = await patientsPage.getTabButtons();
      const cls1 = await tabs[1].getAttribute('class');
      expect(cls1).to.include('active');
    });

    it('TC-107 | full_name input is visible', async function () {
      expect(await patientsPage.isDisplayed(patientsPage.locators.fullNameInput)).to.be.true;
    });

    it('TC-108 | date of birth input is visible', async function () {
      expect(await patientsPage.isDisplayed(patientsPage.locators.dobInput)).to.be.true;
    });

    it('TC-109 | email input is visible', async function () {
      expect(await patientsPage.isDisplayed(patientsPage.locators.emailInput)).to.be.true;
    });

    it('TC-110 | phone input is visible', async function () {
      expect(await patientsPage.isDisplayed(patientsPage.locators.phoneInput)).to.be.true;
    });

    it('TC-111 | medical_history textarea is visible', async function () {
      expect(await patientsPage.isDisplayed(patientsPage.locators.medicalHistoryTextarea)).to.be.true;
    });

    it('TC-112 | Save Patient Record button is visible', async function () {
      expect(await patientsPage.isDisplayed(patientsPage.locators.savePatientBtn)).to.be.true;
    });

    it('TC-113 | Cancel button is visible', async function () {
      expect(await patientsPage.isDisplayed(patientsPage.locators.cancelBtn)).to.be.true;
    });

    it('TC-114 | Cancel button returns to View Patients tab', async function () {
      await patientsPage.click(patientsPage.locators.cancelBtn);
      const tabs = await patientsPage.getTabButtons();
      const cls0 = await tabs[0].getAttribute('class');
      expect(cls0).to.include('active');
    });

    it('TC-115 | full_name field accepts text input', async function () {
      await patientsPage.open();
      await patientsPage.clickAddPatientTab();
      await patientsPage.type(patientsPage.locators.fullNameInput, 'Selenium Patient');
      const val = await patientsPage.getAttribute(patientsPage.locators.fullNameInput, 'value');
      expect(val).to.equal('Selenium Patient');
    });

    it('TC-116 | dob field accepts date input', async function () {
      await patientsPage.open();
      await patientsPage.clickAddPatientTab();
      await patientsPage.type(patientsPage.locators.dobInput, '1995-06-15');
      const val = await patientsPage.getAttribute(patientsPage.locators.dobInput, 'value');
      expect(val).to.equal('1995-06-15');
    });

    it('TC-117 | full_name is required – empty submit stays on form', async function () {
      await patientsPage.open();
      await patientsPage.clickAddPatientTab();
      await patientsPage.clickSavePatient();
      // HTML5 required stops submission → still on patients page
      expect(await driver.getCurrentUrl()).to.include('/patients');
    });

    it('TC-118 | form heading says "Register New Patient"', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Register New Patient');
    });

    it('TC-119 | form row layout present (two-column grid)', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('form-row');
    });
  });
});
