const BaseMobilePage = require('./BaseMobilePage');
const logger = require('../../utils/Logger');

class MobileSettingsPage extends BaseMobilePage {
    // ----------------------------------------------------------------------
    // Selectors
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
    get toggleDarkMode() { return $('.toggle-switch input'); }
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
    async updateProfile({ fullName, mobile, gender, address }) {
        logger.info('Appium: Updating user profile settings');
        if (fullName) await this.typeText(this.inputFullName, fullName);
        if (mobile) await this.typeText(this.inputMobile, mobile);
        if (gender) await this.selectGender.selectByAttribute('value', gender);
        if (address) await this.typeText(this.inputAddress, address);
        await this.clickElement(this.btnSaveProfile);
    }
}

module.exports = new MobileSettingsPage();
