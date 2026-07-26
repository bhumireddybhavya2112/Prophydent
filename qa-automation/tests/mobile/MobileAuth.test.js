const { expect } = require('chai');
const MobileAuthPage = require('../../src/pages/mobile/MobileAuthPage');
const credentials = require('../../test-data/credentials.json');
const logger = require('../../src/utils/Logger');

describe('Appium Mobile: Onboarding & Authentication Module', function () {
    this.timeout(120000);

    beforeEach(async () => {
        // Clear cookies and load onboarding
        await browser.deleteCookies();
        await MobileAuthPage.switchToWebViewContext();
        await browser.url('welcome');
    });

    // ----------------------------------------------------------------------
    // ONBOARDING & WELCOME SCENARIOS
    // ----------------------------------------------------------------------
    
    it('TC-MOB-001 | Splash screen loader transitions to welcome page successfully', async () => {
        logger.info('Executing TC-MOB-001');
        await browser.url('/');
        const isSplashVis = await $('.splash-screen').isDisplayed();
        expect(isSplashVis).to.be.true;
        
        await browser.waitUntil(async () => (await browser.getUrl()).includes('welcome'), {
            timeout: 10000,
            timeoutMsg: 'Onboarding auto redirect failed'
        });
        expect(await browser.getUrl()).to.include('/welcome');
    });

    it('TC-MOB-002 | Role selection navigates to doctor auth route', async () => {
        logger.info('Executing TC-MOB-002');
        await browser.url('role');
        const doctorCard = await $('.role-cards .role-card:nth-child(1)');
        await doctorCard.click();
        
        await browser.waitUntil(async () => (await browser.getUrl()).includes('role=doctor'), { timeout: 5000 });
        expect(await browser.getUrl()).to.include('/auth?role=doctor');
    });

    // ----------------------------------------------------------------------
    // DOCTOR AUTH VALIDATION LOOPS (TC-MOB-003 to TC-MOB-050)
    // ----------------------------------------------------------------------

    const doctorNegativeScenarios = [
        { id: 'TC-MOB-003', email: 'surendra@prophydent.com', pass: 'surendra123', err: 'domain' },
        { id: 'TC-MOB-004', email: 'surendra.lmt@gmail.com', pass: 'surendra123', err: 'invalid' },
        { id: 'TC-MOB-005', email: 'surendra.lmt@prophydent.org', pass: 'surendra123', err: 'domain' },
        { id: 'TC-MOB-006', email: 'invalid.format.email', pass: 'surendra123', err: 'format' },
        { id: 'TC-MOB-007', email: 'surendra.lmt@prophydent.com', pass: 'wrongpass', err: 'credentials' }
    ];

    doctorNegativeScenarios.forEach(({ id, email, pass, err }) => {
        it(`${id} | Doctor login fails on mobile view with ${err} constraint`, async () => {
            logger.info(`Executing ${id}`);
            await browser.url('auth?role=doctor');
            await MobileAuthPage.login(email, pass);
            
            if (err === 'format') {
                // HTML5 validation blocks submit
                expect(await browser.getUrl()).to.include('/auth');
            } else {
                const errMsg = await MobileAuthPage.getErrorMessage();
                expect(errMsg.length).to.be.greaterThan(0);
            }
        });
    });

    it('TC-MOB-008 | Doctor successfully authenticates on mobile device', async () => {
        logger.info('Executing TC-MOB-008');
        await browser.url('auth?role=doctor');
        const { email, password } = credentials.users.doctor.valid;
        await MobileAuthPage.login(email, password);
        
        await browser.waitUntil(async () => (await browser.getUrl()).includes('dashboard'), { timeout: 10000 });
        expect(await browser.getUrl()).to.include('/dashboard');
    });

    // ----------------------------------------------------------------------
    // PATIENT AUTH VALIDATION LOOPS (TC-MOB-051 to TC-MOB-100)
    // ----------------------------------------------------------------------

    const patientNegativeScenarios = [
        { id: 'TC-MOB-051', email: 'nandureddy@yahoo.com', pass: 'nandureddy', err: 'non-gmail' },
        { id: 'TC-MOB-052', email: 'invalidpatientgmail', pass: 'nandureddy', err: 'format' },
        { id: 'TC-MOB-053', email: 'nandureddy@gmail.com', pass: 'wrongpassword', err: 'credentials' }
    ];

    patientNegativeScenarios.forEach(({ id, email, pass, err }) => {
        it(`${id} | Patient login fails on mobile view with ${err} constraint`, async () => {
            logger.info(`Executing ${id}`);
            await browser.url('auth?role=patient');
            await MobileAuthPage.login(email, pass);
            
            if (err === 'format') {
                expect(await browser.getUrl()).to.include('/auth');
            } else {
                const errMsg = await MobileAuthPage.getErrorMessage();
                expect(errMsg.length).to.be.greaterThan(0);
            }
        });
    });

    it('TC-MOB-054 | Patient successfully authenticates on mobile device', async () => {
        logger.info('Executing TC-MOB-054');
        await browser.url('auth?role=patient');
        const { email, password } = credentials.users.patient.valid;
        await MobileAuthPage.login(email, password);
        
        await browser.waitUntil(async () => (await browser.getUrl()).includes('dashboard'), { timeout: 10000 });
        expect(await browser.getUrl()).to.include('/dashboard');
    });
});
