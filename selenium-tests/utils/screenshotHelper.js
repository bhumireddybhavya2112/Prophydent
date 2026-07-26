'use strict';

const path = require('path');
const fs = require('fs');
const logger = require('./logger');

const screenshotsDir = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

const ScreenshotHelper = {
  /**
   * Take a screenshot and save it.
   * @param {WebDriver} driver
   * @param {string} name - Descriptive name
   * @returns {string} - Path to saved screenshot
   */
  async take(driver, name) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${safeName}_${timestamp}.png`;
      const filepath = path.join(screenshotsDir, filename);

      const image = await driver.takeScreenshot();
      fs.writeFileSync(filepath, image, 'base64');
      logger.info(`Screenshot saved: ${filepath}`);
      return filepath;
    } catch (err) {
      logger.error(`Failed to take screenshot: ${err.message}`);
      return null;
    }
  },

  /**
   * Take screenshot on test failure.
   */
  async onFailure(driver, testName) {
    return this.take(driver, `FAIL_${testName}`);
  }
};

module.exports = ScreenshotHelper;
