const BaseMobilePage = require('./BaseMobilePage');
const logger = require('../../utils/Logger');

class MobileAuthPage extends BaseMobilePage {
    // ----------------------------------------------------------------------
    // Selectors (identical to web selectors, resolving in WebView context)
    // ----------------------------------------------------------------------
    get container() { return $('.auth-container'); }
    get heading() { return $('.auth-header h2'); }
    get roleLabel() { return $('.auth-header .text-muted'); }
    get backBtn() { return $('.back-btn'); }
    
    get inputEmail() { return $('input[type="email"]'); }
    get inputPassword() { return $('input[type="password"]'); }
    get inputFullName() { return $('input[placeholder*="Doe"]'); }
    get inputMobile() { return $('input[type="tel"]'); }
    get inputAddress() { return $('input[placeholder*="Clinical"]'); }
    get selectGender() { return $('select'); }
    get inputAvatar() { return $('input#avatarUpload'); }

    get btnSubmit() { return $('button[type="submit"]'); }
    get linkToggleMode() { return $('.text-link'); }
    get errorMessage() { return $('.error-message'); }

    // ----------------------------------------------------------------------
    // Methods
    // ----------------------------------------------------------------------

    /**
     * Authenticates the user in the mobile WebView
     */
    async login(email, password) {
        logger.info(`Appium: Typing email: ${email}`);
        await this.typeText(this.inputEmail, email);
        
        logger.info(`Appium: Typing password`);
        await this.typeText(this.inputPassword, password);
        
        logger.info('Appium: Tapping Sign In');
        await this.clickElement(this.btnSubmit);
    }

    /**
     * Toggles between signup and login screens
     */
    async toggleAuthMode() {
        logger.info('Appium: Tapping Toggle Mode link');
        await this.clickElement(this.linkToggleMode);
    }

    /**
     * Fills out registration details
     */
    async fillSignupForm({ fullName, mobile, address, gender, email, password }) {
        logger.info('Appium: Filling mobile signup form details');
        if (fullName) await this.typeText(this.inputFullName, fullName);
        if (mobile) await this.typeText(this.inputMobile, mobile);
        if (address) await this.typeText(this.inputAddress, address);
        
        if (gender) {
            await this.selectGender.selectByAttribute('value', gender);
        }
        
        if (email) await this.typeText(this.inputEmail, email);
        if (password) await this.typeText(this.inputPassword, password);
    }
}

module.exports = new MobileAuthPage();
