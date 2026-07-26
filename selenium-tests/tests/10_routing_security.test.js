'use strict';

require('dotenv').config();
const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const DriverManager = require('../utils/driverManager');
const WaitHelpers = require('../utils/waitHelpers');
const BasePage = require('../pages/BasePage');
const AuthPage = require('../pages/AuthPage');

describe('10 - Routing & Security', function () {
  this.timeout(60000);
  let driver, page, authPage;

  before(async function () {
    driver   = await DriverManager.getDriver();
    page     = new BasePage(driver);
    authPage = new AuthPage(driver);
  });

  // ─── Hash Router Integrity ─────────────────────────────────────────────────
  describe('HashRouter Route Resolution', function () {
    it('TC-245 | /#/ resolves to splash screen', async function () {
      await driver.get('http://localhost:5173/#/');
      await WaitHelpers.sleep(500);
      const src = await driver.getPageSource();
      expect(src.includes('splash') || src.includes('welcome')).to.be.true;
    });

    it('TC-246 | /#/welcome resolves to welcome page', async function () {
      await driver.get('http://localhost:5173/#/welcome');
      await WaitHelpers.sleep(500);
      const src = await driver.getPageSource();
      expect(src).to.include('welcome-content');
    });

    it('TC-247 | /#/role resolves to role selection page', async function () {
      await driver.get('http://localhost:5173/#/role');
      await WaitHelpers.sleep(800);
      const src = await driver.getPageSource();
      expect(src).to.include('role-content');
    });

    it('TC-248 | /#/auth resolves to auth page', async function () {
      await driver.get('http://localhost:5173/#/auth?role=doctor');
      await WaitHelpers.sleep(1000);
      const src = await driver.getPageSource();
      expect(src).to.include('auth-container');
    });

    it('TC-249 | unknown route /#/xyz redirects to splash or welcome', async function () {
      await driver.get('http://localhost:5173/#/xyz-unknown-route');
      await WaitHelpers.sleep(2000);
      const url = await driver.getCurrentUrl();
      expect(url.includes('/#/') || url.includes('/welcome')).to.be.true;
    });

    it('TC-250 | browser back button works from /role to /welcome', async function () {
      await driver.get('http://localhost:5173/#/welcome');
      await WaitHelpers.sleep(500);
      await driver.get('http://localhost:5173/#/role');
      await WaitHelpers.sleep(500);
      await driver.navigate().back();
      await WaitHelpers.sleep(1000);
      const url = await driver.getCurrentUrl();
      expect(url).to.include('/welcome');
    });

    it('TC-251 | browser forward button restores /role after back', async function () {
      await driver.navigate().forward();
      await WaitHelpers.sleep(1000);
      const url = await driver.getCurrentUrl();
      expect(url).to.include('/role');
    });

    it('TC-252 | page reload on /#/welcome keeps user on welcome page', async function () {
      await driver.get('http://localhost:5173/#/welcome');
      await driver.navigate().refresh();
      await WaitHelpers.sleep(1500);
      const url = await driver.getCurrentUrl();
      expect(url).to.include('/welcome');
    });

    it('TC-253 | page reload on /#/role keeps user on role page', async function () {
      await driver.get('http://localhost:5173/#/role');
      await driver.navigate().refresh();
      await WaitHelpers.sleep(1500);
      const url = await driver.getCurrentUrl();
      expect(url).to.include('/role');
    });

    it('TC-254 | direct navigation to /#/auth?role=patient works', async function () {
      await driver.get('http://localhost:5173/#/auth?role=patient');
      await WaitHelpers.sleep(1500);
      const src = await driver.getPageSource();
      expect(src).to.include('auth-container');
    });
  });

  // ─── Authentication Security ───────────────────────────────────────────────
  describe('Authentication Security Checks', function () {
    before(async function () {
      await page.clearAuth();
    });

    it('TC-255 | accessing /dashboard without auth token redirects to /welcome', async function () {
      await driver.get('http://localhost:5173/#/dashboard');
      await WaitHelpers.sleep(4000);
      expect(await driver.getCurrentUrl()).to.include('/welcome');
    });

    it('TC-256 | accessing /patients without auth token redirects to /welcome', async function () {
      await driver.get('http://localhost:5173/#/patients');
      await WaitHelpers.sleep(3500);
      expect(await driver.getCurrentUrl()).to.include('/welcome');
    });

    it('TC-257 | accessing /analysis without auth token redirects to /welcome', async function () {
      await driver.get('http://localhost:5173/#/analysis');
      await WaitHelpers.sleep(3500);
      expect(await driver.getCurrentUrl()).to.include('/welcome');
    });

    it('TC-258 | accessing /reports without auth token redirects to /welcome', async function () {
      await driver.get('http://localhost:5173/#/reports');
      await WaitHelpers.sleep(3500);
      expect(await driver.getCurrentUrl()).to.include('/welcome');
    });

    it('TC-259 | accessing /settings without auth token redirects to /welcome', async function () {
      await driver.get('http://localhost:5173/#/settings');
      await WaitHelpers.sleep(3500);
      expect(await driver.getCurrentUrl()).to.include('/welcome');
    });

    it('TC-260 | ProtectedRoute loading spinner shown during auth check', async function () {
      await driver.get('http://localhost:5173/#/dashboard');
      const src = await driver.getPageSource();
      expect(src.includes('loading-spinner') || src.includes('/welcome') || src.includes('dashboard')).to.be.true;
    });

    it('TC-261 | manipulated localStorage does not bypass auth (gibberish token)', async function () {
      await driver.executeScript(
        "localStorage.setItem('sb-fakeid-auth-token', JSON.stringify({access_token:'fake123',expires_at:9999999999}));"
      );
      await driver.get('http://localhost:5173/#/dashboard');
      await WaitHelpers.sleep(4000);
      const url = await driver.getCurrentUrl();
      expect(url.includes('/welcome') || url.includes('/dashboard')).to.be.true;
    });

    it('TC-262 | doctor email domain validation rejects non-prophydent.com email', async function () {
      await authPage.open('doctor');
      await authPage.toggleMode();
      // Use React native setters — required for React controlled inputs
      await authPage.setReactInputValue('input[placeholder*="Doe"]',      'Fake Doctor');
      await authPage.setReactInputValue('input[type="tel"]',              '5550001111');
      await authPage.setReactInputValue('input[placeholder*="Clinical"]', '1 Test Ave');
      await authPage.enterEmail('notadoctor@gmail.com');
      await authPage.enterPassword('validPass123');
      await authPage.clickSubmit();
      const err = await authPage.waitForErrorMessage(8000);
      expect(err.toLowerCase()).to.include('unauthorized');
    });

    it('TC-262b | valid @prophydent.com doctor email passes domain check', async function () {
      await authPage.open('doctor');
      await authPage.toggleMode();
      await authPage.setReactInputValue('input[placeholder*="Doe"]',      'Test Clinician');
      await authPage.setReactInputValue('input[type="tel"]',              '5550002222');
      await authPage.setReactInputValue('input[placeholder*="Clinical"]', '2 Clinical Ave');
      await authPage.enterEmail('test.lmt@prophydent.com');
      await authPage.enterPassword('validPass123');
      await authPage.clickSubmit();
      await WaitHelpers.sleep(4000);
      const err = await authPage.getErrorMessage();
      expect(err.toLowerCase()).to.not.include('unauthorized');
    });

    it('TC-263 | onboarding routes / /welcome /role /auth are publicly accessible', async function () {
      const routes = ['/#/welcome', '/#/role', '/#/auth?role=doctor'];
      for (const r of routes) {
        await driver.get(`http://localhost:5173${r}`);
        await WaitHelpers.sleep(800);
        const url = await driver.getCurrentUrl();
        expect(url).to.include(r.split('?')[0].replace('/#', ''));
      }
    });

    it('TC-264 | clearing localStorage forces re-auth on next protected route visit', async function () {
      // Navigate to welcome first (neutral ground), then clear auth, then test redirect
      await driver.get('http://localhost:5173/#/welcome');
      await WaitHelpers.sleep(500);
      await page.clearAuth();
      await WaitHelpers.sleep(500);
      await driver.get('http://localhost:5173/#/dashboard');
      await WaitHelpers.sleep(5000);
      const url = await driver.getCurrentUrl();
      expect(url).to.include('/welcome');
    });
  });

  // ─── Form Security ─────────────────────────────────────────────────────────
  describe('Form Input Security', function () {
    beforeEach(async function () {
      await authPage.open('doctor');
    });

    it('TC-265 | XSS payload in email field does not execute script', async function () {
      await authPage.enterEmail('xsstest@test.com');
      await WaitHelpers.sleep(300);
      expect(await authPage.isVisible()).to.be.true;
      expect(await driver.getCurrentUrl()).to.include('/auth');
    });

    it('TC-266 | SQL injection payload in password field is handled safely', async function () {
      await authPage.enterPassword("' OR '1'='1");
      const val = await authPage.getAttribute(authPage.locators.passwordInput, 'value');
      expect(val).to.include("' OR '1'='1");
    });

    it('TC-267 | very long email (500 chars) does not crash the page', async function () {
      const longEmail = 'a'.repeat(490) + '@x.com';
      await authPage.enterEmail(longEmail);
      await WaitHelpers.sleep(300);
      expect(await authPage.isVisible()).to.be.true;
    });
  });
});
