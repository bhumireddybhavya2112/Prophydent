'use strict';

require('dotenv').config();
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { Options: ChromeOptions } = chrome;

/**
 * Build and return a configured WebDriver instance.
 * selenium-webdriver 4.x uses selenium-manager to auto-resolve the correct
 * chromedriver for the installed Chrome version — no manual chromedriver path needed.
 */
async function buildDriver(browser, headless) {
  const targetBrowser = browser || process.env.BROWSER || 'chrome';
  const isHeadless = headless !== undefined ? headless : process.env.HEADLESS === 'true';

  if (targetBrowser === 'chrome') {
    const options = new ChromeOptions();
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1440,900');
    options.addArguments('--disable-extensions');
    options.addArguments('--disable-popup-blocking');
    options.addArguments('--disable-infobars');
    options.addArguments('--disable-notifications');
    options.addArguments('--lang=en-US');

    if (isHeadless) {
      options.addArguments('--headless=new');
    }

    // selenium-manager auto-downloads the correct chromedriver for Chrome 150
    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    await driver.manage().window().setRect({ width: 1440, height: 900 });
    return driver;
  }

  throw new Error(`Unsupported browser: ${targetBrowser}`);
}

module.exports = { buildDriver };
