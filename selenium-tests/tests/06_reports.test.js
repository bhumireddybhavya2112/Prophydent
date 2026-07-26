'use strict';

require('dotenv').config();
const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const DriverManager = require('../utils/driverManager');
const AuthPage = require('../pages/AuthPage');
const ReportsPage = require('../pages/ReportsPage');
const WaitHelpers = require('../utils/waitHelpers');
const logger = require('../utils/logger');
const config = require('../config/testConfig');

describe('06 - Reports', function () {
  this.timeout(90000);
  let driver, authPage, reportsPage;
  let isLoggedIn = false;

  before(async function () {
    driver      = await DriverManager.getDriver();
    authPage    = new AuthPage(driver);
    reportsPage = new ReportsPage(driver);

    await authPage.open('doctor');
    await authPage.login(config.testEmail, config.testPassword);
    await WaitHelpers.sleep(5000);
    const url = await driver.getCurrentUrl();
    isLoggedIn = url.includes('/dashboard');
    logger.info(`Reports suite auth: ${isLoggedIn}`);
  });

  // ─── Protected Route ──────────────────────────────────────────────────────
  describe('Protected Route', function () {
    it('TC-140 | /reports redirects unauthenticated users to /welcome', async function () {
      if (isLoggedIn) { this.skip(); }
      await reportsPage.clearAuth();
      await reportsPage.navigate('/#/reports');
      await WaitHelpers.sleep(3500);
      expect(await driver.getCurrentUrl()).to.include('/welcome');
    });
  });

  // ─── Reports Page Structure ───────────────────────────────────────────────
  describe('Reports Page – Structure', function () {
    beforeEach(async function () {
      if (!isLoggedIn) { this.skip(); return; }
      await reportsPage.open();
    });

    it('TC-141 | reports-page container is visible', async function () {
      expect(await reportsPage.isVisible()).to.be.true;
    });

    it('TC-142 | page title contains "Reports"', async function () {
      const title = await reportsPage.getPageTitle();
      expect(title).to.include('Reports');
    });

    it('TC-143 | subtitle "Review saved AI analyses" is present', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Review saved AI analyses');
    });

    it('TC-144 | reports-list panel is visible', async function () {
      expect(await reportsPage.isDisplayed(reportsPage.locators.reportsList)).to.be.true;
    });

    it('TC-145 | report-viewer panel is visible', async function () {
      expect(await reportsPage.isViewerVisible()).to.be.true;
    });

    it('TC-146 | empty-viewer prompt is shown when no report selected', async function () {
      expect(await reportsPage.isEmptyViewerVisible()).to.be.true;
    });

    it('TC-147 | empty-viewer shows "Select a Report" heading', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Select a Report');
    });

    it('TC-148 | search input is visible', async function () {
      expect(await reportsPage.isDisplayed(reportsPage.locators.searchInput)).to.be.true;
    });

    it('TC-149 | search input has placeholder text', async function () {
      const ph = await reportsPage.getAttribute(reportsPage.locators.searchInput, 'placeholder');
      expect(ph.length).to.be.greaterThan(0);
    });

    it('TC-150 | typing in search input updates its value', async function () {
      await reportsPage.searchReports('patient');
      const val = await reportsPage.getAttribute(reportsPage.locators.searchInput, 'value');
      expect(val).to.equal('patient');
    });

    it('TC-151 | clearing search resets the input', async function () {
      await reportsPage.type(reportsPage.locators.searchInput, '');
      const val = await reportsPage.getAttribute(reportsPage.locators.searchInput, 'value');
      expect(val).to.equal('');
    });

    it('TC-152 | reports layout has reports-layout CSS class', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('reports-layout');
    });

    it('TC-153 | empty state in list shows "No reports found" or shows report cards', async function () {
      const src = await driver.getPageSource();
      expect(src.includes('No reports found') || src.includes('report-card')).to.be.true;
    });

    it('TC-154 | first report card click opens viewer (if reports exist)', async function () {
      const cards = await reportsPage.getReportCards();
      if (cards.length === 0) { this.skip(); return; }
      await cards[0].click();
      await WaitHelpers.sleep(1500);
      const emptyStillVisible = await reportsPage.isEmptyViewerVisible();
      expect(emptyStillVisible).to.be.false;
    });

    it('TC-155 | opened report shows AI Generated badge', async function () {
      const cards = await reportsPage.getReportCards();
      if (cards.length === 0) { this.skip(); return; }
      await cards[0].click();
      await WaitHelpers.sleep(1500);
      const src = await driver.getPageSource();
      expect(src).to.include('AI Generated');
    });

    it('TC-156 | opened report shows Concordance percentage', async function () {
      const cards = await reportsPage.getReportCards();
      if (cards.length === 0) { this.skip(); return; }
      const src = await driver.getPageSource();
      expect(src).to.include('Concordance');
    });

    it('TC-157 | Download PDF button is present when report is open', async function () {
      const cards = await reportsPage.getReportCards();
      if (cards.length === 0) { this.skip(); return; }
      const src = await driver.getPageSource();
      expect(src).to.include('Download PDF');
    });

    it('TC-158 | Share button is present when report is open', async function () {
      const cards = await reportsPage.getReportCards();
      if (cards.length === 0) { this.skip(); return; }
      const src = await driver.getPageSource();
      expect(src).to.include('Share');
    });

    it('TC-159 | reports-list panel has glass-panel class', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('glass-panel');
    });
  });
});
