'use strict';

const { until, By } = require('selenium-webdriver');
const config = require('../config/testConfig');
const logger = require('./logger');

const WaitHelpers = {
  async waitForElement(driver, locator, timeout) {
    const wait = timeout || config.explicitWait;
    try {
      return await driver.wait(until.elementLocated(locator), wait);
    } catch (err) {
      logger.warn(`waitForElement timeout for ${locator}: ${err.message}`);
      throw err;
    }
  },

  async waitForVisible(driver, locator, timeout) {
    const wait = timeout || config.explicitWait;
    try {
      const el = await driver.wait(until.elementLocated(locator), wait);
      await driver.wait(until.elementIsVisible(el), wait);
      return el;
    } catch (err) {
      logger.warn(`waitForVisible timeout for ${locator}: ${err.message}`);
      throw err;
    }
  },

  async waitForClickable(driver, locator, timeout) {
    const wait = timeout || config.explicitWait;
    const el = await driver.wait(until.elementLocated(locator), wait);
    await driver.wait(until.elementIsEnabled(el), wait);
    return el;
  },

  async waitForUrl(driver, urlFragment, timeout) {
    const wait = timeout || config.explicitWait;
    try {
      await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return url.includes(urlFragment);
      }, wait, `URL did not contain "${urlFragment}"`);
    } catch (err) {
      const cur = await driver.getCurrentUrl().catch(() => 'unknown');
      logger.warn(`waitForUrl timeout. Expected: "${urlFragment}", Got: "${cur}"`);
      throw err;
    }
  },

  async waitForTitle(driver, titleFragment, timeout) {
    const wait = timeout || config.explicitWait;
    return driver.wait(until.titleContains(titleFragment), wait);
  },

  /**
   * Wait for an element to have non-empty visible text.
   * Useful after React re-renders that momentarily blank the DOM.
   */
  async waitForNonEmptyText(driver, locator, timeout) {
    const wait = timeout || config.explicitWait;
    let el;
    try {
      await driver.wait(async () => {
        try {
          el = await driver.findElement(locator);
          const text = await el.getText();
          return text.trim().length > 0;
        } catch (e) {
          return false;
        }
      }, wait, `Element still has empty text after ${wait}ms`);
      el = await driver.findElement(locator);
      return el;
    } catch (err) {
      logger.warn(`waitForNonEmptyText timeout for ${locator}: ${err.message}`);
      throw err;
    }
  },

  /**
   * Wait for element to disappear from DOM / become invisible.
   */
  async waitForInvisible(driver, locator, timeout) {
    const wait = timeout || config.explicitWait;
    try {
      const el = await driver.findElement(locator);
      return driver.wait(until.elementIsNotVisible(el), wait);
    } catch (e) {
      return true; // already gone
    }
  },

  /**
   * Wait for text to appear inside an element.
   */
  async waitForText(driver, locator, text, timeout) {
    const wait = timeout || config.explicitWait;
    return driver.wait(async () => {
      try {
        const el = await driver.findElement(locator);
        const elText = await el.getText();
        return elText.includes(text);
      } catch (e) {
        return false;
      }
    }, wait, `Text "${text}" not found`);
  },

  /**
   * Click an element via JavaScript — bypasses pointer-event blockage and
   * avoids flakiness from overlapping elements or TensorFlow init delays.
   */
  async jsClick(driver, locator, timeout) {
    const wait = timeout || config.explicitWait;
    const el = await driver.wait(until.elementLocated(locator), wait);
    await driver.executeScript('arguments[0].scrollIntoView({block:"center"}); arguments[0].click();', el);
  },

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Poll a condition function until it returns truthy or times out.
   */
  async waitFor(driver, condFn, timeout, message) {
    const wait = timeout || config.explicitWait;
    return driver.wait(condFn, wait, message || 'waitFor condition not met');
  }
};

module.exports = WaitHelpers;
