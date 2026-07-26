'use strict';

const ExcelReporter = require('./excelReporter');
const TestResultCollector = require('./testResultCollector');
const logger = require('./logger');
const path = require('path');
const fs = require('fs');

async function main() {
  logger.info('Generating reports...');

  // Try to load mochawesome JSON results if available
  const reportFile = path.join(__dirname, '..', 'reports', 'prophydent-test-report.json');
  let results = TestResultCollector.getResults();

  if (fs.existsSync(reportFile)) {
    try {
      const raw = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
      // Convert mochawesome format to our format
      results = convertMochawesomeResults(raw);
      logger.info('Loaded mochawesome results for Excel export.');
    } catch (e) {
      logger.warn(`Could not parse mochawesome JSON: ${e.message}`);
    }
  }

  const summary = TestResultCollector.getSummary();
  results.summary = {
    ...summary,
    totalSuites: (results.suites || []).length
  };

  const excelPath = await ExcelReporter.generate(results);
  logger.info(`Excel report: ${excelPath}`);

  const htmlPath = path.join(__dirname, '..', 'reports', 'prophydent-test-report.html');
  logger.info(`HTML report: ${fs.existsSync(htmlPath) ? htmlPath : 'Not generated yet (run tests first)'}`);

  console.log('\n========================================');
  console.log('  ProphyDent AI - Test Report Generated');
  console.log('========================================');
  console.log(`Excel: ${excelPath}`);
  console.log(`HTML : ${htmlPath}`);
  console.log('========================================\n');
}

function convertMochawesomeResults(raw) {
  const suites = [];
  const stats = raw.stats || {};

  function processSuite(suite) {
    if (!suite) return;
    const s = { name: suite.title || 'Suite', tests: [] };

    for (const test of (suite.tests || [])) {
      s.tests.push({
        name: test.fullTitle || test.title,
        status: test.pass ? 'passed' : (test.fail ? 'failed' : 'skipped'),
        duration: test.duration || 0,
        error: test.err ? (test.err.message || JSON.stringify(test.err)) : null,
        screenshot: null,
        timestamp: new Date().toISOString()
      });
    }

    if (s.tests.length > 0) suites.push(s);
    for (const child of (suite.suites || [])) processSuite(child);
  }

  processSuite(raw.results && raw.results[0] ? raw.results[0] : raw);

  return {
    suites,
    startTime: stats.start ? new Date(stats.start) : new Date(),
    endTime: stats.end ? new Date(stats.end) : new Date(),
    summary: {
      total: stats.tests || 0,
      passed: stats.passes || 0,
      failed: stats.failures || 0,
      skipped: stats.pending || 0,
      duration: stats.duration ? (stats.duration / 1000).toFixed(2) : 0,
      totalSuites: suites.length
    }
  };
}

main().catch(err => {
  logger.error(`Report generation failed: ${err.message}`);
  process.exit(1);
});
