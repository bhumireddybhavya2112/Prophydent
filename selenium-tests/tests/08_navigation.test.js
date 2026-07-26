'use strict';

require('dotenv').config();
const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const DriverManager = require('../utils/driverManager');
const AuthPage = require('../pages/AuthPage');
const NavigationPage = require('../pages/NavigationPage');
const WaitHelpers = require('../utils/waitHelpers');
const logger = require('../utils/logger');
const config = require('../config/testConfig');

describe('08 - Navigation', function () {
  this.timeout(90000);
  let driver, authPage, navPage;
  let isLoggedIn = false;

  before(async function () {
    driver   = await DriverManager.getDriver();
    authPage = new AuthPage(driver);
    navPage  = new NavigationPage(driver);

    await authPage.open('doctor');
    await authPage.login(config.testEmail, config.testPassword);
    await WaitHelpers.sleep(5000);
    const url = await driver.getCurrentUrl();
    isLoggedIn = url.includes('/dashboard');
    logger.info(`Navigation suite auth: ${isLoggedIn}`);
  });

  // ─── Sidebar Structure ────────────────────────────────────────────────────
  describe('Sidebar – Structure', function () {
    beforeEach(async function () {
      if (!isLoggedIn) { this.skip(); return; }
      await navPage.navigate('/#/dashboard');
      await WaitHelpers.sleep(1500);
    });

    it('TC-191 | sidebar element is visible', async function () {
      expect(await navPage.isSidebarVisible()).to.be.true;
    });

    it('TC-192 | sidebar logo text is "ProphyDent"', async function () {
      const txt = await navPage.getLogoText();
      expect(txt).to.include('ProphyDent');
    });

    it('TC-193 | sidebar has AI badge', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('ai-badge');
    });

    it('TC-194 | at least 4 nav-item buttons are rendered', async function () {
      const items = await navPage.getNavItems();
      expect(items.length).to.be.at.least(4);
    });

    it('TC-195 | Dashboard nav item is present', async function () {
      expect(await navPage.isPresent(navPage.locators.dashboardNav)).to.be.true;
    });

    it('TC-196 | Patients nav item is present (doctor role)', async function () {
      expect(await navPage.isPresent(navPage.locators.patientsNav)).to.be.true;
    });

    it('TC-197 | Scans nav item is present', async function () {
      expect(await navPage.isPresent(navPage.locators.scansNav)).to.be.true;
    });

    it('TC-198 | Reports nav item is present', async function () {
      expect(await navPage.isPresent(navPage.locators.reportsNav)).to.be.true;
    });

    it('TC-199 | Settings nav item is present', async function () {
      expect(await navPage.isPresent(navPage.locators.settingsNav)).to.be.true;
    });

    it('TC-200 | user-profile section is visible in sidebar footer', async function () {
      expect(await navPage.isDisplayed(navPage.locators.userProfile)).to.be.true;
    });

    it('TC-201 | sign-out button is present in sidebar', async function () {
      expect(await navPage.isPresent(navPage.locators.signOutBtn)).to.be.true;
    });
  });

  // ─── Navigation Actions ───────────────────────────────────────────────────
  describe('Sidebar – Navigation Actions', function () {
    beforeEach(async function () {
      if (!isLoggedIn) { this.skip(); return; }
      await navPage.navigate('/#/dashboard');
      await WaitHelpers.sleep(1500);
    });

    it('TC-202 | clicking Dashboard nav navigates to /dashboard', async function () {
      await navPage.navigateToDashboard();
      expect(await driver.getCurrentUrl()).to.include('/dashboard');
    });

    it('TC-203 | clicking Patients nav navigates to /patients', async function () {
      await navPage.navigateToPatients();
      expect(await driver.getCurrentUrl()).to.include('/patients');
    });

    it('TC-204 | clicking Scans nav navigates to /analysis', async function () {
      await navPage.navigateToScans();
      expect(await driver.getCurrentUrl()).to.include('/analysis');
    });

    it('TC-205 | clicking Reports nav navigates to /reports', async function () {
      await navPage.navigateToReports();
      expect(await driver.getCurrentUrl()).to.include('/reports');
    });

    it('TC-206 | clicking Settings nav navigates to /settings', async function () {
      await navPage.navigateToSettings();
      expect(await driver.getCurrentUrl()).to.include('/settings');
    });

    it('TC-207 | Dashboard nav item becomes active on dashboard page', async function () {
      await navPage.navigateToDashboard();
      await WaitHelpers.sleep(500);
      const active = await navPage.getActiveNavItem();
      expect(active.toLowerCase()).to.include('dashboard');
    });

    it('TC-208 | sidebar persists across page navigations', async function () {
      await navPage.navigateToPatients();
      expect(await navPage.isSidebarVisible()).to.be.true;
    });

    it('TC-209 | sidebar logo is present on patients page', async function () {
      await navPage.navigateToPatients();
      const txt = await navPage.getLogoText();
      expect(txt).to.include('ProphyDent');
    });

    it('TC-210 | sidebar persists on analysis page', async function () {
      await navPage.navigateToScans();
      expect(await navPage.isSidebarVisible()).to.be.true;
    });

    it('TC-211 | sidebar persists on reports page', async function () {
      await navPage.navigateToReports();
      expect(await navPage.isSidebarVisible()).to.be.true;
    });

    it('TC-212 | sidebar persists on settings page', async function () {
      await navPage.navigateToSettings();
      expect(await navPage.isSidebarVisible()).to.be.true;
    });
  });

  // ─── Unauthenticated Redirect ─────────────────────────────────────────────
  describe('Navigation – Unauthenticated Redirect', function () {
    const routes = ['/#/dashboard', '/#/patients', '/#/analysis', '/#/reports', '/#/settings'];

    before(async function () {
      // Sign out to test redirects
      if (isLoggedIn) {
        await navPage.navigate('/#/dashboard');
        await WaitHelpers.sleep(800);
        try { await navPage.signOutFromSidebar(); } catch (e) { await navPage.clearAuth(); }
        await WaitHelpers.sleep(1000);
        isLoggedIn = false;
      } else {
        await navPage.clearAuth();
      }
    });

    routes.forEach((route, i) => {
      it(`TC-${213 + i} | ${route} redirects to /welcome when not authenticated`, async function () {
        await navPage.navigate(route);
        await WaitHelpers.sleep(4000);
        expect(await driver.getCurrentUrl()).to.include('/welcome');
      });
    });
  });
});
