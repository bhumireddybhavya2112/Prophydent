'use strict';

module.exports = {
  spec: 'tests/**/*.test.js',
  timeout: 120000,
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'reports',
    reportFilename: 'prophydent-test-report',
    html: true,
    json: true,
    overwrite: true,
    charts: true,
    code: true,
    timestamp: true
  },
  require: ['utils/hooks.js'],
  exit: true,
  bail: false,
  // No retries — role card tests take ~35 s each; retries would double that
  // and risk hitting the 120 s timeout, killing the Chrome session.
  retries: 0
};
