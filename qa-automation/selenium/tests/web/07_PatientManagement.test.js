const { expect } = require('chai');
const AuthPage = require('../../src/pages/AuthPage');
const PatientManagementPage = require('../../src/pages/PatientManagementPage');
const NavigationPage = require('../../src/pages/NavigationPage');
const credentials = require('../../test-data/credentials.json');
const logger = require('../../src/utils/Logger');

describe('Patient Management Module', function () {
    this.timeout(120000);

    before(async () => {
        await browser.deleteCookies();
        await AuthPage.open('doctor');
        const { email, password } = credentials.users.doctor.valid;
        await AuthPage.login(email, password);
        await browser.waitUntil(async () => (await browser.getUrl()).includes('dashboard'), { timeout: 10000 });
    });

    beforeEach(async () => {
        await PatientManagementPage.open();
    });

    // ----------------------------------------------------------------------
    // UI & LAYOUT SCENARIOS
    // ----------------------------------------------------------------------

    it('TC-WEB-101 | Patient Management page loads successfully with View tab active', async () => {
        logger.info('Executing TC-WEB-101');
        const header = await PatientManagementPage.pageHeader.getText();
        expect(header).to.equal('Patient Management');
        
        const isViewActive = await PatientManagementPage.tabViewPatients.getAttribute('class');
        expect(isViewActive).to.include('active');
    });

    it('TC-WEB-102 | Add Patient tab toggles correctly to show registration form', async () => {
        logger.info('Executing TC-WEB-102');
        await PatientManagementPage.switchToAddPatient();
        
        const isFullNameVisible = await PatientManagementPage.inputFullName.isDisplayed();
        expect(isFullNameVisible).to.be.true;
        
        const isAddActive = await PatientManagementPage.tabAddPatient.getAttribute('class');
        expect(isAddActive).to.include('active');
    });

    // ----------------------------------------------------------------------
    // POSITIVE SCENARIOS - CREATE PATIENT
    // ----------------------------------------------------------------------

    it('TC-WEB-103 | Doctor can successfully create a new patient with all fields', async () => {
        logger.info('Executing TC-WEB-103');
        await PatientManagementPage.switchToAddPatient();
        
        const uniqueName = `Test Patient ${Date.now()}`;
        
        await PatientManagementPage.createPatient({
            fullName: uniqueName,
            dob: '1990-01-01',
            email: 'test@example.com',
            phone: '5551234567',
            history: 'No known allergies.'
        });
        
        // Should automatically route back to view tab on success
        await browser.waitUntil(async () => {
            const classAttr = await PatientManagementPage.tabViewPatients.getAttribute('class');
            return classAttr.includes('active');
        }, { timeout: 10000, timeoutMsg: 'Failed to return to View Patients tab after save' });
        
        const isViewActive = await PatientManagementPage.tabViewPatients.getAttribute('class');
        expect(isViewActive).to.include('active');
    });

    it('TC-WEB-104 | Doctor can successfully create a new patient with only mandatory fields', async () => {
        logger.info('Executing TC-WEB-104');
        await PatientManagementPage.switchToAddPatient();
        
        const uniqueName = `Mandatory Patient ${Date.now()}`;
        
        await PatientManagementPage.createPatient({
            fullName: uniqueName,
            dob: '1985-05-15'
        }); // Leaving email, phone, history blank
        
        await browser.waitUntil(async () => {
            const classAttr = await PatientManagementPage.tabViewPatients.getAttribute('class');
            return classAttr.includes('active');
        }, { timeout: 10000 });
        
        const isViewActive = await PatientManagementPage.tabViewPatients.getAttribute('class');
        expect(isViewActive).to.include('active');
    });

    // ----------------------------------------------------------------------
    // NEGATIVE SCENARIOS - FORM VALIDATION
    // ----------------------------------------------------------------------

    it('TC-WEB-105 | Form submission fails if mandatory Full Name is missing', async () => {
        logger.info('Executing TC-WEB-105');
        await PatientManagementPage.switchToAddPatient();
        
        await PatientManagementPage.createPatient({
            fullName: '',
            dob: '1990-01-01'
        });
        
        // HTML5 Validation will prevent submission, so we remain on the Add tab
        const isAddActive = await PatientManagementPage.tabAddPatient.getAttribute('class');
        expect(isAddActive).to.include('active');
    });

    it('TC-WEB-106 | Form submission fails if mandatory DOB is missing', async () => {
        logger.info('Executing TC-WEB-106');
        await PatientManagementPage.switchToAddPatient();
        
        await PatientManagementPage.createPatient({
            fullName: 'No DOB Patient',
            dob: ''
        });
        
        const isAddActive = await PatientManagementPage.tabAddPatient.getAttribute('class');
        expect(isAddActive).to.include('active');
    });

    // ----------------------------------------------------------------------
    // PATIENT LIST & SEARCH
    // ----------------------------------------------------------------------

    it('TC-WEB-107 | Patient list correctly filters by Full Name', async () => {
        logger.info('Executing TC-WEB-107');
        // Pre-req: Make sure at least one patient exists
        await PatientManagementPage.switchToAddPatient();
        const searchName = `SearchTarget_${Date.now()}`;
        await PatientManagementPage.createPatient({ fullName: searchName, dob: '2000-01-01' });
        await browser.pause(2000); // Wait for list to update via useEffect
        
        await PatientManagementPage.searchPatient(searchName);
        
        const rows = await PatientManagementPage.patientRows;
        expect(rows.length).to.equal(1);
        
        const cellText = await rows[0].$('.font-medium').getText();
        expect(cellText).to.equal(searchName);
    });
});
