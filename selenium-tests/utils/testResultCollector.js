'use strict';

const results = {
  suites: [],
  startTime: null,
  endTime: null
};

const TestResultCollector = {
  start() {
    results.startTime = new Date();
    results.suites = [];
  },

  addSuite(name) {
    const suite = {
      name,
      tests: [],
      startTime: new Date()
    };
    results.suites.push(suite);
    return suite;
  },

  addTest(suite, testName, status, duration, error, screenshot) {
    suite.tests.push({
      name: testName,
      status, // 'passed' | 'failed' | 'skipped'
      duration,
      error: error ? error.message || String(error) : null,
      screenshot: screenshot || null,
      timestamp: new Date().toISOString()
    });
  },

  finish() {
    results.endTime = new Date();
  },

  getResults() {
    return { ...results };
  },

  getSummary() {
    let total = 0, passed = 0, failed = 0, skipped = 0;
    for (const suite of results.suites) {
      for (const test of suite.tests) {
        total++;
        if (test.status === 'passed') passed++;
        else if (test.status === 'failed') failed++;
        else skipped++;
      }
    }
    const duration = results.endTime && results.startTime
      ? ((results.endTime - results.startTime) / 1000).toFixed(2)
      : 0;
    return { total, passed, failed, skipped, duration };
  }
};

module.exports = TestResultCollector;
