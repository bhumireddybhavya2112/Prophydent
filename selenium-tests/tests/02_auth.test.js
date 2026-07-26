'use strict';

require('dotenv').config();
const { expect } = require('chai');
const DriverManager = require('../utils/driverManager');
const AuthPage = require('../pages/AuthPage');
const WaitHelpers = require('../utils/waitHelpers');
const logger = require('../utils/logger');
const config = require('../config/testConfig');

describe('02 - Authentication', function () {
  this.timeout(90000);
  let driver, authPage;

  before(async function () {
    driver   = await DriverManager.getDriver();
    authPage = new AuthPage(driver);
  });

  // ─── Doctor Portal – Login Mode ───────────────────────────────────────────
  describe('Auth Page – Doctor Portal (Login Mode)', function () {
    beforeEach(async function () {
      await authPage.open('doctor');
    });

    it('TC-028 | auth-container is visible for doctor role', async function () {
      expect(await authPage.isVisible()).to.be.true;
    });

    it('TC-029 | heading shows "Welcome Back" in login mode', async function () {
      expect(await authPage.getHeading()).to.include('Welcome Back');
    });

    it('TC-030 | role label shows "Clinical Portal" for doctor', async function () {
      expect(await authPage.getRoleLabel()).to.include('Clinical Portal');
    });

    it('TC-031 | email input is visible', async function () {
      expect(await authPage.isEmailInputVisible()).to.be.true;
    });

    it('TC-032 | password input is visible', async function () {
      expect(await authPage.isPasswordInputVisible()).to.be.true;
    });

    it('TC-033 | submit button text is "Sign In"', async function () {
      expect(await authPage.getSubmitButtonText()).to.include('Sign In');
    });

    it('TC-034 | toggle link text is "Sign up here"', async function () {
      expect(await authPage.getToggleLinkText()).to.include('Sign up here');
    });

    it('TC-035 | back button (ArrowLeft) is present', async function () {
      expect(await authPage.isPresent(authPage.locators.backBtn)).to.be.true;
    });

    it('TC-036 | logo image is present on auth page', async function () {
      expect(await authPage.isPresent(authPage.locators.logo)).to.be.true;
    });

    it('TC-037 | error message is hidden before any submission', async function () {
      expect(await authPage.isErrorVisible()).to.be.false;
    });

    it('TC-038 | entering invalid credentials shows error message', async function () {
      await authPage.login('bad@example.com', 'wrongpassword');
      expect((await authPage.waitForErrorMessage(10000)).length).to.be.greaterThan(0);
    });

    it('TC-039 | error message is visible after failed login', async function () {
      await authPage.open('doctor');
      await authPage.login('notexist@example.com', 'nopass12');
      expect((await authPage.waitForErrorMessage(10000)).length).to.be.greaterThan(0);
    });

    it('TC-040 | empty email shows browser validation (stays on /auth)', async function () {
      await authPage.clickSubmit();
      expect(await driver.getCurrentUrl()).to.include('/auth');
    });

    it('TC-041 | back button navigates to /role', async function () {
      await authPage.clickBack();
      expect(await driver.getCurrentUrl()).to.include('/role');
    });
  });

  // ─── Doctor Portal – Signup Mode ──────────────────────────────────────────
  // Each test opens a fresh page and toggles independently.
  // Removing shared beforeEach avoids state-bleed between tests.
  describe('Auth Page – Doctor Portal (Signup Mode)', function () {

    it('TC-042 | heading changes to "Create an Account" after toggle', async function () {
      await authPage.open('doctor');
      await authPage.toggleMode();
      expect(await authPage.getHeading()).to.include('Create an Account');
    });

    it('TC-043 | toggle link text changes to "Sign in here"', async function () {
      await authPage.open('doctor');
      await authPage.toggleMode();
      expect(await authPage.getToggleLinkText()).to.include('Sign in here');
    });

    it('TC-044 | submit button text is "Sign Up" in signup mode', async function () {
      await authPage.open('doctor');
      await authPage.toggleMode();
      expect(await authPage.getSubmitButtonText()).to.include('Sign Up');
    });

    it('TC-045 | avatar upload input exists in signup mode', async function () {
      await authPage.open('doctor');
      await authPage.toggleMode();
      expect(await authPage.isSignupFormVisible()).to.be.true;
    });

    it('TC-046 | full name input appears in signup mode', async function () {
      await authPage.open('doctor');
      await authPage.toggleMode();
      expect(await authPage.isPresent(authPage.locators.fullNameInput)).to.be.true;
    });

    it('TC-047 | mobile number input appears in signup mode', async function () {
      await authPage.open('doctor');
      await authPage.toggleMode();
      expect(await authPage.isPresent(authPage.locators.mobileInput)).to.be.true;
    });

    it('TC-048 | address input appears in signup mode', async function () {
      await authPage.open('doctor');
      await authPage.toggleMode();
      expect(await authPage.isPresent(authPage.locators.addressInput)).to.be.true;
    });

    it('TC-049 | gender select dropdown appears in signup mode', async function () {
      await authPage.open('doctor');
      await authPage.toggleMode();
      expect(await authPage.isPresent(authPage.locators.genderSelect)).to.be.true;
    });

    it('TC-050 | toggling back to login shows "Welcome Back" heading', async function () {
      await authPage.open('doctor');
      await authPage.toggleMode();   // → signup
      await authPage.toggleMode();   // → login
      expect(await authPage.getHeading()).to.include('Welcome Back');
    });

    it('TC-051 | doctor signup with non-prophydent.com email shows domain error', async function () {
      await authPage.open('doctor');
      await authPage.toggleMode();
      await authPage.setReactInputValue('input[placeholder*="Doe"]',      'Test Doctor');
      await authPage.setReactInputValue('input[type="tel"]',              '5551234567');
      await authPage.setReactInputValue('input[placeholder*="Clinical"]', '123 Test St');
      await authPage.enterEmail('notadoctor@gmail.com');
      await authPage.enterPassword('password123');
      await authPage.clickSubmit();
      const errMsg = await authPage.waitForErrorMessage(8000);
      expect(errMsg.toLowerCase()).to.include('unauthorized');
    });

    it('TC-051b | doctor signup with valid @prophydent.com email passes domain check', async function () {
      await authPage.open('doctor');
      await authPage.toggleMode();
      await authPage.setReactInputValue('input[placeholder*="Doe"]',      'Dr. Valid Test');
      await authPage.setReactInputValue('input[type="tel"]',              '5550000001');
      await authPage.setReactInputValue('input[placeholder*="Clinical"]', '1 Prophydent Ave');
      await authPage.enterEmail('example.lmt@prophydent.com');
      await authPage.enterPassword('validPass123');
      await authPage.clickSubmit();
      await WaitHelpers.sleep(4000);
      expect((await authPage.getErrorMessage()).toLowerCase()).to.not.include('unauthorized');
    });
  });

  // ─── Patient Portal ────────────────────────────────────────────────────────
  describe('Auth Page – Patient Portal', function () {
    beforeEach(async function () {
      await authPage.open('patient');
    });

    it('TC-052 | auth container visible for patient role', async function () {
      expect(await authPage.isVisible()).to.be.true;
    });

    it('TC-053 | role label shows "Patient Portal"', async function () {
      expect(await authPage.getRoleLabel()).to.include('Patient Portal');
    });

    it('TC-054 | heading shows "Welcome Back" in login mode', async function () {
      await driver.get('http://localhost:5173/#/auth?role=patient');
      await authPage.waitForElement(authPage.locators.container, 10000);
      let h = '';
      for (let i = 0; i < 30; i++) {
        h = await authPage.getHeading();
        if (h.length > 0) break;
        await WaitHelpers.sleep(200);
      }
      expect(h).to.include('Welcome Back');
    });

    it('TC-055 | toggle to signup shows "Create an Account"', async function () {
      await authPage.toggleMode();
      expect(await authPage.getHeading()).to.include('Create an Account');
    });

    it('TC-056 | patient signup form is accessible after toggle', async function () {
      await authPage.toggleMode();
      expect(await authPage.isSignupFormVisible()).to.be.true;
    });

    it('TC-057 | back button navigates to /role from patient auth', async function () {
      await authPage.clickBack();
      expect(await driver.getCurrentUrl()).to.include('/role');
    });
  });

  // ─── Login – Credential Handling ──────────────────────────────────────────
  describe('Login – Credential Handling', function () {
    it('TC-058 | form submission with invalid creds triggers error', async function () {
      await authPage.open('doctor');
      await authPage.login('fake.user.xyz@notreal.com', 'badpassword99');
      const errMsg = await authPage.waitForErrorMessage(10000);
      expect(errMsg.length).to.be.greaterThan(0);
      logger.info(`Login error message: "${errMsg}"`);
    });

    it('TC-059 | after failed login, URL remains on /auth', async function () {
      await authPage.open('doctor');
      await authPage.login('another.fake@notexists.com', 'wrongwrong');
      await WaitHelpers.sleep(2000);
      expect(await driver.getCurrentUrl()).to.include('/auth');
    });

    it('TC-060 | page does not crash after failed login', async function () {
      await authPage.open('doctor');
      await authPage.login('crash@test.com', 'abc123');
      await WaitHelpers.sleep(3000);
      expect(await authPage.isVisible()).to.be.true;
    });

    it('TC-061 | form fields accept text input correctly', async function () {
      await authPage.open('doctor');
      await authPage.enterEmail('test@example.com');
      const val = await authPage.getAttribute(authPage.locators.emailInput, 'value');
      expect(val).to.equal('test@example.com');
    });

    it('TC-062 | password field masks input (type=password)', async function () {
      await authPage.open('doctor');
      const inputType = await authPage.getAttribute(authPage.locators.passwordInput, 'type');
      expect(inputType).to.equal('password');
    });

    it('TC-063 | email field has type=email', async function () {
      await authPage.open('doctor');
      const inputType = await authPage.getAttribute(authPage.locators.emailInput, 'type');
      expect(inputType).to.equal('email');
    });

    it('TC-064 | auth page shows auth-footer with toggle link', async function () {
      await authPage.open('doctor');
      expect(await authPage.isPresent(authPage.locators.authFooter)).to.be.true;
    });
  });
});
