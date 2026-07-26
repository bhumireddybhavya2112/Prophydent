'use strict';

const logger = require('./logger');
const config = require('../config/testConfig');

/**
 * Retry an async function up to maxRetries times.
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Max attempts (default from config)
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise<any>}
 */
async function retry(fn, maxRetries, delay) {
  const attempts = maxRetries !== undefined ? maxRetries : config.retryCount;
  const waitMs = delay || 1000;
  let lastError;

  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      logger.warn(`Attempt ${i}/${attempts} failed: ${err.message}`);
      if (i < attempts) {
        await new Promise(resolve => setTimeout(resolve, waitMs));
      }
    }
  }

  throw lastError;
}

module.exports = { retry };
