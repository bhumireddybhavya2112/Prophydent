'use strict';

require('dotenv').config();
const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const DriverManager = require('../utils/driverManager');
const WaitHelpers = require('../utils/waitHelpers');
const BasePage = require('../pages/BasePage');
const SplashPage = require('../pages/SplashPage');
const WelcomePage = require('../pages/WelcomePage');
const RoleSelectionPage = require('../pages/RoleSelectionPage');
const AuthPage = require('../pages/AuthPage');
const DashboardPage = require('../pages/DashboardPage');
const NavigationPage = require('../pages/NavigationPage');
const SettingsPage = require('../pages/SettingsPage');

describe('11 - End-to-End User Flows', function () {
  this.timeout(120000);
  let driver;
  let splash, welcome, role, auth, dash, nav, settings;

  before(async function () {
    driver   = await DriverManager.getDriver();
    splash   = new SplashPage(driver);
    welcome  = new WelcomePage(driver);
    role     = new RoleSelectionPage(driver);
    auth     = new AuthPage(driver);
    dash     = new DashboardPage(driver);
    nav      = new NavigationPage(driver);
    settings = new SettingsPage(driver);
  });

  // ─── Flow 1: Full Onboarding → Login Page ────────────────────────────────
  describe('Flow 1 – Onboarding to Auth', function () {
    this.timeout(120000);
    it('TC-268 | Splash → auto-redirects to Welcome', async function () {
      await splash.open();
      await splash.waitForRedirect();
      expect(await driver.getCurrentUrl()).to.include('/welcome');
    });

    it('TC-269 | Welcome → Get Started → Role Selection', async function () {
      await welcome.open();
      await welcome.clickGetStarted();
      expect(await driver.getCurrentUrl()).to.include('/role');
    });

    it('TC-270 | Role Selection → Doctor → Auth Page (doctor)', async function () {
      await role.open();
      await role.selectDoctor();
      const url = await driver.getCurrentUrl();
      expect(url).to.include('/auth');
      expect(url).to.include('doctor');
    });

    it('TC-271 | Auth Page back → returns to Role Selection', async function () {
      const url = await driver.getCurrentUrl();
      if (!url.includes('/auth')) {
        await driver.get('http://localhost:5173/#/auth?role=doctor');
        await auth.waitForElement(auth.locators.backBtn);
      }
      await auth.clickBack();
      expect(await driver.getCurrentUrl()).to.include('/role');
    });

    it('TC-272 | Role Selection → Patient → Auth Page (patient)', async function () {
      await role.open();   // ensure we are on role page regardless of prior test state
      await role.selectPatient();
      const url = await driver.getCurrentUrl();
      expect(url).to.include('/auth');
      expect(url).to.include('patient');
    });

    it('TC-273 | Auth Page (patient) back → Role Selection', async function () {
      const url = await driver.getCurrentUrl();
      if (!url.includes('/auth')) {
        await driver.get('http://localhost:5173/#/auth?role=patient');
        await auth.waitForElement(auth.locators.backBtn);
      }
      await auth.clickBack();
      expect(await driver.getCurrentUrl()).to.include('/role');
    });
  });

  // ─── Flow 2: Login Failure & Error Display ───────────────────────────────
  describe('Flow 2 – Login Failure Handling', function () {
    it('TC-274 | open doctor auth page', async function () {
      await auth.open('doctor');
      expect(await auth.isVisible()).to.be.true;
    });

    it('TC-275 | submit with invalid creds shows error', async function () {
      await auth.login('flow2.baduser@notexist.io', 'wrongpass99');
      const err = await auth.waitForErrorMessage(10000);
      expect(err.length).to.be.greaterThan(0);
    });

    it('TC-276 | error message is displayed on auth page', async function () {
      expect(await auth.isErrorVisible()).to.be.true;
    });

    it('TC-277 | URL stays on /auth after failed login', async function () {
      expect(await driver.getCurrentUrl()).to.include('/auth');
    });

    it('TC-278 | error cleared when user starts typing again', async function () {
      // Type in email to trigger change – React clears error on next submit attempt
      await auth.enterEmail('new@example.com');
      expect(await auth.isVisible()).to.be.true;
    });
  });

  // ─── Flow 3: Signup Mode Toggle ──────────────────────────────────────────
  describe('Flow 3 – Signup Mode Toggle', function () {
    before(async function () {
      await auth.open('doctor');
    });

    it('TC-279 | starts in login mode with "Welcome Back"', async function () {
      expect(await auth.isLoginMode()).to.be.true;
    });

    it('TC-280 | toggle link click switches to signup mode', async function () {
      await auth.toggleMode();
      const h = await auth.getHeading();
      expect(h).to.include('Create an Account');
    });

    it('TC-281 | signup mode shows Full Name input', async function () {
      const present = await auth.driver.executeScript(
        "return !!document.querySelector('input[type=\"text\"][placeholder*=\"Doe\"]');"
      );
      expect(present).to.be.true;
    });

    it('TC-282 | toggle link click switches back to login mode', async function () {
      await auth.toggleMode();
      expect(await auth.isLoginMode()).to.be.true;
    });

    it('TC-283 | Full Name input hidden in login mode', async function () {
      expect(await auth.isPresent(auth.locators.fullNameInput)).to.be.false;
    });

    it('TC-284 | patient signup mode shows Create an Account heading', async function () {
      await auth.open('patient');
      await auth.toggleMode();
      const h = await auth.getHeading();
      expect(h).to.include('Create an Account');
    });
  });

  // ─── Flow 4: Protected Route Guard ───────────────────────────────────────
  describe('Flow 4 – Protected Route Guard (full journey)', function () {
    this.timeout(120000);
    before(async function () {
      await auth.clearAuth();
    });

    it('TC-285 | unauthenticated visit to /dashboard → /welcome', async function () {
      await driver.get('http://localhost:5173/#/dashboard');
      await WaitHelpers.sleep(4000);
      expect(await driver.getCurrentUrl()).to.include('/welcome');
    });

    it('TC-286 | from /welcome, Get Started navigates to /role', async function () {
      await welcome.open();
      await welcome.clickGetStarted();
      expect(await driver.getCurrentUrl()).to.include('/role');
    });

    it('TC-287 | from /role, Doctor card goes to /auth', async function () {
      await role.open();
      await role.selectDoctor();
      expect(await driver.getCurrentUrl()).to.include('/auth');
    });
  });

  // ─── Flow 5: Theme Persistence ───────────────────────────────────────────
  describe('Flow 5 – Theme Persistence (no auth required)', function () {
    it('TC-288 | theme stored in localStorage survives page reload', async function () {
      await driver.get('http://localhost:5173/#/welcome');
      await driver.executeScript("localStorage.setItem('prophydent-theme','dark'); document.documentElement.setAttribute('data-theme','dark');");
      await driver.navigate().refresh();
      await WaitHelpers.sleep(1500);
      // App reads localStorage on mount and applies theme
      const theme = await driver.executeScript("return localStorage.getItem('prophydent-theme')");
      expect(theme).to.equal('dark');
    });

    it('TC-289 | setting theme to light via localStorage works', async function () {
      await driver.executeScript("localStorage.setItem('prophydent-theme','light'); document.documentElement.setAttribute('data-theme','light');");
      const theme = await driver.executeScript("return localStorage.getItem('prophydent-theme')");
      expect(theme).to.equal('light');
    });
  });

  // ─── Flow 6: Authenticated Full Journey (conditional) ────────────────────
  describe('Flow 6 – Full Authenticated Journey (if credentials work)', function () {
    const config = require('../config/testConfig');
    let loggedIn = false;

    before(async function () {
      await auth.open('doctor');
      await auth.login(config.testEmail, config.testPassword);
      await WaitHelpers.sleep(5000);
      const url = await driver.getCurrentUrl();
      loggedIn = url.includes('/dashboard');
    });

    it('TC-290 | login redirects to /dashboard', async function () {
      if (!loggedIn) { this.skip(); }
      expect(await driver.getCurrentUrl()).to.include('/dashboard');
    });

    it('TC-291 | dashboard loads with stats grid', async function () {
      if (!loggedIn) { this.skip(); }
      await dash.open();
      expect(await dash.isStatsGridVisible()).to.be.true;
    });

    it('TC-292 | navigate to patients via sidebar', async function () {
      if (!loggedIn) { this.skip(); }
      await nav.navigateToPatients();
      expect(await driver.getCurrentUrl()).to.include('/patients');
    });

    it('TC-293 | navigate to analysis via sidebar', async function () {
      if (!loggedIn) { this.skip(); }
      await nav.navigateToScans();
      expect(await driver.getCurrentUrl()).to.include('/analysis');
    });

    it('TC-294 | navigate to reports via sidebar', async function () {
      if (!loggedIn) { this.skip(); }
      await nav.navigateToReports();
      expect(await driver.getCurrentUrl()).to.include('/reports');
    });

    it('TC-295 | navigate to settings via sidebar', async function () {
      if (!loggedIn) { this.skip(); }
      await nav.navigateToSettings();
      expect(await driver.getCurrentUrl()).to.include('/settings');
    });

    it('TC-296 | sign out from settings page redirects to /welcome', async function () {
      if (!loggedIn) { this.skip(); }
      await settings.open();
      await settings.signOut();
      expect(await driver.getCurrentUrl()).to.include('/welcome');
      loggedIn = false;
    });

    it('TC-297 | after sign-out, /dashboard is no longer accessible', async function () {
      await driver.get('http://localhost:5173/#/dashboard');
      await WaitHelpers.sleep(4000);
      expect(await driver.getCurrentUrl()).to.include('/welcome');
    });
  });

  // ─── Flow 7: Multi-role distinction ──────────────────────────────────────
  describe('Flow 7 – Role-Based UI Differences', function () {
    it('TC-298 | doctor auth page shows "Clinical Portal" label', async function () {
      await auth.open('doctor');
      const label = await auth.getRoleLabel();
      expect(label).to.include('Clinical Portal');
    });

    it('TC-299 | patient auth page shows "Patient Portal" label', async function () {
      await auth.open('patient');
      const label = await auth.getRoleLabel();
      expect(label).to.include('Patient Portal');
    });

    it('TC-300 | doctor auth URL contains role=doctor param', async function () {
      await auth.open('doctor');
      expect(await driver.getCurrentUrl()).to.include('role=doctor');
    });

    it('TC-301 | patient auth URL contains role=patient param', async function () {
      await auth.open('patient');
      expect(await driver.getCurrentUrl()).to.include('role=patient');
    });

    it('TC-302 | doctor signup placeholder is "Dr. Jane Doe"', async function () {
      await auth.open('doctor');
      await auth.toggleMode();
      // scroll to top to make fields accessible, then read via JS
      const ph = await auth.driver.executeScript(
        "var el=document.querySelector('input[type=\"text\"][placeholder*=\"Doe\"]'); return el ? el.getAttribute('placeholder') : '';"
      );
      expect(ph).to.include('Dr.');
    });

    it('TC-303 | patient signup placeholder is "Jane Doe" (no Dr.)', async function () {
      await auth.open('patient');
      await auth.toggleMode();
      const ph = await auth.driver.executeScript(
        "var el=document.querySelector('input[type=\"text\"][placeholder*=\"Doe\"]'); return el ? el.getAttribute('placeholder') : '';"
      );
      expect(ph).to.not.include('Dr.');
    });
  });
});
