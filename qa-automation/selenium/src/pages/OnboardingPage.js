const BasePage = require('./BasePage');
const logger = require('../utils/Logger');

class OnboardingPage extends BasePage {
    // ----------------------------------------------------------------------
    // Selectors
    // ----------------------------------------------------------------------
    // Splash Page
    get splashScreen() { return $('.splash-screen'); }
    get splashLogo() { return $('.splash-logo'); }
    get splashTitle() { return $('.splash-title'); }
    get loadingSpinner() { return $('.loading-spinner'); }

    // Welcome Page
    get welcomeContent() { return $('.welcome-content'); }
    get welcomeTitle() { return $('.welcome-content h1'); }
    get btnGetStarted() { return $('.welcome-content button.btn-primary'); }

    // Role Selection Page
    get roleContent() { return $('.role-content'); }
    get cardDoctorRole() { return $('.role-cards .role-card:nth-child(1)'); }
    get cardPatientRole() { return $('.role-cards .role-card:nth-child(2)'); }

    // ----------------------------------------------------------------------
    // Methods
    // ----------------------------------------------------------------------

    /**
     * Navigates directly to the entry splash screen
     */
    async open() {
        logger.info('Navigating to Welcome Page');
        await super.open('welcome');
    }

    /**
     * Wait for splash screen to redirect to welcome page
     */
    async waitForWelcomePage() {
        logger.info('Waiting for Welcome page to display');
        await this.waitForElement(this.welcomeContent, 10000);
    }

    /**
     * Click Get Started on Welcome screen
     */
    async clickGetStarted() {
        logger.info('Clicking Get Started button');
        await this.clickElement(this.btnGetStarted);
        await this.waitForElement(this.roleContent, 5000);
    }

    /**
     * Select doctor role on Role Selection page
     */
    async selectDoctorRole() {
        logger.info('Selecting Doctor role');
        await this.clickElement(this.cardDoctorRole);
    }

    /**
     * Select patient role on Role Selection page
     */
    async selectPatientRole() {
        logger.info('Selecting Patient role');
        await this.clickElement(this.cardPatientRole);
    }
}

module.exports = new OnboardingPage();
