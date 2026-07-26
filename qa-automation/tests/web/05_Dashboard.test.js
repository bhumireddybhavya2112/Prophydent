const { expect } = require('chai');
const AuthPage = require('../../../src/pages/AuthPage');
const DashboardPage = require('../../../src/pages/DashboardPage');
const credentials = require('../../../test-data/credentials.json');
const logger = require('../../../src/utils/Logger');

describe('Dashboard Module - Role Based Testing', function () {
    this.timeout(90000);

    // ----------------------------------------------------------------------
    // DOCTOR DASHBOARD SCENARIOS
    // ----------------------------------------------------------------------
    describe('Doctor Dashboard', () => {
        before(async () => {
            // Login once as doctor for the whole describe block
            await browser.deleteCookies();
            await AuthPage.open('doctor');
            const { email, password } = credentials.users.doctor.valid;
            await AuthPage.login(email, password);
            await browser.waitUntil(async () => (await browser.getUrl()).includes('dashboard'), { timeout: 10000 });
        });

        it('TC-WEB-051 | Doctor Dashboard loads successfully with correct welcome message', async () => {
            logger.info('Executing TC-WEB-051');
            const title = await DashboardPage.getWelcomeTitle();
            expect(title.toLowerCase()).to.include('dr.');
        });

        it('TC-WEB-052 | Doctor Dashboard displays specific clinical statistics', async () => {
            logger.info('Executing TC-WEB-052');
            const labels = await DashboardPage.getStatLabels();
            expect(labels).to.include('Total Patients');
            expect(labels).to.include('Total Scans');
            expect(labels).to.include('Concordance level with expert decision');
        });

        it('TC-WEB-053 | "Start New Analysis" button is visible and clickable on Doctor Dashboard', async () => {
            logger.info('Executing TC-WEB-053');
            const isClickable = await DashboardPage.btnStartAnalysis.isClickable();
            expect(isClickable).to.be.true;
        });

        it('TC-WEB-054 | Recent Scans section is rendered on Doctor Dashboard', async () => {
            logger.info('Executing TC-WEB-054');
            const isVisible = await DashboardPage.isRecentScansVisible();
            expect(isVisible).to.be.true;
        });

        it('TC-WEB-055 | Doctor AI Insights section shows clinical trends', async () => {
            logger.info('Executing TC-WEB-055');
            const insightsContainer = await DashboardPage.aiInsightsContainer;
            expect(await insightsContainer.isDisplayed()).to.be.true;
            
            const header = await insightsContainer.$('.card-header h3').getText();
            expect(header).to.equal('AI Insights');
        });
    });

    // ----------------------------------------------------------------------
    // PATIENT DASHBOARD SCENARIOS
    // ----------------------------------------------------------------------
    describe('Patient Dashboard', () => {
        before(async () => {
            // Login once as patient
            await browser.deleteCookies();
            await AuthPage.open('patient');
            const { email, password } = credentials.users.patient.valid;
            await AuthPage.login(email, password);
            await browser.waitUntil(async () => (await browser.getUrl()).includes('dashboard'), { timeout: 10000 });
        });

        it('TC-WEB-056 | Patient Dashboard loads successfully with correct welcome message', async () => {
            logger.info('Executing TC-WEB-056');
            const title = await DashboardPage.getWelcomeTitle();
            // Should not include 'Dr.'
            expect(title.toLowerCase()).to.not.include('dr.');
            
            const subtitle = await DashboardPage.subtitle.getText();
            expect(subtitle.toLowerCase()).to.include('oral health overview');
        });

        it('TC-WEB-057 | Patient Dashboard displays specific personal statistics', async () => {
            logger.info('Executing TC-WEB-057');
            const labels = await DashboardPage.getStatLabels();
            expect(labels).to.include('Total Scans');
            expect(labels).to.include('Last Checkup');
            expect(labels).to.include('Saved Reports');
        });

        it('TC-WEB-058 | "Start New Analysis" button is visible on Patient Dashboard', async () => {
            logger.info('Executing TC-WEB-058');
            const isVisible = await DashboardPage.btnStartAnalysis.isDisplayed();
            expect(isVisible).to.be.true;
        });

        it('TC-WEB-059 | Patient Insights section shows Oral Health Tips', async () => {
            logger.info('Executing TC-WEB-059');
            const insightsContainer = await DashboardPage.aiInsightsContainer;
            const header = await insightsContainer.$('.card-header h3').getText();
            expect(header).to.equal('Oral Health Tips');
        });
    });
});
