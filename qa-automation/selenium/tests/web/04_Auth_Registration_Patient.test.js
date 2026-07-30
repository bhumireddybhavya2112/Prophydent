const { expect } = require('chai');
const AuthPage = require('../../src/pages/AuthPage');
const logger = require('../../src/utils/Logger');

describe('Authentication - Patient Registration', function () {
    this.timeout(90000);

    beforeEach(async () => {
        await browser.deleteCookies();
        await AuthPage.open('patient');
        await AuthPage.toggleAuthMode();
    });

    // ----------------------------------------------------------------------
    // POSITIVE SCENARIOS
    // ----------------------------------------------------------------------

    it('TC-WEB-032 | Patient registration succeeds with valid Gmail address and all fields', async () => {
        logger.info('Executing TC-WEB-032');
        const uniqueEmail = `test.patient.${Date.now()}@gmail.com`;
        
        await AuthPage.fillSignupForm({
            fullName: 'Jane Doe',
            mobile: '+15559876543',
            address: '456 Patient Ave',
            gender: 'female',
            email: uniqueEmail,
            password: 'StrongPassword123!'
        });
        
        await AuthPage.submitSignup();
        
        try {
            await browser.waitUntil(async () => {
                const url = await browser.getUrl();
                const errorDisplayed = await AuthPage.isErrorDisplayed();
                return url.includes('dashboard') || errorDisplayed;
            }, { timeout: 15000 });
            
            const currentUrl = await browser.getUrl();
            if (!currentUrl.includes('dashboard')) {
                const msg = await AuthPage.getErrorMessage();
                expect(msg.toLowerCase()).to.include('successful');
            }
        } catch (e) {
            throw new Error('Registration timed out or failed unexpectedly');
        }
    });

    // ----------------------------------------------------------------------
    // NEGATIVE SCENARIOS
    // ----------------------------------------------------------------------

    it('TC-WEB-033 | Patient registration prevents submission if mandatory fields are empty', async () => {
        logger.info('Executing TC-WEB-033');
        await AuthPage.fillSignupForm({
            fullName: '',
            mobile: '',
            address: '',
            gender: 'female',
            email: '',
            password: ''
        });
        
        await AuthPage.submitSignup();
        const currentUrl = await browser.getUrl();
        expect(currentUrl).to.include('/auth');
    });

    it('TC-WEB-034 | Patient registration fails when email is already registered', async () => {
        logger.info('Executing TC-WEB-034');
        const credentials = require('../../test-data/credentials.json');
        
        await AuthPage.fillSignupForm({
            fullName: 'Duplicate Patient',
            mobile: '+15551112222',
            address: 'Duplicate St',
            gender: 'male',
            email: credentials.users.patient.valid.email,
            password: 'Password123!'
        });
        
        await AuthPage.submitSignup();
        const errorText = await AuthPage.getErrorMessage();
        expect(errorText.toLowerCase()).to.satisfy(msg => 
            msg.includes('already registered') || 
            msg.includes('user already exists')
        );
    });

    it('TC-WEB-035 | Registration form displays gender dropdown with expected options', async () => {
        logger.info('Executing TC-WEB-035');
        const options = await AuthPage.selectGender.$$('option');
        const values = await Promise.all(options.map(opt => opt.getAttribute('value')));
        
        expect(values).to.include.members(['male', 'female', 'other', 'prefer_not_to_say']);
    });
});
