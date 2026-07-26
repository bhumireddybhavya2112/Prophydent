'use strict';

const { buildDriver } = require('../config/browserConfig');
const logger = require('./logger');

let driverInstance = null;

const DriverManager = {
  /**
   * Get or create a driver instance.
   * Automatically recovers from invalid/dead sessions.
   */
  async getDriver() {
    if (driverInstance) {
      // Verify session is still alive before returning it
      try {
        await driverInstance.getTitle();
        return driverInstance;
      } catch (e) {
        logger.warn(`Existing driver session is dead (${e.message.split('\n')[0]}). Creating fresh driver.`);
        driverInstance = null;
      }
    }
    logger.info('Creating new WebDriver instance...');
    driverInstance = await buildDriver();
    logger.info('WebDriver created successfully.');
    return driverInstance;
  },

  /**
   * Quit and clean up the driver.
   */
  async quitDriver() {
    if (driverInstance) {
      try {
        await driverInstance.quit();
        logger.info('WebDriver quit successfully.');
      } catch (err) {
        logger.warn(`Error quitting driver: ${err.message}`);
      } finally {
        driverInstance = null;
      }
    }
  },

  /**
   * Force a fresh driver regardless of current state.
   */
  async createFreshDriver() {
    await this.quitDriver();
    return this.getDriver();
  }
};

module.exports = DriverManager;
