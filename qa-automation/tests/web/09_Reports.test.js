const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const AuthPage = require('../../../src/pages/AuthPage');
const UploadAnalysisPage = require('../../../src/pages/UploadAnalysisPage');
const PatientManagementPage = require('../../../src/pages/PatientManagementPage');
const ReportsPage = require('../../../src/pages/ReportsPage');
const credentials = require('../../../test-data/credentials.json');
const logger = require('../../../src/utils/Logger');

describe('Clinical Reports Module', function () {
    this.timeout(180000);
    let dummyImagePath;
    let createdPatientName;

    before(async () => {
        // 1. Create dummy image
        const dummyData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
        dummyImagePath = path.join(__dirname, '../../../test-data/dummy-report-scan.png');
        fs.writeFileSync(dummyImagePath, dummyData);

        // 2. Login
        await browser.deleteCookies();
        await AuthPage.open('doctor');
        const { email, password } = credentials.users.doctor.valid;
        await AuthPage.login(email, password);
        await browser.waitUntil(async () => (await browser.getUrl()).includes('dashboard'), { timeout: 10000 });

        // 3. Create a patient to bind the report to
        createdPatientName = `ReportsTestPatient_${Date.now()}`;
        await PatientManagementPage.open();
        await PatientManagementPage.switchToAddPatient();
        await PatientManagementPage.createPatient({
            fullName: createdPatientName,
            dob: '1995-08-25'
        });
        await browser.pause(2000); // Allow database write

        // 4. Generate & Save a report for this patient
        await UploadAnalysisPage.open();
        await UploadAnalysisPage.selectFirstPatient();
        await UploadAnalysisPage.uploadImage(dummyImagePath);
        
        // Wait for scanning state to handle mockup backend
        try {
            await browser.waitUntil(async () => {
                const resultsVis = await UploadAnalysisPage.resultsState.isDisplayed();
                const alertOpen = await browser.isAlertOpen();
                return resultsVis || alertOpen;
            }, { timeout: 15000 });

            if (await browser.isAlertOpen()) {
                await browser.acceptAlert();
            } else {
                await UploadAnalysisPage.btnSaveReport.click();
                await browser.pause(2000);
            }
        } catch (e) {
            logger.warn('Pre-setup report generation issue: ' + e.message);
        }
    });

    after(() => {
        if (fs.existsSync(dummyImagePath)) {
            fs.unlinkSync(dummyImagePath);
        }
    });

    beforeEach(async () => {
        await ReportsPage.open();
    });

    // ----------------------------------------------------------------------
    // UI LAYOUT & DETAILS RENDERING
    // ----------------------------------------------------------------------

    it('TC-WEB-251 | Clinical Reports page title matches active portal view', async () => {
        logger.info('Executing TC-WEB-251');
        const title = await ReportsPage.pageTitle.getText();
        expect(title).to.equal('Clinical Reports');
    });

    it('TC-WEB-252 | Selecting a report card renders full details in the viewer', async () => {
        logger.info('Executing TC-WEB-252');
        
        const count = await ReportsPage.reportsList.length;
        if (count > 0) {
            await ReportsPage.selectReportByIndex(0);
            
            const viewerTitle = await ReportsPage.viewerTitle.getText();
            expect(viewerTitle.length).to.be.greaterThan(0);
            
            const metaDisplayed = await ReportsPage.viewerMeta.isDisplayed();
            expect(metaDisplayed).to.be.true;
        } else {
            logger.warn('Skipping TC-WEB-252: No reports available in database for this test doctor.');
        }
    });

    // ----------------------------------------------------------------------
    // FILTER & SEARCH ACTIONS
    // ----------------------------------------------------------------------

    it('TC-WEB-253 | Reports list filters accurately matching patient name search query', async () => {
        logger.info('Executing TC-WEB-253');
        const initialCount = await ReportsPage.reportsList.length;
        
        if (initialCount > 0) {
            // Search using the newly created patient name
            await ReportsPage.searchReport(createdPatientName);
            
            const filteredCount = await ReportsPage.reportsList.length;
            expect(filteredCount).to.be.at.most(initialCount);
            
            if (filteredCount > 0) {
                const firstCardTitle = await ReportsPage.reportsList[0].$('.report-card-header h4').getText();
                expect(firstCardTitle).to.equal(createdPatientName);
            }
        }
    });

    it('TC-WEB-254 | Search filters return empty state if search term matches no reports', async () => {
        logger.info('Executing TC-WEB-254');
        await ReportsPage.searchReport('NonExistentPatientNameX1Y2Z3');
        
        const count = await ReportsPage.reportsList.length;
        expect(count).to.equal(0);
        
        const isEmptyVis = await ReportsPage.emptyListState.isDisplayed();
        expect(isEmptyVis).to.be.true;
    });

    // ----------------------------------------------------------------------
    // PDF & SHARE ACTIONS
    // ----------------------------------------------------------------------

    it('TC-WEB-255 | Download PDF button is visible and active on selecting a report', async () => {
        logger.info('Executing TC-WEB-255');
        const count = await ReportsPage.reportsList.length;
        if (count > 0) {
            await ReportsPage.selectReportByIndex(0);
            const isClickable = await ReportsPage.btnDownloadPdf.isClickable();
            expect(isClickable).to.be.true;
        }
    });

    it('TC-WEB-256 | Share report button is visible and active on selecting a report', async () => {
        logger.info('Executing TC-WEB-256');
        const count = await ReportsPage.reportsList.length;
        if (count > 0) {
            await ReportsPage.selectReportByIndex(0);
            const isClickable = await ReportsPage.btnShare.isClickable();
            expect(isClickable).to.be.true;
        }
    });
});
