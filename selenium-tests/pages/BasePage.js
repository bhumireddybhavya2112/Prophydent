'use strict';

const { By, until } = require('selenium-webdriver');
const config = require('../config/testConfig');
const WaitHelpers = require('../utils/waitHelpers');
const logger = require('../utils/logger');

class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.timeout = config.explicitWait;
    this.baseUrl = config.appUrl;
  }

  /**
   * Navigate using HashRouter convention.
   * Accepts: '/#/welcome', '/welcome', 'welcome'
   */
  async navigate(path) {
    let url;
    if (!path || path === '/') {
      url = `${this.baseUrl}/#/`;
    } else if (path.startsWith('/#')) {
      url = `${this.baseUrl}${path}`;
    } else if (path.startsWith('/')) {
      url = `${this.baseUrl}/#${path}`;
    } else {
      url = `${this.baseUrl}/#/${path}`;
    }
    logger.debug(`Navigating to: ${url}`);
    await this.driver.get(url);
  }

  async getCurrentUrl() { return this.driver.getCurrentUrl(); }
  async getTitle()      { return this.driver.getTitle(); }

  async findElement(locator)  { return WaitHelpers.waitForElement(this.driver, locator); }
  async findElements(locator) { return this.driver.findElements(locator); }

  /** Standard Selenium click — waits for element enabled. */
  async click(locator) {
    const el = await WaitHelpers.waitForClickable(this.driver, locator);
    await el.click();
  }

  /** JavaScript click — reliable for div/span onClick handlers. */
  async jsClick(locator, timeout) {
    return WaitHelpers.jsClick(this.driver, locator, timeout);
  }

  async type(locator, text) {
    const el = await WaitHelpers.waitForElement(this.driver, locator);
    await el.clear();
    await el.sendKeys(text);
  }

  async getText(locator) {
    const el = await WaitHelpers.waitForElement(this.driver, locator);
    return el.getText();
  }

  /** Wait for element to have non-empty text (after React re-renders). */
  async getTextWhenReady(locator, timeout) {
    await WaitHelpers.waitForNonEmptyText(this.driver, locator, timeout);
    const el = await this.driver.findElement(locator);
    return el.getText();
  }

  async isDisplayed(locator) {
    try {
      const el = await this.driver.findElement(locator);
      return el.isDisplayed();
    } catch (e) { return false; }
  }

  async isPresent(locator) {
    try { await this.driver.findElement(locator); return true; }
    catch (e) { return false; }
  }

  async waitForUrl(fragment, timeout) {
    return WaitHelpers.waitForUrl(this.driver, fragment, timeout);
  }

  async waitForElement(locator, timeout) {
    return WaitHelpers.waitForElement(this.driver, locator, timeout);
  }

  async waitForVisible(locator, timeout) {
    return WaitHelpers.waitForVisible(this.driver, locator, timeout);
  }

  async sleep(ms) { return WaitHelpers.sleep(ms); }

  async scrollIntoView(locator) {
    const el = await this.driver.findElement(locator);
    await this.driver.executeScript('arguments[0].scrollIntoView(true);', el);
  }

  async getAttribute(locator, attr) {
    const el = await this.driver.findElement(locator);
    return el.getAttribute(attr);
  }

  async executeScript(script, ...args) {
    return this.driver.executeScript(script, ...args);
  }

  async getCssValue(locator, prop) {
    const el = await this.driver.findElement(locator);
    return el.getCssValue(prop);
  }

  async refresh() { await this.driver.navigate().refresh(); }

  async getPageSource() { return this.driver.getPageSource(); }

  /** Clear all Supabase/sb- keys from localStorage — simulates sign-out. */
  async clearAuth() {
    await this.driver.executeScript(`
      Object.keys(localStorage).forEach(k => {
        if (k.includes('supabase') || k.includes('sb-')) localStorage.removeItem(k);
      });
    `);
    await WaitHelpers.sleep(300);
  }

  /** Wait for and return text of an element (polls until non-empty). */
  async waitForText(locator, text, timeout) {
    return WaitHelpers.waitForText(this.driver, locator, text, timeout);
  }
}

module.exports = BasePage;
