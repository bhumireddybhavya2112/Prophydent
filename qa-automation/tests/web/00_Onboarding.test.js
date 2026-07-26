const { expect } = require('chai');
const OnboardingPage = require('../../../src/pages/OnboardingPage');
const logger = require('../../../src/utils/Logger');

describe('Onboarding & Landing Page Flows', function () {
    this.timeout(90000);

    beforeEach(async () => {
        await browser.deleteCookies();
    });

    it('TC-WEB-401 | Splash screen displays loader and transitions to welcome page', async () => {
        logger.info('Executing TC-WEB-401');
        // Open splash route
        await browser.url('/');
        
        // Assert splash indicators exist
        const splashDisplayed = await OnboardingPage.splashScreen.isDisplayed();
        expect(splashDisplayed).to.be.true;
        
        expect(await OnboardingPage.loadingSpinner.isDisplayed()).to.be.true;
        
        // Wait for auto redirect to welcome page
        await OnboardingPage.waitForWelcomePage();
        
        const currentUrl = await browser.getUrl();
        expect(currentUrl).to.include('/welcome');
    });

    it('TC-WEB-402 | Welcome page displays title and allows navigating to role selection', async () => {
        logger.info('Executing TC-WEB-402');
        await OnboardingPage.open();
        
        const welcomeTitle = await OnboardingPage.welcomeTitle.getText();
        expect(welcomeTitle).to.include('Welcome to ProphyDent AI');
        
        await OnboardingPage.clickGetStarted();
        
        const currentUrl = await browser.getUrl();
        expect(currentUrl).to.include('/role');
    });

    it('TC-WEB-403 | Role Selection page allows choosing Doctor role', async () => {
        logger.info('Executing TC-WEB-403');
        await browser.url('/#/role');
        await OnboardingPage.waitForElement(OnboardingPage.roleContent);
        
        await OnboardingPage.selectDoctorRole();
        
        await browser.waitUntil(async () => (await browser.getUrl()).includes('role=doctor'), {
            timeout: 5000,
            timeoutMsg: 'Redirection to Auth page with doctor parameter failed'
        });
        
        const currentUrl = await browser.getUrl();
        expect(currentUrl).to.include('/auth?role=doctor');
    });

    it('TC-WEB-404 | Role Selection page allows choosing Patient role', async () => {
        logger.info('Executing TC-WEB-404');
        await browser.url('/#/role');
        await OnboardingPage.waitForElement(OnboardingPage.roleContent);
        
        await OnboardingPage.selectPatientRole();
        
        await browser.waitUntil(async () => (await browser.getUrl()).includes('role=patient'), {
            timeout: 5000,
            timeoutMsg: 'Redirection to Auth page with patient parameter failed'
        });
        
        const currentUrl = await browser.getUrl();
        expect(currentUrl).to.include('/auth?role=patient');
    });
});
