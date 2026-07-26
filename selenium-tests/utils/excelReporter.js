'use strict';

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

const excelDir = path.join(__dirname, '..', 'excel-reports');
if (!fs.existsSync(excelDir)) fs.mkdirSync(excelDir, { recursive: true });

const ExcelReporter = {
  async generate(results) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ProphyDent Selenium Framework';
    workbook.created = new Date();

    // ── Summary Sheet ──────────────────────────────────────────────────
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 40 }
    ];

    const summary = results.summary || {};
    const headerStyle = { font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } }, alignment: { horizontal: 'center' } };
    summarySheet.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));

    const rows = [
      ['Project', 'ProphyDent AI'],
      ['Framework', 'Selenium WebDriver + Mocha + Chai'],
      ['Browser', 'Google Chrome 150'],
      ['Node Version', process.version],
      ['Execution Date', new Date().toLocaleString()],
      ['Total Suites', summary.totalSuites || 0],
      ['Total Tests', summary.total || 0],
      ['Passed', summary.passed || 0],
      ['Failed', summary.failed || 0],
      ['Skipped', summary.skipped || 0],
      ['Execution Time (s)', summary.duration || 0],
      ['Pass Rate (%)', summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(1) : '0.0']
    ];

    rows.forEach((row, i) => {
      const r = summarySheet.addRow({ metric: row[0], value: row[1] });
      if (i % 2 === 0) {
        r.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4FF' } }; });
      }
    });

    // ── Test Details Sheet ─────────────────────────────────────────────
    const detailSheet = workbook.addWorksheet('Test Details');
    detailSheet.columns = [
      { header: '#', key: 'num', width: 6 },
      { header: 'Suite', key: 'suite', width: 30 },
      { header: 'Test Name', key: 'test', width: 55 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Duration (s)', key: 'duration', width: 15 },
      { header: 'Error', key: 'error', width: 60 },
      { header: 'Screenshot', key: 'screenshot', width: 40 },
      { header: 'Timestamp', key: 'timestamp', width: 25 }
    ];

    detailSheet.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));

    let rowNum = 1;
    for (const suite of (results.suites || [])) {
      for (const test of suite.tests) {
        const r = detailSheet.addRow({
          num: rowNum++,
          suite: suite.name,
          test: test.name,
          status: test.status.toUpperCase(),
          duration: typeof test.duration === 'number' ? (test.duration / 1000).toFixed(2) : 'N/A',
          error: test.error || '',
          screenshot: test.screenshot || '',
          timestamp: test.timestamp || ''
        });

        const statusCell = r.getCell('status');
        if (test.status === 'passed') {
          statusCell.font = { bold: true, color: { argb: 'FF16A34A' } };
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
        } else if (test.status === 'failed') {
          statusCell.font = { bold: true, color: { argb: 'FFDC2626' } };
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
        } else {
          statusCell.font = { bold: true, color: { argb: 'FFB45309' } };
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
        }
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `prophydent-test-results-${timestamp}.xlsx`;
    const filepath = path.join(excelDir, filename);
    await workbook.xlsx.writeFile(filepath);
    logger.info(`Excel report saved: ${filepath}`);
    return filepath;
  }
};

module.exports = ExcelReporter;
