const { expect } = require('chai');
const AuthPage = require('../../src/pages/AuthPage');
const logger = require('../../src/utils/Logger');

describe('Authentication - Doctor Registration', function () {
    this.timeout(90000);

    beforeEach(async () => {
        await browser.deleteCookies();
        await AuthPage.open('doctor');
        await AuthPage.toggleAuthMode();
    });

    // ----------------------------------------------------------------------
    // POSITIVE SCENARIOS
    // ----------------------------------------------------------------------

    it('TC-WEB-026 | Doctor registration succeeds with valid ProphyDent domain email and all fields', async () => {
        logger.info('Executing TC-WEB-026');
        const uniqueEmail = `test.doctor.${Date.now()}.lmt@prophydent.com`;
        
        await AuthPage.fillSignupForm({
            fullName: 'Dr. Automated Test',
            mobile: '+15551234567',
            address: '123 ProphyDent Clinic Way',
            gender: 'female',
            email: uniqueEmail,
            password: 'StrongPassword123!'
        });
        
        await AuthPage.submitSignup();
        
        // Either navigates to dashboard OR shows success message depending on confirm-email requirement
        try {
            await browser.waitUntil(async () => {
                const url = await browser.getUrl();
                const errorDisplayed = await AuthPage.isErrorDisplayed();
                return url.includes('dashboard') || errorDisplayed;
            }, { timeout: 15000 });
            
            const currentUrl = await browser.getUrl();
            if (!currentUrl.includes('dashboard')) {
                const msg = await AuthPage.getErrorMessage();
                expect(msg.toLowerCase()).to.include('successful');
            }
        } catch (e) {
            throw new Error('Registration timed out or failed unexpectedly');
        }
    });

    // ----------------------------------------------------------------------
    // NEGATIVE SCENARIOS - VALIDATIONS
    // ----------------------------------------------------------------------

    it('TC-WEB-027 | Doctor registration fails when using non-ProphyDent domain email', async () => {
        logger.info('Executing TC-WEB-027');
        await AuthPage.fillSignupForm({
            fullName: 'Dr. Invalid Domain',
            mobile: '+15550000000',
            address: '123 Fake St',
            gender: 'male',
            email: 'doctor.test@gmail.com',
            password: 'Password123!'
        });
        
        await AuthPage.submitSignup();
        const errorText = await AuthPage.getErrorMessage();
        expect(errorText.toLowerCase()).to.include('unauthorized email domain');
    });

    it('TC-WEB-028 | Doctor registration fails when required full name is empty', async () => {
        logger.info('Executing TC-WEB-028');
        await AuthPage.fillSignupForm({
            fullName: '',
            mobile: '+15550000000',
            address: '123 Fake St',
            gender: 'male',
            email: 'doc.lmt@prophydent.com',
            password: 'Password123!'
        });
        
        await AuthPage.submitSignup();
        const currentUrl = await browser.getUrl();
        expect(currentUrl).to.include('/auth');
    });

    it('TC-WEB-029 | Doctor registration fails when password is too short', async () => {
        logger.info('Executing TC-WEB-029');
        await AuthPage.fillSignupForm({
            fullName: 'Dr. Short Pass',
            mobile: '+15550000000',
            address: '123 Fake St',
            gender: 'male',
            email: 'doc2.lmt@prophydent.com',
            password: '123'
        });
        
        await AuthPage.submitSignup();
        const currentUrl = await browser.getUrl();
        expect(currentUrl).to.include('/auth');
    });

    it('TC-WEB-030 | Doctor registration fails when mobile number contains letters', async () => {
        logger.info('Executing TC-WEB-030');
        // Type='tel' usually doesn't prevent letters from being typed in React without extra logic,
        // but backend or custom validation should catch it. 
        await AuthPage.fillSignupForm({
            fullName: 'Dr. Letters',
            mobile: 'abc123def4',
            address: '123 Fake St',
            gender: 'male',
            email: 'doc3.lmt@prophydent.com',
            password: 'Password123!'
        });
        
        await AuthPage.submitSignup();
        // If it submits, we check if an error is displayed
        // If HTML5 blocks it, URL won't change
        const currentUrl = await browser.getUrl();
        if (currentUrl.includes('/dashboard')) {
             throw new Error("Registration succeeded with invalid letters in mobile number.");
        }
    });

    it('TC-WEB-031 | Doctor registration handles avatar upload gracefully', async () => {
        logger.info('Executing TC-WEB-031');
        // We will just check if the avatar input exists and is interactable for file paths
        const isPresent = await AuthPage.inputAvatar.isExisting();
        expect(isPresent).to.be.true;
        
        // Full file upload requires a local asset, which is out of scope for basic UI check, 
        // but we verify the container exists.
    });
});
