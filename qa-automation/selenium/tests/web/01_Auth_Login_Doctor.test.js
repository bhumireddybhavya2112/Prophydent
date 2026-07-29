const { expect } = require('chai');
const AuthPage = require('../../src/pages/AuthPage');
const credentials = require('../../test-data/credentials.json');
const logger = require('../../src/utils/Logger');

describe('Authentication - Doctor Login', function () {
    // Increase timeout for UI tests
    this.timeout(90000);

    beforeEach(async () => {
        // Clear browser session/cookies before each test to ensure clean state
        await browser.deleteCookies();
        await AuthPage.open('doctor');
    });

    // ----------------------------------------------------------------------
    // POSITIVE SCENARIOS
    // ----------------------------------------------------------------------

    it('TC-WEB-001 | Doctor login succeeds with valid ProphyDent domain credentials', async () => {
        logger.info('Executing TC-WEB-001');
        const { email, password } = credentials.users.doctor.valid;
        
        // Assert initial state
        const headerText = await AuthPage.heading.getText();
        expect(headerText).to.include('Welcome Back');
        
        await AuthPage.login(email, password);
        
        // Verify navigation to dashboard (or at least URL change)
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

    it('TC-WEB-002 | Doctor login fails with missing .lmt prefix in domain', async () => {
        logger.info('Executing TC-WEB-002');
        await AuthPage.login('surendra@prophydent.com', 'surendra123');
        
        const errorText = await AuthPage.getErrorMessage();
        expect(errorText.toLowerCase()).to.satisfy(msg => 
            msg.includes('invalid login credentials') || 
            msg.includes('unauthorized') || 
            msg.includes('email')
        );
    });

    it('TC-WEB-003 | Doctor login fails with invalid domain (e.g., gmail.com)', async () => {
        logger.info('Executing TC-WEB-003');
        await AuthPage.login('surendra.lmt@gmail.com', 'surendra123');
        
        const errorText = await AuthPage.getErrorMessage();
        expect(errorText.length).to.be.greaterThan(0);
    });

    it('TC-WEB-004 | Doctor login is prevented when email field is empty', async () => {
        logger.info('Executing TC-WEB-004');
        await AuthPage.login('', 'surendra123');
        
        // HTML5 validation will likely prevent submission, meaning URL stays the same
        // and no specific app error message might be shown, but URL must remain on auth
        const currentUrl = await browser.getUrl();
        expect(currentUrl).to.include('/auth');
    });

    it('TC-WEB-005 | Doctor login fails when email contains leading spaces', async () => {
        logger.info('Executing TC-WEB-005');
        const { email, password } = credentials.users.doctor.valid;
        await AuthPage.login(`   ${email}`, password);
        
        const errorText = await AuthPage.getErrorMessage();
        expect(errorText.length).to.be.greaterThan(0);
    });

    it('TC-WEB-006 | Doctor login fails when email contains trailing spaces', async () => {
        logger.info('Executing TC-WEB-006');
        const { email, password } = credentials.users.doctor.valid;
        await AuthPage.login(`${email}   `, password);
        
        const errorText = await AuthPage.getErrorMessage();
        expect(errorText.length).to.be.greaterThan(0);
    });

    it('TC-WEB-007 | Doctor login fails with excessively long email input', async () => {
        logger.info('Executing TC-WEB-007');
        const longEmail = 'a'.repeat(250) + '.lmt@prophydent.com';
        await AuthPage.login(longEmail, 'password123');
        
        const isErrorDisplayed = await AuthPage.isErrorDisplayed();
        expect(isErrorDisplayed).to.be.true;
    });

    it('TC-WEB-008 | Doctor login fails when email contains invalid unicode characters', async () => {
        logger.info('Executing TC-WEB-008');
        await AuthPage.login('surendra.lmt😎@prophydent.com', 'password123');
        
        const currentUrl = await browser.getUrl();
        expect(currentUrl).to.include('/auth');
    });

    // ----------------------------------------------------------------------
    // NEGATIVE SCENARIOS - PASSWORD VALIDATION
    // ----------------------------------------------------------------------

    it('TC-WEB-009 | Doctor login is prevented when password field is empty', async () => {
        logger.info('Executing TC-WEB-009');
        const { email } = credentials.users.doctor.valid;
        await AuthPage.login(email, '');
        
        const currentUrl = await browser.getUrl();
        expect(currentUrl).to.include('/auth');
    });

    it('TC-WEB-010 | Doctor login fails with incorrect password', async () => {
        logger.info('Executing TC-WEB-010');
        const { email } = credentials.users.doctor.valid;
        await AuthPage.login(email, 'IncorrectPassword99!');
        
        const errorText = await AuthPage.getErrorMessage();
        expect(errorText.toLowerCase()).to.include('invalid login credentials');
    });

    it('TC-WEB-011 | Doctor login fails with password containing only spaces', async () => {
        logger.info('Executing TC-WEB-011');
        const { email } = credentials.users.doctor.valid;
        await AuthPage.login(email, '        ');
        
        const errorText = await AuthPage.getErrorMessage();
        expect(errorText.toLowerCase()).to.include('invalid login credentials');
    });

    // ----------------------------------------------------------------------
    // UI & STATE VALIDATION
    // ----------------------------------------------------------------------

    it('TC-WEB-012 | Password field masks characters during input', async () => {
        logger.info('Executing TC-WEB-012');
        const inputType = await AuthPage.inputPassword.getAttribute('type');
        expect(inputType).to.equal('password');
    });

    it('TC-WEB-013 | Doctor login page displays correct clinical portal role indicator', async () => {
        logger.info('Executing TC-WEB-013');
        const roleText = await AuthPage.roleLabel.getText();
        expect(roleText).to.include('Clinical Portal');
    });

    it('TC-WEB-014 | Doctor login page allows toggling to registration form', async () => {
        logger.info('Executing TC-WEB-014');
        await AuthPage.toggleAuthMode();
        
        const headerText = await AuthPage.heading.getText();
        expect(headerText).to.include('Create an Account');
        
        // Verify signup specific fields appear
        expect(await AuthPage.inputFullName.isDisplayed()).to.be.true;
    });

    it('TC-WEB-015 | Doctor login form clears error message upon toggling forms', async () => {
        logger.info('Executing TC-WEB-015');
        // Trigger error
        await AuthPage.login('bad@example.com', 'badpass');
        await AuthPage.getErrorMessage(); // wait for it
        
        // Toggle
        await AuthPage.toggleAuthMode();
        
        // Verify error is gone
        const isErrorDisplayed = await AuthPage.errorMessage.isDisplayed();
        expect(isErrorDisplayed).to.be.false;
    });

    it('TC-WEB-016 | Back button safely navigates away from doctor login to role selection', async () => {
        logger.info('Executing TC-WEB-016');
        await AuthPage.clickElement(AuthPage.backBtn);
        
        const currentUrl = await browser.getUrl();
        expect(currentUrl).to.include('/role');
    });
});
