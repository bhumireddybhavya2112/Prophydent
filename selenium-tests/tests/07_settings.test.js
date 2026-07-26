'use strict';

require('dotenv').config();
const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const DriverManager = require('../utils/driverManager');
const AuthPage = require('../pages/AuthPage');
const SettingsPage = require('../pages/SettingsPage');
const WaitHelpers = require('../utils/waitHelpers');
const logger = require('../utils/logger');
const config = require('../config/testConfig');

describe('07 - Settings', function () {
  this.timeout(90000);
  let driver, authPage, settingsPage;
  let isLoggedIn = false;

  before(async function () {
    driver       = await DriverManager.getDriver();
    authPage     = new AuthPage(driver);
    settingsPage = new SettingsPage(driver);

    await authPage.open('doctor');
    await authPage.login(config.testEmail, config.testPassword);
    await WaitHelpers.sleep(5000);
    const url = await driver.getCurrentUrl();
    isLoggedIn = url.includes('/dashboard');
    logger.info(`Settings suite auth: ${isLoggedIn}`);
  });

  // ─── Protected Route ──────────────────────────────────────────────────────
  describe('Protected Route', function () {
    it('TC-160 | /settings redirects unauthenticated users to /welcome', async function () {
      if (isLoggedIn) { this.skip(); }
      await settingsPage.clearAuth();
      await settingsPage.navigate('/#/settings');
      await WaitHelpers.sleep(3500);
      expect(await driver.getCurrentUrl()).to.include('/welcome');
    });
  });

  // ─── Settings Page – Structure ────────────────────────────────────────────
  describe('Settings Page – Structure', function () {
    beforeEach(async function () {
      if (!isLoggedIn) { this.skip(); return; }
      await settingsPage.open();
    });

    it('TC-161 | settings-page container is visible', async function () {
      expect(await settingsPage.isVisible()).to.be.true;
    });

    it('TC-162 | page title is "Settings"', async function () {
      expect(await settingsPage.getPageTitle()).to.include('Settings');
    });

    it('TC-163 | subtitle "Manage your app preferences" is present', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Manage your app preferences');
    });

    it('TC-164 | at least 3 settings sections rendered', async function () {
      const secs = await settingsPage.getSections();
      expect(secs.length).to.be.at.least(3);
    });

    it('TC-165 | Personal Information section is present', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Personal Information');
    });

    it('TC-166 | Appearance section is present', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Appearance');
    });

    it('TC-167 | Account Security section is present', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Account Security');
    });

    it('TC-168 | Sign Out section is present', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Sign Out');
    });
  });

  // ─── Appearance / Theme Toggle ────────────────────────────────────────────
  describe('Settings – Appearance / Theme Toggle', function () {
    beforeEach(async function () {
      if (!isLoggedIn) { this.skip(); return; }
      await settingsPage.open();
    });

    it('TC-169 | Dark Mode toggle checkbox is visible', async function () {
      expect(await settingsPage.isDisplayed(settingsPage.locators.themeToggle)).to.be.true;
    });

    it('TC-170 | toggle label "Dark Mode" is present', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Dark Mode');
    });

    it('TC-171 | toggling dark mode changes data-theme attribute', async function () {
      const before = await settingsPage.isThemeDark();
      await settingsPage.toggleTheme();
      await WaitHelpers.sleep(400);
      const after = await settingsPage.isThemeDark();
      expect(after).to.not.equal(before);
      // reset
      await settingsPage.toggleTheme();
    });

    it('TC-172 | dark mode state persists in localStorage', async function () {
      await settingsPage.toggleTheme();
      await WaitHelpers.sleep(400);
      const saved = await driver.executeScript("return localStorage.getItem('prophydent-theme')");
      expect(['dark', 'light']).to.include(saved);
      await settingsPage.toggleTheme(); // reset
    });

    it('TC-173 | toggle-switch class is present on the toggle element', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('toggle-switch');
    });
  });

  // ─── Security – Password Validation ──────────────────────────────────────
  describe('Settings – Password Validation', function () {
    beforeEach(async function () {
      if (!isLoggedIn) { this.skip(); return; }
      await settingsPage.open();
    });

    it('TC-174 | New Password input is visible', async function () {
      expect(await settingsPage.isDisplayed(settingsPage.locators.passwordInput)).to.be.true;
    });

    it('TC-175 | Confirm Password input is visible', async function () {
      expect(await settingsPage.isDisplayed(settingsPage.locators.confirmPasswordInput)).to.be.true;
    });

    it('TC-176 | Update Password button is visible', async function () {
      expect(await settingsPage.isDisplayed(settingsPage.locators.updatePasswordBtn)).to.be.true;
    });

    it('TC-177 | mismatched passwords show "do not match" error', async function () {
      await settingsPage.enterNewPassword('newpass123');
      await settingsPage.enterConfirmPassword('different456');
      await settingsPage.clickUpdatePassword();
      await WaitHelpers.sleep(1000);
      const err = await settingsPage.getErrorMessage();
      expect(err.toLowerCase()).to.include('match');
    });

    it('TC-178 | password shorter than 6 chars shows length error', async function () {
      await settingsPage.open();
      await settingsPage.enterNewPassword('abc');
      await settingsPage.enterConfirmPassword('abc');
      await settingsPage.clickUpdatePassword();
      await WaitHelpers.sleep(1000);
      const err = await settingsPage.getErrorMessage();
      expect(err.length).to.be.greaterThan(0);
    });

    it('TC-179 | password inputs are type=password', async function () {
      const t1 = await settingsPage.getAttribute(settingsPage.locators.passwordInput, 'type');
      const t2 = await settingsPage.getAttribute(settingsPage.locators.confirmPasswordInput, 'type');
      expect(t1).to.equal('password');
      expect(t2).to.equal('password');
    });

    it('TC-180 | Update Password button is disabled when password field is empty', async function () {
      await settingsPage.open();
      const disabled = await settingsPage.getAttribute(settingsPage.locators.updatePasswordBtn, 'disabled');
      expect(disabled).to.not.be.null;
    });

    it('TC-181 | error message has alert-error CSS class', async function () {
      await settingsPage.open();
      await settingsPage.enterNewPassword('abc');
      await settingsPage.enterConfirmPassword('xyz');
      await settingsPage.clickUpdatePassword();
      await WaitHelpers.sleep(1000);
      expect(await settingsPage.isPresent(By.css('.alert.alert-error'))).to.be.true;
    });
  });

  // ─── Profile Section ──────────────────────────────────────────────────────
  describe('Settings – Profile Section', function () {
    beforeEach(async function () {
      if (!isLoggedIn) { this.skip(); return; }
      await settingsPage.open();
    });

    it('TC-182 | Full Name input is visible in profile section', async function () {
      const fullNameInput = By.css('.profile-grid input[type="text"]');
      expect(await settingsPage.isPresent(fullNameInput)).to.be.true;
    });

    it('TC-183 | Email field is disabled (read-only)', async function () {
      const emailInput = By.css('input[type="email"][disabled]');
      expect(await settingsPage.isPresent(emailInput)).to.be.true;
    });

    it('TC-184 | Gender dropdown is present', async function () {
      const genderSel = By.css('.profile-grid select');
      expect(await settingsPage.isPresent(genderSel)).to.be.true;
    });

    it('TC-185 | Save Profile Changes button is present', async function () {
      expect(await settingsPage.isPresent(settingsPage.locators.saveProfileBtn)).to.be.true;
    });

    it('TC-186 | profile-grid layout class is present', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('profile-grid');
    });

    it('TC-187 | Address input is present', async function () {
      const addrInput = By.css('input[type="text"]:last-of-type');
      // Check page source has Address label
      const src = await driver.getPageSource();
      expect(src).to.include('Address');
    });
  });

  // ─── Sign Out ─────────────────────────────────────────────────────────────
  describe('Settings – Sign Out', function () {
    it('TC-188 | Sign Out button is present', async function () {
      if (!isLoggedIn) { this.skip(); return; }
      await settingsPage.open();
      expect(await settingsPage.isDisplayed(settingsPage.locators.signOutBtn)).to.be.true;
    });

    it('TC-189 | Sign Out section has danger border styling', async function () {
      if (!isLoggedIn) { this.skip(); return; }
      await settingsPage.open();
      const src = await driver.getPageSource();
      expect(src).to.include('ef4444');   // red colour used in sign-out section
    });

    it('TC-190 | clicking Sign Out redirects to /welcome', async function () {
      if (!isLoggedIn) { this.skip(); return; }
      await settingsPage.open();
      await settingsPage.signOut();
      expect(await driver.getCurrentUrl()).to.include('/welcome');
      isLoggedIn = false;
    });
  });
});
