const { expect } = require('chai');
const AuthPage = require('../../src/pages/AuthPage');
const NavigationPage = require('../../src/pages/NavigationPage');
const credentials = require('../../test-data/credentials.json');
const logger = require('../../src/utils/Logger');

describe('Responsive Design & Screen Layout Compatibility', function () {
    this.timeout(120000);

    before(async () => {
        await browser.deleteCookies();
        await AuthPage.open('doctor');
        const { email, password } = credentials.users.doctor.valid;
        await AuthPage.login(email, password);
        await browser.waitUntil(async () => (await browser.getUrl()).includes('dashboard'), { timeout: 10000 });
    });

    afterEach(async () => {
        // Restore browser back to normal standard desktop size
        logger.info('Restoring standard desktop screen viewport');
        await browser.setWindowSize(1920, 1080);
    });

    // ----------------------------------------------------------------------
    // RESPONSIVE VIEWPORT TESTING
    // ----------------------------------------------------------------------

    it('TC-WEB-301 | Desktop layout displays vertical sidebar with user profile', async () => {
        logger.info('Executing TC-WEB-301');
        await browser.setWindowSize(1200, 800);
        
        // Assert header is displayed
        const isHeaderVis = await NavigationPage.sidebar.$('.sidebar-header').isDisplayed();
        expect(isHeaderVis).to.be.true;

        // Assert user profile in footer is displayed
        const isProfileVis = await NavigationPage.userProfile.isDisplayed();
        expect(isProfileVis).to.be.true;

        // Height should be substantial
        const size = await NavigationPage.sidebar.getSize();
        expect(size.height).to.be.greaterThan(500);
    });

    it('TC-WEB-302 | Mobile viewport collapses vertical sidebar into a bottom horizontal navbar', async () => {
        logger.info('Executing TC-WEB-302');
        // Set mobile viewport width
        await browser.setWindowSize(500, 800);
        await browser.pause(500); // Allow browser rendering reflow

        // Assert vertical-only elements are hidden
        const isHeaderVis = await NavigationPage.sidebar.$('.sidebar-header').isDisplayed();
        expect(isHeaderVis).to.be.false;

        const isProfileVis = await NavigationPage.userProfile.isDisplayed();
        expect(isProfileVis).to.be.false;

        // Sidebar height should be exactly 70px as defined in media query CSS
        const size = await NavigationPage.sidebar.getSize();
        expect(size.height).to.equal(70);
    });
});
