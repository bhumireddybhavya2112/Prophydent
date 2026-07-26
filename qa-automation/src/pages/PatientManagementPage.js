const BasePage = require('./BasePage');
const logger = require('../utils/Logger');

class PatientManagementPage extends BasePage {
    // ----------------------------------------------------------------------
    // Selectors
    // ----------------------------------------------------------------------
    get pageHeader() { return $('.page-header h1'); }
    get tabViewPatients() { return $('button*=View Patients'); }
    get tabAddPatient() { return $('button*=Add Patient'); }
    
    // View Tab
    get inputSearch() { return $('input[placeholder*="Search patients"]'); }
    get tablePatients() { return $('.patients-table'); }
    get patientRows() { return $$('.patients-table tbody tr'); }
    get emptyStateMessage() { return $('div=No patients found. Add a new patient to get started.'); }
    
    // Add Tab Form
    get inputFullName() { return $('input[name="full_name"]'); }
    get inputDob() { return $('input[name="dob"]'); }
    get inputEmail() { return $('input[name="email"]'); }
    get inputPhone() { return $('input[name="phone"]'); }
    get textareaHistory() { return $('textarea[name="medical_history"]'); }
    get btnSavePatient() { return $('button[type="submit"]'); }
    get btnCancel() { return $('button*=Cancel'); }
    
    get errorMessage() { return $('.error-message'); }

    // ----------------------------------------------------------------------
    // Methods
    // ----------------------------------------------------------------------

    /**
     * Navigates directly to patients (requires auth session)
     */
    async open() {
        logger.info('Navigating to Patient Management Page');
        await super.open('patients');
        await this.waitForElement(this.pageHeader);
    }

    /**
     * Switch to Add Patient Tab
     */
    async switchToAddPatient() {
        logger.info('Switching to Add Patient Tab');
        await this.clickElement(this.tabAddPatient);
        await this.waitForElement(this.inputFullName);
    }

    /**
     * Switch to View Patients Tab
     */
    async switchToViewPatients() {
        logger.info('Switching to View Patients Tab');
        await this.clickElement(this.tabViewPatients);
        // Wait for either the table or the empty state to appear
        await browser.waitUntil(async () => {
            const tableVis = await this.tablePatients.isDisplayed();
            const emptyVis = await this.emptyStateMessage.isDisplayed();
            return tableVis || emptyVis;
        }, { timeout: 10000 });
    }

    /**
     * Creates a new patient
     */
    async createPatient({ fullName, dob, email, phone, history }) {
        logger.info(`Creating patient: ${fullName}`);
        await this.typeText(this.inputFullName, fullName);
        await this.typeText(this.inputDob, dob);
        
        if (email) await this.typeText(this.inputEmail, email);
        if (phone) await this.typeText(this.inputPhone, phone);
        if (history) await this.typeText(this.textareaHistory, history);
        
        await this.clickElement(this.btnSavePatient);
    }

    /**
     * Search for a patient by term
     */
    async searchPatient(term) {
        logger.info(`Searching for patient: ${term}`);
        await this.typeText(this.inputSearch, term);
        // Wait briefly for filtering
        await browser.pause(500); 
    }
}

module.exports = new PatientManagementPage();
