const { expect } = require('chai');
const MobileAuthPage = require('../../src/pages/mobile/MobileAuthPage');
const MobileDashboardPage = require('../../src/pages/mobile/MobileDashboardPage');
const MobileUploadAnalysisPage = require('../../src/pages/mobile/MobileUploadAnalysisPage');
const credentials = require('../../test-data/credentials.json');
const logger = require('../../src/utils/Logger');

describe('Appium Mobile: Dashboard & Native Media Module', function () {
    this.timeout(180000);

    before(async () => {
        // Authenticate once as Doctor
        await browser.deleteCookies();
        await MobileAuthPage.switchToWebViewContext();
        await browser.url('auth?role=doctor');
        const { email, password } = credentials.users.doctor.valid;
        await MobileAuthPage.login(email, password);
        await browser.waitUntil(async () => (await browser.getUrl()).includes('dashboard'), { timeout: 10000 });
    });

    beforeEach(async () => {
        await MobileDashboardPage.switchToWebViewContext();
    });

    // ----------------------------------------------------------------------
    // DASHBOARD & NAVIGATION
    // ----------------------------------------------------------------------

    it('TC-MOB-101 | Mobile Dashboard renders statistic items list cleanly', async () => {
        logger.info('Executing TC-MOB-101');
        const title = await MobileDashboardPage.getWelcomeTitle();
        expect(title.toLowerCase()).to.include('dr.');
        
        const count = await MobileDashboardPage.statCards.length;
        expect(count).to.be.greaterThan(0);
    });

    // ----------------------------------------------------------------------
    // NATIVE IMAGE UPLOADS
    // ----------------------------------------------------------------------

    it('TC-MOB-221 | Start New Analysis navigates to scan upload portal', async () => {
        logger.info('Executing TC-MOB-221');
        await MobileDashboardPage.clickStartAnalysis();
        
        await browser.waitUntil(async () => (await browser.getUrl()).includes('analysis'), { timeout: 10000 });
        expect(await browser.getUrl()).to.include('/analysis');
    });

    it('TC-MOB-222 | Native camera photo capture handles permissions and confirms picture', async () => {
        logger.info('Executing TC-MOB-222');
        await browser.url('analysis');
        
        await MobileUploadAnalysisPage.selectFirstPatient();
        
        // This invokes the full hybrid permission handling, native shutter tap, and return back
        await MobileUploadAnalysisPage.captureImageFromNativeCamera();
        
        // Assert we are back in WebView context and processing
        const scanningVis = await MobileUploadAnalysisPage.scanningState.isDisplayed();
        expect(scanningVis).to.be.true;
    });

    it('TC-MOB-223 | Gallery image selection picker picks first native thumbnail item', async () => {
        logger.info('Executing TC-MOB-223');
        await browser.url('analysis');
        await MobileUploadAnalysisPage.selectFirstPatient();
        
        await MobileUploadAnalysisPage.selectImageFromNativeGallery();
        
        const scanningVis = await MobileUploadAnalysisPage.scanningState.isDisplayed();
        expect(scanningVis).to.be.true;
    });
});
