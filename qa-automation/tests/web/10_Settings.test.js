const { expect } = require('chai');
const AuthPage = require('../../../src/pages/AuthPage');
const SettingsPage = require('../../../src/pages/SettingsPage');
const credentials = require('../../../test-data/credentials.json');
const logger = require('../../../src/utils/Logger');

describe('Settings & Preferences Module', function () {
    this.timeout(120000);

    before(async () => {
        await browser.deleteCookies();
        await AuthPage.open('doctor');
        const { email, password } = credentials.users.doctor.valid;
        await AuthPage.login(email, password);
        await browser.waitUntil(async () => (await browser.getUrl()).includes('dashboard'), { timeout: 10000 });
    });

    beforeEach(async () => {
        await SettingsPage.open();
    });

    // ----------------------------------------------------------------------
    // PROFILE MANAGEMENT
    // ----------------------------------------------------------------------

    it('TC-WEB-280 | Settings page initializes with current user details', async () => {
        logger.info('Executing TC-WEB-280');
        const emailVal = await SettingsPage.inputEmail.getValue();
        expect(emailVal).to.equal(credentials.users.doctor.valid.email);
        
        const fullNameVal = await SettingsPage.inputFullName.getValue();
        expect(fullNameVal.length).to.be.greaterThan(0);
    });

    it('TC-WEB-281 | Updating profile settings updates value state and shows confirmation alert', async () => {
        logger.info('Executing TC-WEB-281');
        const uniqueName = `Dr. Active ${Date.now()}`;
        
        await SettingsPage.updateProfile({
            fullName: uniqueName,
            mobile: '+15559876543',
            gender: 'female',
            address: '789 Updated Clinical Way'
        });
        
        // Wait for profile updated confirmation banner
        await SettingsPage.alertSuccess.waitForDisplayed({ timeout: 10000 });
        const successText = await SettingsPage.alertSuccess.getText();
        expect(successText.toLowerCase()).to.include('success');
    });

    // ----------------------------------------------------------------------
    // APPEARANCE & THEME TOGGLE
    // ----------------------------------------------------------------------

    it('TC-WEB-282 | Toggling dark mode checkbox updates data-theme attribute on document root', async () => {
        logger.info('Executing TC-WEB-282');
        
        // Check current theme
        const initialTheme = await SettingsPage.currentThemeElement.getAttribute('data-theme');
        
        // Click theme toggle switch
        await SettingsPage.toggleTheme();
        await browser.pause(500); // Allow theme transition state
        
        const toggledTheme = await SettingsPage.currentThemeElement.getAttribute('data-theme');
        expect(toggledTheme).to.not.equal(initialTheme);
        
        // Toggle back to clean state
        await SettingsPage.toggleTheme();
    });

    // ----------------------------------------------------------------------
    // ACCOUNT SECURITY / PASSWORD
    // ----------------------------------------------------------------------

    it('TC-WEB-283 | Attempting to update password with non-matching inputs displays error alert', async () => {
        logger.info('Executing TC-WEB-283');
        await SettingsPage.updatePassword('NewPassVal123!', 'MismatchedPassVal123!');
        
        await SettingsPage.alertError.waitForDisplayed({ timeout: 5000 });
        const errorText = await SettingsPage.alertError.getText();
        expect(errorText.toLowerCase()).to.include('match');
    });

    it('TC-WEB-284 | Attempting to update password with too-short input displays validation warning', async () => {
        logger.info('Executing TC-WEB-284');
        await SettingsPage.updatePassword('123', '123');
        
        await SettingsPage.alertError.waitForDisplayed({ timeout: 5000 });
        const errorText = await SettingsPage.alertError.getText();
        expect(errorText.toLowerCase()).to.satisfy(msg => 
            msg.includes('least 6') || 
            msg.includes('short')
        );
    });

    // ----------------------------------------------------------------------
    // LOGOUT & SESSION FLOW
    // ----------------------------------------------------------------------

    it('TC-WEB-285 | Clicking sign out on Settings page terminates active session', async () => {
        logger.info('Executing TC-WEB-285');
        await SettingsPage.signOut();
        
        await browser.waitUntil(async () => (await browser.getUrl()).includes('/welcome'), {
            timeout: 10000,
            timeoutMsg: 'Expected routing back to welcome page after session termination'
        });
        
        const currentUrl = await browser.getUrl();
        expect(currentUrl).to.include('/welcome');
    });
});
