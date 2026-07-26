'use strict';

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const WaitHelpers = require('../utils/waitHelpers');

class AuthPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      container:     By.css('.auth-container'),
      heading:       By.css('.auth-header h2'),
      roleLabel:     By.css('.auth-header .text-muted'),
      backBtn:       By.css('.back-btn'),
      emailInput:    By.css('input[type="email"]'),
      passwordInput: By.css('input[type="password"]'),
      submitBtn:     By.css('button[type="submit"]'),
      errorMessage:  By.css('.error-message'),
      toggleLink:    By.css('.text-link'),
      // Signup-only fields (may be scrolled off-screen)
      fullNameInput: By.css('input[placeholder*="Doe"]'),
      mobileInput:   By.css('input[type="tel"]'),
      addressInput:  By.css('input[placeholder*="Clinical"]'),
      genderSelect:  By.css('select'),
      logo:          By.css('.small-logo'),
      authFooter:    By.css('.auth-footer')
    };
  }

  async open(role) {
    const r = role || 'doctor';
    const targetUrl = `${this.baseUrl}/#/auth?role=${r}`;

    // Always navigate to a different route first to force React to unmount
    // the auth component — this resets all useState hooks to initial values.
    // Without this, navigating to the same /#/auth URL keeps the component
    // mounted and preserves previous state (e.g. isLogin=false from a toggle).
    await this.driver.get(`${this.baseUrl}/#/welcome`);
    await this.sleep(200);
    await this.driver.get(targetUrl);
    await this.waitForElement(this.locators.container);
    await this.driver.executeScript('window.scrollTo(0, 0);');
  }

  async isVisible() { return this.isDisplayed(this.locators.container); }

  /** Read h2 via JS textContent — works even when element is off-screen. */
  async getHeading() {
    await this.waitForElement(this.locators.heading);
    return this.driver.executeScript(
      "var el=document.querySelector('.auth-header h2'); return el?el.textContent.trim():'';"
    );
  }

  async getRoleLabel() {
    await this.waitForElement(this.locators.roleLabel);
    return this.driver.executeScript(
      "var el=document.querySelector('.auth-header .text-muted'); return el?el.textContent.trim():'';"
    );
  }

  async getToggleLinkText() {
    try {
      return await this.driver.executeScript(
        "var el=document.querySelector('.text-link'); return el?el.textContent.trim():'';"
      );
    } catch (e) { return ''; }
  }

  async getSubmitButtonText() {
    return this.driver.executeScript(
      "var el=document.querySelector('button[type=\"submit\"]'); return el?el.textContent.trim():'';"
    );
  }

  async getErrorMessage() {
    try {
      return await this.driver.executeScript(
        "var el=document.querySelector('.error-message'); return el?el.textContent.trim():'';"
      );
    } catch (e) { return ''; }
  }

  async isErrorVisible() {
    return this.driver.executeScript(
      "var el=document.querySelector('.error-message'); return el?el.offsetParent!==null:false;"
    );
  }

  async waitForErrorMessage(timeout) {
    const t = timeout || 8000;
    const deadline = Date.now() + t;
    while (Date.now() < deadline) {
      const msg = await this.getErrorMessage();
      if (msg.length > 0) return msg;
      await this.sleep(300);
    }
    return '';
  }

  async enterEmail(email) { await this.type(this.locators.emailInput, email); }
  async enterPassword(pwd) { await this.type(this.locators.passwordInput, pwd); }

  async clickSubmit() { await this.click(this.locators.submitBtn); }

  async login(email, password) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickSubmit();
  }

  /**
   * Toggle between login and signup modes.
   * Uses React __reactProps$ to invoke the onClick directly,
   * bypassing Chrome's event processing queue and viewport restrictions.
   * After toggling, scroll to top so header elements are in viewport.
   */
  async toggleMode() {
    await this.driver.executeScript(`
      var btn = document.querySelector('.text-link');
      if (!btn) return;
      var pk = Object.keys(btn).find(function(k){ return k.startsWith('__reactProps'); });
      if (pk && btn[pk] && typeof btn[pk].onClick === 'function') {
        btn[pk].onClick({ preventDefault: function(){}, stopPropagation: function(){} });
        return;
      }
      btn.click();
    `);
    await this.sleep(600);
    await this.driver.executeScript('window.scrollTo(0, 0);');
    await this.sleep(200);
  }

  async isLoginMode() {
    try {
      const h = await this.getHeading();
      return h.includes('Welcome Back');
    } catch (e) { return false; }
  }

  async isSignupMode() {
    try {
      const h = await this.getHeading();
      return h.includes('Create an Account');
    } catch (e) { return false; }
  }

  async clickBack() {
    await this.jsClick(this.locators.backBtn);
    await this.waitForUrl('/role', 8000);
  }

  async isSignupFormVisible() {
    return this.driver.executeScript(
      "return !!document.querySelector('#avatarUpload');"
    );
  }

  async isEmailInputVisible()    { return this.isDisplayed(this.locators.emailInput); }
  async isPasswordInputVisible() { return this.isDisplayed(this.locators.passwordInput); }

  /**
   * Set a React controlled input value using the native input value setter
   * (required because React intercepts the value property).
   */
  async setReactInputValue(cssSelector, value) {
    await this.driver.executeScript(`
      var input = document.querySelector(arguments[0]);
      if (!input) return;
      var nativeSet = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSet.call(input, arguments[1]);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    `, cssSelector, value);
  }

  /**
   * Fill the doctor signup form using React native setters (fields may be off-screen).
   */
  async fillDoctorSignupForm({ fullName, mobile, address, email, password }) {
    await this.setReactInputValue('input[placeholder*="Doe"]',         fullName || 'Dr. Test User');
    await this.setReactInputValue('input[type="tel"]',                 mobile   || '5550001111');
    await this.setReactInputValue('input[placeholder*="Clinical"]',    address  || '1 Clinical Way, NY');
    await this.setReactInputValue('input[type="email"]',               email    || 'example.lmt@prophydent.com');
    await this.setReactInputValue('input[type="password"]',            password || 'testpass123');
  }
}

module.exports = AuthPage;
