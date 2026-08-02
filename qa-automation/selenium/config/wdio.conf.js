const path = require('path');
const fs = require('fs');

exports.config = {
    runner: 'local',
    specs: [
        '../tests/web/**/*.js',
        '../tests/vulnerability/**/*.js'
    ],
    suites: {
        web: ['../tests/web/**/*.js'],
        vulnerability: ['../tests/vulnerability/**/*.js']
    },
    exclude: [],
    maxInstances: 1,
    capabilities: [{
        maxInstances: 1,
        browserName: 'chrome',
        acceptInsecureCerts: true,
        'goog:chromeOptions': {
            args: ['--headless', '--disable-gpu', '--window-size=1920,1080']
        }
    }],
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://127.0.0.1:5173',
    waitforTimeout: 15000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: [],
    framework: 'mocha',
    reporters: ['spec', ['allure', {
        outputDir: 'reports/allure-results',
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
    }]],
    mochaOpts: {
        ui: 'bdd',
        timeout: 90000
    },
    afterTest: async function(test, context, { error, result, duration, passed, retries }) {
        if (!passed) {
            try {
                const reportsDir = path.join(__dirname, '../reports/screenshots');
                if (!fs.existsSync(reportsDir)) {
                    fs.mkdirSync(reportsDir, { recursive: true });
                }
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const cleanTitle = test.title.replace(/[^a-zA-Z0-9_]/g, '_');
                const filepath = path.join(reportsDir, `${cleanTitle}_${timestamp}.png`);
                
                const screenshot = await browser.takeScreenshot();
                fs.writeFileSync(filepath, screenshot, 'base64');
                console.log(`[Screenshot] Saved failure screenshot to: ${filepath}`);
            } catch (err) {
                console.error('[Screenshot] Failed to save screenshot on failure:', err);
            }
        }
    }
};
