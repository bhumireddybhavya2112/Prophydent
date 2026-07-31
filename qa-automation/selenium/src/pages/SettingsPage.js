const BasePage = require('./BasePage');
const logger = require('../utils/Logger');

class SettingsPage extends BasePage {
    // ----------------------------------------------------------------------
    // Selectors (XPath used for form label precision)
    // ----------------------------------------------------------------------
    get pageTitle() { return $('.page-title'); }
    
    // Profile Section
    get inputFullName() { return $('//label[text()="Full Name"]/following-sibling::input'); }
    get inputEmail() { return $('//label[text()="Email Address"]/following-sibling::input'); }
    get inputMobile() { return $('//label[text()="Mobile Number"]/following-sibling::input'); }
    get selectGender() { return $('//label[text()="Gender"]/following-sibling::select'); }
    get inputAddress() { return $('//label[text()="Address"]/following-sibling::input'); }
    get btnSaveProfile() { return $('button*=Save Profile Changes'); }
    
    // Appearance Section
    get toggleDarkMode() { return $('.toggle-switch'); }
    get currentThemeElement() { return $('html'); }

    // Security Section
    get inputNewPassword() { return $('input[placeholder="Enter new password"]'); }
    get inputConfirmPassword() { return $('input[placeholder="Re-enter new password"]'); }
    get btnUpdatePassword() { return $('button*=Update Password'); }

    // Sign Out Section
    get btnSignOut() { return $('button=Sign Out'); }

    // Messages
    get alertSuccess() { return $('.alert-success'); }
    get alertError() { return $('.alert-error'); }

    // ----------------------------------------------------------------------
    // Methods
    // ----------------------------------------------------------------------

    /**
     * Navigates directly to settings view (requires auth session)
     */
    async open() {
        logger.info('Navigating to Settings Page');
        await super.open('settings');
        await this.waitForElement(this.pageTitle);
    }

    /**
     * Updates the user profile details
     */
    async updateProfile({ fullName, mobile, gender, address }) {
        logger.info('Updating user profile information');
        if (fullName) await this.typeText(this.inputFullName, fullName);
        if (mobile) await this.typeText(this.inputMobile, mobile);
        if (gender) await this.selectGender.selectByAttribute('value', gender);
        if (address) await this.typeText(this.inputAddress, address);
        await this.clickElement(this.btnSaveProfile);
    }

    /**
     * Updates the password
     */
    async updatePassword(newPassword, confirmPassword) {
        logger.info('Updating user password');
        await this.typeText(this.inputNewPassword, newPassword);
        await this.typeText(this.inputConfirmPassword, confirmPassword);
        await this.clickElement(this.btnUpdatePassword);
    }

    /**
     * Switches dark mode toggle state
     */
    async toggleTheme() {
        logger.info('Toggling theme settings');
        await this.clickElement(this.toggleDarkMode);
    }

    /**
     * Signs out from settings page
     */
    async signOut() {
        logger.info('Performing sign out from settings page');
        await this.clickElement(this.btnSignOut);
    }
}

module.exports = new SettingsPage();
