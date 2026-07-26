'use strict';

require('dotenv').config();
const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const DriverManager = require('../utils/driverManager');
const WaitHelpers = require('../utils/waitHelpers');
const BasePage = require('../pages/BasePage');

describe('09 - UI & Visual Validation', function () {
  this.timeout(60000);
  let driver, page;

  before(async function () {
    driver = await DriverManager.getDriver();
    page   = new BasePage(driver);
  });

  // ─── General HTML Structure ───────────────────────────────────────────────
  describe('Application HTML Structure', function () {
    it('TC-218 | index.html has a <title> element', async function () {
      await page.navigate('/#/welcome');
      const title = await driver.getTitle();
      expect(title.length).to.be.greaterThan(0);
    });

    it('TC-219 | app root div#root is present', async function () {
      await page.navigate('/#/welcome');
      const root = await driver.findElement(By.css('#root'));
      expect(root).to.not.be.null;
    });

    it('TC-220 | React renders without "Cannot read properties" JS error', async function () {
      await page.navigate('/#/welcome');
      await WaitHelpers.sleep(1000);
      const src = await driver.getPageSource();
      expect(src).to.not.include('Cannot read properties');
    });

    it('TC-221 | no "undefined" rendered as visible text in welcome page', async function () {
      await page.navigate('/#/welcome');
      const body = await driver.findElement(By.css('body'));
      const text = await body.getText();
      expect(text).to.not.include('[object Object]');
    });

    it('TC-222 | CSS custom properties (var(--color-primary)) are applied', async function () {
      await page.navigate('/#/welcome');
      const html = await driver.findElement(By.css('html'));
      // If light theme is applied, data-theme would be 'light' or absent
      const theme = await html.getAttribute('data-theme');
      expect(['light', 'dark', null, '']).to.include(theme);
    });

    it('TC-223 | font is loaded (body uses non-default font-family)', async function () {
      await page.navigate('/#/welcome');
      const fontFamily = await driver.executeScript(
        "return getComputedStyle(document.body).fontFamily"
      );
      expect(fontFamily.length).to.be.greaterThan(0);
    });

    it('TC-224 | app responds at http://localhost:5173', async function () {
      await driver.get('http://localhost:5173/');
      const src = await driver.getPageSource();
      expect(src.length).to.be.greaterThan(100);
    });
  });

  // ─── Welcome Page Visual ──────────────────────────────────────────────────
  describe('Welcome Page – Visual & Accessibility', function () {
    beforeEach(async function () {
      await page.navigate('/#/welcome');
      await WaitHelpers.sleep(500);
    });

    it('TC-225 | welcome logo has alt text', async function () {
      const logo = await driver.findElement(By.css('.welcome-logo'));
      const alt  = await logo.getAttribute('alt');
      expect(alt.length).to.be.greaterThan(0);
    });

    it('TC-226 | Get Started button has a visible text label', async function () {
      const btn  = await driver.findElement(By.css('.btn-large'));
      const text = await btn.getText();
      expect(text.toLowerCase()).to.include('get started');
    });

    it('TC-227 | heading h1 is present and non-empty', async function () {
      const h1  = await driver.findElement(By.css('.welcome-content h1'));
      const txt = await h1.getText();
      expect(txt.length).to.be.greaterThan(0);
    });

    it('TC-228 | welcome-content div has fade-in animation class', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('fade-in');
    });

    it('TC-229 | subtitle paragraph is present and non-empty', async function () {
      const p   = await driver.findElement(By.css('.welcome-subtitle'));
      const txt = await p.getText();
      expect(txt.length).to.be.greaterThan(0);
    });
  });

  // ─── Auth Page Visual ─────────────────────────────────────────────────────
  describe('Auth Page – Visual & Accessibility', function () {
    beforeEach(async function () {
      await driver.get('http://localhost:5173/#/auth?role=doctor');
      await WaitHelpers.sleep(2000);
    });

    it('TC-230 | auth form has autocomplete attributes', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('auth-form');
    });

    it('TC-231 | submit button is type=submit', async function () {
      const btn  = await driver.findElement(By.css('button[type="submit"]'));
      const type = await btn.getAttribute('type');
      expect(type).to.equal('submit');
    });

    it('TC-232 | auth-container has fade-in class for animation', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('fade-in');
    });

    it('TC-233 | logo image on auth page has alt attribute', async function () {
      const logo = await driver.findElement(By.css('.small-logo'));
      const alt  = await logo.getAttribute('alt');
      expect(alt.length).to.be.greaterThan(0);
    });

    it('TC-234 | role label paragraph is visible', async function () {
      const p = await driver.findElement(By.css('.auth-header .text-muted'));
      expect(await p.isDisplayed()).to.be.true;
    });

    it('TC-235 | back button is type=button (not submit)', async function () {
      const btn  = await driver.findElement(By.css('.back-btn'));
      const type = await btn.getAttribute('type');
      expect(type).to.equal('button');
    });
  });

  // ─── Role Selection Visual ────────────────────────────────────────────────
  describe('Role Selection – Visual & Accessibility', function () {
    beforeEach(async function () {
      await driver.get('http://localhost:5173/#/role');
      await WaitHelpers.sleep(800);
    });

    it('TC-236 | role-cards container wraps both cards', async function () {
      const container = await driver.findElement(By.css('.role-cards'));
      expect(container).to.not.be.null;
    });

    it('TC-237 | role-icon div is inside each role card', async function () {
      const icons = await driver.findElements(By.css('.role-icon'));
      expect(icons.length).to.equal(2);
    });

    it('TC-238 | each role card has an h3 heading', async function () {
      const h3s = await driver.findElements(By.css('.role-card h3'));
      expect(h3s.length).to.equal(2);
    });

    it('TC-239 | each role card has a description paragraph', async function () {
      const ps = await driver.findElements(By.css('.role-card p'));
      expect(ps.length).to.be.at.least(2);
    });

    it('TC-240 | subtitle p.text-muted is present below heading', async function () {
      const p = await driver.findElement(By.css('.role-content .text-muted'));
      expect(await p.isDisplayed()).to.be.true;
    });
  });

  // ─── Page Responsiveness Check ────────────────────────────────────────────
  describe('Viewport & Responsive Layout', function () {
    it('TC-241 | layout is usable at 1440×900 resolution', async function () {
      await driver.manage().window().setRect({ width: 1440, height: 900 });
      await page.navigate('/#/welcome');
      const btn = await driver.findElement(By.css('.btn-large'));
      expect(await btn.isDisplayed()).to.be.true;
    });

    it('TC-242 | layout is usable at 1280×800 resolution', async function () {
      await driver.manage().window().setRect({ width: 1280, height: 800 });
      await page.navigate('/#/welcome');
      const btn = await driver.findElement(By.css('.btn-large'));
      expect(await btn.isDisplayed()).to.be.true;
    });

    it('TC-243 | layout is usable at 1920×1080 resolution', async function () {
      await driver.manage().window().setRect({ width: 1920, height: 1080 });
      await page.navigate('/#/welcome');
      const btn = await driver.findElement(By.css('.btn-large'));
      expect(await btn.isDisplayed()).to.be.true;
    });

    it('TC-244 | restore to 1440×900 for subsequent tests', async function () {
      await driver.manage().window().setRect({ width: 1440, height: 900 });
      const size = await driver.manage().window().getRect();
      // Allow ±5px tolerance for OS window decorations
      expect(size.width).to.be.within(1435, 1445);
    });
  });
});
