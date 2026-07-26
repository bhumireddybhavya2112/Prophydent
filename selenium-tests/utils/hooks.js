'use strict';

require('dotenv').config();
const DriverManager = require('./driverManager');
const ScreenshotHelper = require('./screenshotHelper');
const TestResultCollector = require('./testResultCollector');
const ExcelReporter = require('./excelReporter');
const logger = require('./logger');
const config = require('../config/testConfig');

// Mocha root hooks — exported so Mocha loads them as a Root Hook Plugin
// via --require. Mocha 8+ supports exports.mochaHooks.
exports.mochaHooks = {
  async beforeAll() {
    logger.info('=== ProphyDent AI Selenium Test Suite Starting ===');
    logger.info(`App URL  : ${config.appUrl}`);
    logger.info(`Browser  : ${config.browser}`);
    logger.info(`Headless : ${config.headless}`);
    TestResultCollector.start();
  },

  async afterAll() {
    TestResultCollector.finish();

    try {
      await DriverManager.quitDriver();
      logger.info('Driver cleaned up after all tests.');
    } catch (e) {
      logger.warn(`Driver cleanup error: ${e.message}`);
    }

    try {
      const results = TestResultCollector.getResults();
      const summary  = TestResultCollector.getSummary();
      results.summary = { ...summary, totalSuites: results.suites.length };
      await ExcelReporter.generate(results);
    } catch (e) {
      logger.warn(`Excel report generation error: ${e.message}`);
    }

    const summary = TestResultCollector.getSummary();
    logger.info('=== Test Suite Complete ===');
    logger.info(`Total: ${summary.total} | Passed: ${summary.passed} | Failed: ${summary.failed} | Skipped: ${summary.skipped}`);
    logger.info(`Duration: ${summary.duration}s`);
  },

  async afterEach() {
    if (this.currentTest && this.currentTest.state === 'failed') {
      try {
        const driver = await DriverManager.getDriver();
        const testTitle = this.currentTest.fullTitle().replace(/\s+/g, '_').slice(0, 80);
        await ScreenshotHelper.onFailure(driver, testTitle);
      } catch (e) {
        logger.warn(`Could not take failure screenshot: ${e.message}`);
      }
    }
  }
};
