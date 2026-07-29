const BasePage = require('./BasePage');
const logger = require('../utils/Logger');

class AuthPage extends BasePage {
    // ----------------------------------------------------------------------
    // Selectors
    // ----------------------------------------------------------------------
    get container() { return $('.auth-container'); }
    get heading() { return $('.auth-header h2'); }
    get roleLabel() { return $('.auth-header .text-muted'); }
    get backBtn() { return $('.back-btn'); }
    
    // Form Inputs
    get inputEmail() { return $('input[type="email"]'); }
    get inputPassword() { return $('input[type="password"]'); }
    get inputFullName() { return $('input[type="text"][placeholder*="Doe"]'); }
    get inputMobile() { return $('input[type="tel"]'); }
    get inputAddress() { return $('input[placeholder*="Clinical"]'); }
    get selectGender() { return $('select'); }
    get inputAvatar() { return $('input#avatarUpload'); }

    // Actions & Messaging
    get btnSubmit() { return $('button[type="submit"]'); }
    get linkToggleMode() { return $('.text-link'); }
    get errorMessage() { return $('.error-message'); }

    // ----------------------------------------------------------------------
    // Methods
    // ----------------------------------------------------------------------

    /**
     * Opens the Auth page for a given role
     * @param {string} role 'doctor' or 'patient'
     */
    async open(role = 'doctor') {
        logger.info(`Opening Auth Page for role: ${role}`);
        await super.open(`auth?role=${role}`);
        await this.waitForElement(this.container);
    }

    /**
     * Toggles between Login and Signup modes
     */
    async toggleAuthMode() {
        logger.info('Toggling Authentication mode (Login <-> Signup)');
        await this.clickElement(this.linkToggleMode);
    }

    /**
     * Performs a standard login
     * @param {string} email
     * @param {string} password
     */
    async login(email, password) {
        logger.info(`Performing login for email: ${email}`);
        await this.typeText(this.inputEmail, email);
        await this.typeText(this.inputPassword, password);
        await this.clickElement(this.btnSubmit);
    }

    /**
     * Fills out the signup form completely
     */
    async fillSignupForm({ fullName, mobile, address, gender, email, password }) {
        logger.info(`Filling signup form for: ${email}`);
        if (fullName) await this.typeText(this.inputFullName, fullName);
        if (mobile) await this.typeText(this.inputMobile, mobile);
        if (address) await this.typeText(this.inputAddress, address);
        
        if (gender) {
            await this.waitForElement(this.selectGender);
            await this.selectGender.selectByAttribute('value', gender);
        }
        
        if (email) await this.typeText(this.inputEmail, email);
        if (password) await this.typeText(this.inputPassword, password);
    }

    /**
     * Submits the signup form
     */
    async submitSignup() {
        logger.info('Submitting signup form');
        await this.clickElement(this.btnSubmit);
    }

    /**
     * Gets the current error message text
     */
    async getErrorMessage() {
        await this.waitForElement(this.errorMessage, 5000);
        return this.errorMessage.getText();
    }
    
    /**
     * Checks if error message is displayed
     */
    async isErrorDisplayed() {
        return this.errorMessage.isDisplayed();
    }
}

module.exports = new AuthPage();
