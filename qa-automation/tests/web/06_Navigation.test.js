const { expect } = require('chai');
const AuthPage = require('../../../src/pages/AuthPage');
const NavigationPage = require('../../../src/pages/NavigationPage');
const credentials = require('../../../test-data/credentials.json');
const logger = require('../../../src/utils/Logger');

describe('Navigation Module - Core Routing & Layout', function () {
    this.timeout(90000);

    describe('Doctor Navigation Profile', () => {
        before(async () => {
            await browser.deleteCookies();
            await AuthPage.open('doctor');
            const { email, password } = credentials.users.doctor.valid;
            await AuthPage.login(email, password);
            await browser.waitUntil(async () => (await browser.getUrl()).includes('dashboard'), { timeout: 10000 });
        });

        it('TC-WEB-060 | Doctor sidebar contains all correct role-based modules', async () => {
            logger.info('Executing TC-WEB-060');
            expect(await NavigationPage.isNavPresent('Dashboard')).to.be.true;
            expect(await NavigationPage.isNavPresent('Patients')).to.be.true;
            expect(await NavigationPage.isNavPresent('Scans')).to.be.true;
            expect(await NavigationPage.isNavPresent('Reports')).to.be.true;
            expect(await NavigationPage.isNavPresent('Settings')).to.be.true;
        });

        it('TC-WEB-061 | Doctor profile widget correctly displays name and role', async () => {
            logger.info('Executing TC-WEB-061');
            const roleText = await NavigationPage.userRole.getText();
            expect(roleText.toLowerCase()).to.equal('dentist'); // Mapped from 'doctor' metadata
            
            const name = await NavigationPage.userName.getText();
            expect(name.length).to.be.greaterThan(0);
        });

        it('TC-WEB-062 | Doctor can navigate to Patients view via sidebar', async () => {
            logger.info('Executing TC-WEB-062');
            await NavigationPage.clickNav('Patients');
            const currentUrl = await browser.getUrl();
            expect(currentUrl).to.include('/patients');
        });

        it('TC-WEB-063 | Doctor can sign out successfully from sidebar footer', async () => {
            logger.info('Executing TC-WEB-063');
            await NavigationPage.signOut();
            await browser.waitUntil(async () => (await browser.getUrl()).includes('/welcome'), { timeout: 10000 });
            const currentUrl = await browser.getUrl();
            expect(currentUrl).to.include('/welcome');
        });
    });

    describe('Patient Navigation Profile', () => {
        before(async () => {
            await browser.deleteCookies();
            await AuthPage.open('patient');
            const { email, password } = credentials.users.patient.valid;
            await AuthPage.login(email, password);
            await browser.waitUntil(async () => (await browser.getUrl()).includes('dashboard'), { timeout: 10000 });
        });

        it('TC-WEB-064 | Patient sidebar hides restricted modules (Patients management)', async () => {
            logger.info('Executing TC-WEB-064');
            expect(await NavigationPage.isNavPresent('Patients')).to.be.false; // Patient should not see 'Patients' module
        });

        it('TC-WEB-065 | Patient sidebar contains patient-specific module terminology', async () => {
            logger.info('Executing TC-WEB-065');
            // Patient view maps 'Scans' -> 'My Scans' and 'Reports' -> 'My Reports'
            expect(await NavigationPage.isNavPresent('My Scans')).to.be.true;
            expect(await NavigationPage.isNavPresent('My Reports')).to.be.true;
        });

        it('TC-WEB-066 | Patient profile widget correctly displays Patient role', async () => {
            logger.info('Executing TC-WEB-066');
            const roleText = await NavigationPage.userRole.getText();
            expect(roleText.toLowerCase()).to.equal('patient');
        });
        
        it('TC-WEB-067 | Patient can navigate to My Scans view via sidebar', async () => {
            logger.info('Executing TC-WEB-067');
            await NavigationPage.clickNav('My Scans');
            const currentUrl = await browser.getUrl();
            expect(currentUrl).to.include('/analysis');
        });
    });
});
