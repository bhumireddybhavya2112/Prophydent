const { expect } = require('chai');
const AuthPage = require('../../src/pages/AuthPage');
const credentials = require('../../test-data/credentials.json');
const logger = require('../../src/utils/Logger');

describe('Authentication - Patient Login', function () {
    this.timeout(90000);

    beforeEach(async () => {
        await browser.deleteCookies();
        await AuthPage.open('patient');
    });

    // ----------------------------------------------------------------------
    // POSITIVE SCENARIOS
    // ----------------------------------------------------------------------

    it('TC-WEB-017 | Patient login succeeds with valid Gmail address credentials', async () => {
        logger.info('Executing TC-WEB-017');
        const { email, password } = credentials.users.patient.valid;
        
        const headerText = await AuthPage.heading.getText();
        expect(headerText).to.include('Welcome Back');
        
        await AuthPage.login(email, password);
        
        await browser.waitUntil(async () => (await browser.getUrl()).includes('dashboard'), {
            timeout: 10000,
            timeoutMsg: 'Expected to navigate to /dashboard after valid login'
        });
        
        const currentUrl = await browser.getUrl();
        expect(currentUrl).to.include('/dashboard');
    });

    // ----------------------------------------------------------------------
    // NEGATIVE SCENARIOS - EMAIL VALIDATION
    // ----------------------------------------------------------------------

    it('TC-WEB-018 | Patient login fails with non-Gmail address', async () => {
        logger.info('Executing TC-WEB-018');
        // Depending on backend validation rules, non-gmail might fail.
        // The business rule says "Accept only valid Gmail addresses."
        await AuthPage.login('nandureddy@yahoo.com', 'nandureddy');
        
        // Wait briefly to see if it rejects or if it's handled at registration
        const currentUrl = await browser.getUrl();
        if (currentUrl.includes('/dashboard')) {
             // If it lets them in, that's a bug based on requirements, but we assert what we expect.
             // We expect it to FAIL.
             throw new Error("Patient login succeeded with non-gmail address, but it should have failed.");
        } else {
             expect(currentUrl).to.include('/auth');
        }
    });

    it('TC-WEB-019 | Patient login fails with invalid email format', async () => {
        logger.info('Executing TC-WEB-019');
        await AuthPage.login('nandureddygmail.com', 'nandureddy');
        
        // HTML5 Validation triggers
        const currentUrl = await browser.getUrl();
        expect(currentUrl).to.include('/auth');
    });

    it('TC-WEB-020 | Patient login is prevented when email field is empty', async () => {
        logger.info('Executing TC-WEB-020');
        await AuthPage.login('', 'nandureddy');
        
        const currentUrl = await browser.getUrl();
        expect(currentUrl).to.include('/auth');
    });

    // ----------------------------------------------------------------------
    // NEGATIVE SCENARIOS - PASSWORD VALIDATION
    // ----------------------------------------------------------------------

    it('TC-WEB-021 | Patient login is prevented when password field is empty', async () => {
        logger.info('Executing TC-WEB-021');
        const { email } = credentials.users.patient.valid;
        await AuthPage.login(email, '');
        
        const currentUrl = await browser.getUrl();
        expect(currentUrl).to.include('/auth');
    });

    it('TC-WEB-022 | Patient login fails with incorrect password', async () => {
        logger.info('Executing TC-WEB-022');
        const { email } = credentials.users.patient.valid;
        await AuthPage.login(email, 'WrongPass123');
        
        const errorText = await AuthPage.getErrorMessage();
        expect(errorText.toLowerCase()).to.include('invalid login credentials');
    });

    // ----------------------------------------------------------------------
    // UI & STATE VALIDATION
    // ----------------------------------------------------------------------

    it('TC-WEB-023 | Patient login page displays correct patient portal role indicator', async () => {
        logger.info('Executing TC-WEB-023');
        const roleText = await AuthPage.roleLabel.getText();
        expect(roleText).to.include('Patient Portal');
    });

    it('TC-WEB-024 | Patient login page allows toggling to registration form', async () => {
        logger.info('Executing TC-WEB-024');
        await AuthPage.toggleAuthMode();
        
        const headerText = await AuthPage.heading.getText();
        expect(headerText).to.include('Create an Account');
    });

    it('TC-WEB-025 | Back button safely navigates away from patient login to role selection', async () => {
        logger.info('Executing TC-WEB-025');
        await AuthPage.clickElement(AuthPage.backBtn);
        
        const currentUrl = await browser.getUrl();
        expect(currentUrl).to.include('/role');
    });
});
