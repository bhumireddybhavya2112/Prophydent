'use strict';

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const WaitHelpers = require('../utils/waitHelpers');

class SettingsPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      container:            By.css('.settings-page'),
      pageTitle:            By.css('.page-title'),
      sections:             By.css('.settings-section'),
      themeToggle:          By.css('.toggle-switch input[type="checkbox"]'),
      passwordInput:        By.css('input[placeholder="Enter new password"]'),
      confirmPasswordInput: By.css('input[placeholder="Re-enter new password"]'),
      updatePasswordBtn:    By.xpath("//button[contains(text(),'Update Password')]"),
      signOutBtn:           By.xpath("//button[contains(text(),'Sign Out')]"),
      saveProfileBtn:       By.xpath("//button[contains(text(),'Save Profile Changes')]"),
      alertError:           By.css('.alert.alert-error'),
      alertSuccess:         By.css('.alert.alert-success')
    };
  }

  async open() {
    await this.navigate('/#/settings');
    await this.waitForElement(this.locators.container, 20000);
  }

  async isVisible()    { return this.isDisplayed(this.locators.container); }
  async getPageTitle() { return this.getText(this.locators.pageTitle); }
  async getSections()  { return this.findElements(this.locators.sections); }

  async toggleTheme() {
    await this.executeScript(
      'arguments[0].click()',
      await this.driver.findElement(this.locators.themeToggle)
    );
  }

  async isThemeDark() {
    const t = await this.driver.executeScript(
      "return document.documentElement.getAttribute('data-theme')"
    );
    return t === 'dark';
  }

  async enterNewPassword(pwd)     { await this.type(this.locators.passwordInput, pwd); }
  async enterConfirmPassword(pwd) { await this.type(this.locators.confirmPasswordInput, pwd); }

  async clickUpdatePassword() {
    await this.click(this.locators.updatePasswordBtn);
  }

  async getErrorMessage() {
    try { return await this.getText(this.locators.alertError); }
    catch (e) { return ''; }
  }

  async getSuccessMessage() {
    try { return await this.getText(this.locators.alertSuccess); }
    catch (e) { return ''; }
  }

  async signOut() {
    await this.click(this.locators.signOutBtn);
    await this.waitForUrl('/welcome', 8000);
  }
}

module.exports = SettingsPage;
