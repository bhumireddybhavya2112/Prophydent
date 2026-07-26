'use strict';

require('dotenv').config();

const config = {
  // Application — HashRouter: all routes use /#/path
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS === 'true',

  // Timeouts (ms)
  implicitWait:    parseInt(process.env.IMPLICIT_WAIT)  || 10000,
  explicitWait:    parseInt(process.env.EXPLICIT_WAIT)  || 15000,
  pageLoadTimeout: 30000,
  splashTimeout:   5000,

  // Test credentials — doctor must use @prophydent.com domain
  testEmail:    process.env.TEST_EMAIL    || 'test.doctor.lmt@prophydent.com',
  testPassword: process.env.TEST_PASSWORD || 'testpass123',

  // Valid doctor email samples for UI/domain validation tests
  validDoctorEmail:   'example.lmt@prophydent.com',
  invalidDoctorEmail: 'doctor@gmail.com',

  // Reports
  screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE !== 'false',
  retryCount: parseInt(process.env.RETRY_COUNT) || 2,

  // Directories
  dirs: {
    screenshots:  'screenshots',
    reports:      'reports',
    excelReports: 'excel-reports',
    logs:         'logs'
  },

  // HashRouter routes — navigate to APP_URL + #/path
  routes: {
    splash:      '/#/',
    welcome:     '/#/welcome',
    role:        '/#/role',
    auth:        '/#/auth',
    authDoctor:  '/#/auth?role=doctor',
    authPatient: '/#/auth?role=patient',
    dashboard:   '/#/dashboard',
    patients:    '/#/patients',
    analysis:    '/#/analysis',
    reports:     '/#/reports',
    settings:    '/#/settings'
  }
};

module.exports = config;
