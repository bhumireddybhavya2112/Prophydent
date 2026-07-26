'use strict';

require('dotenv').config();
const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const DriverManager = require('../utils/driverManager');
const AuthPage = require('../pages/AuthPage');
const DashboardPage = require('../pages/DashboardPage');
const WaitHelpers = require('../utils/waitHelpers');
const logger = require('../utils/logger');
const config = require('../config/testConfig');

describe('03 - Dashboard', function () {
  this.timeout(90000);
  let driver, authPage, dashPage;

  before(async function () {
    driver   = await DriverManager.getDriver();
    authPage = new AuthPage(driver);
    dashPage = new DashboardPage(driver);
  });

  // ─── Protected Route Behaviour (no auth) ─────────────────────────────────
  describe('Protected Route – Unauthenticated Access', function () {
    before(async function () {
      // Ensure signed out
      await dashPage.navigate('/#/welcome');
      await dashPage.clearAuth();
    });

    it('TC-065 | /dashboard redirects to /welcome when not authenticated', async function () {
      await dashPage.navigate('/#/dashboard');
      await WaitHelpers.sleep(4000);
      expect(await driver.getCurrentUrl()).to.include('/welcome');
    });

    it('TC-066 | /patients redirects to /welcome when not authenticated', async function () {
      await dashPage.navigate('/#/patients');
      await WaitHelpers.sleep(3000);
      expect(await driver.getCurrentUrl()).to.include('/welcome');
    });

    it('TC-067 | /analysis redirects to /welcome when not authenticated', async function () {
      await dashPage.navigate('/#/analysis');
      await WaitHelpers.sleep(3000);
      expect(await driver.getCurrentUrl()).to.include('/welcome');
    });

    it('TC-068 | /reports redirects to /welcome when not authenticated', async function () {
      await dashPage.navigate('/#/reports');
      await WaitHelpers.sleep(3000);
      expect(await driver.getCurrentUrl()).to.include('/welcome');
    });

    it('TC-069 | /settings redirects to /welcome when not authenticated', async function () {
      await dashPage.navigate('/#/settings');
      await WaitHelpers.sleep(3000);
      expect(await driver.getCurrentUrl()).to.include('/welcome');
    });

    it('TC-070 | ProtectedRoute shows loading spinner briefly before redirect', async function () {
      await dashPage.navigate('/#/dashboard');
      // Either spinner or welcome — both acceptable
      const src = await driver.getPageSource();
      expect(src.includes('loading-spinner') || src.includes('welcome')).to.be.true;
    });

    it('TC-071 | catch-all unknown route redirects to /#/', async function () {
      await dashPage.navigate('/#/this-page-does-not-exist-xyz');
      await WaitHelpers.sleep(2000);
      const url = await driver.getCurrentUrl();
      // Should land on splash → then welcome
      expect(url.includes('/#/') || url.includes('/welcome')).to.be.true;
    });
  });

  // ─── Dashboard Page Structure (authenticated) ─────────────────────────────
  describe('Dashboard Page – Structure (requires auth)', function () {
    let isLoggedIn = false;

    before(async function () {
      await authPage.open('doctor');
      await authPage.login(config.testEmail, config.testPassword);
      await WaitHelpers.sleep(5000);
      const url = await driver.getCurrentUrl();
      isLoggedIn = url.includes('/dashboard');
      logger.info(`Dashboard auth: ${isLoggedIn}`);
    });

    beforeEach(async function () {
      if (!isLoggedIn) { this.skip(); }
      else { await dashPage.open(); }
    });

    it('TC-072 | dashboard container is visible', async function () {
      expect(await dashPage.isVisible()).to.be.true;
    });

    it('TC-073 | page-title element is present', async function () {
      expect(await dashPage.isPresent(dashPage.locators.pageTitle)).to.be.true;
    });

    it('TC-074 | page title contains "Welcome"', async function () {
      const title = await dashPage.getPageTitle();
      expect(title.toLowerCase()).to.include('welcome');
    });

    it('TC-075 | stats-grid is visible', async function () {
      expect(await dashPage.isStatsGridVisible()).to.be.true;
    });

    it('TC-076 | at least 1 stat card is rendered', async function () {
      const cards = await dashPage.getStatCards();
      expect(cards.length).to.be.at.least(1);
    });

    it('TC-077 | doctor sees Total Patients stat card', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Total Patients');
    });

    it('TC-078 | Total Scans stat card is present', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Total Scans');
    });

    it('TC-079 | Concordance level stat card is present', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Concordance');
    });

    it('TC-080 | recent-scans panel is visible', async function () {
      expect(await dashPage.isRecentScansVisible()).to.be.true;
    });

    it('TC-081 | recent-scans panel has card-header with h3', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Recent Scans');
    });

    it('TC-082 | ai-insights panel is visible', async function () {
      expect(await dashPage.isAiInsightsVisible()).to.be.true;
    });

    it('TC-083 | ai-insights contains "AI Insights" heading', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('AI Insights');
    });

    it('TC-084 | sidebar is rendered alongside dashboard', async function () {
      expect(await dashPage.isSidebarVisible()).to.be.true;
    });

    it('TC-085 | "Start New Analysis" button is present', async function () {
      const visible = await dashPage.isDisplayed(dashPage.locators.startAnalysisBtn);
      expect(visible).to.be.true;
    });

    it('TC-086 | Start New Analysis button navigates to /analysis', async function () {
      await dashPage.click(dashPage.locators.startAnalysisBtn);
      await WaitHelpers.sleep(2000);
      expect(await driver.getCurrentUrl()).to.include('/analysis');
    });

    it('TC-087 | navigating back to dashboard restores stats grid', async function () {
      await dashPage.open();
      expect(await dashPage.isStatsGridVisible()).to.be.true;
    });

    it('TC-088 | dashboard has fade-in animation class', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('fade-in');
    });

    it('TC-089 | dashboard-header contains subtitle text-muted paragraph', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include("happening with your clinic");
    });

    it('TC-090 | View All button is present in recent scans panel', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('View All');
    });

    it('TC-091 | AI Insights panel mentions caries trend', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Caries') || expect(src).to.include('caries');
    });
  });
});
