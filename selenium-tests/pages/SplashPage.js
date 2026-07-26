'use strict';

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../config/testConfig');

class SplashPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      splashScreen: By.css('.splash-screen'),
      splashLogo: By.css('.splash-logo'),
      splashTitle: By.css('.splash-title'),
      loadingSpinner: By.css('.loading-spinner')
    };
  }

  async open() {
    await this.navigate('/#/');
  }

  async isVisible() {
    return this.isDisplayed(this.locators.splashScreen);
  }

  async getSplashTitle() {
    try {
      return await this.getText(this.locators.splashTitle);
    } catch (e) {
      return '';
    }
  }

  async waitForRedirect() {
    // Splash auto-navigates to /#/welcome after 2500ms
    await this.waitForUrl('/welcome', config.splashTimeout + 5000);
  }

  async isLogoVisible() {
    return this.isDisplayed(this.locators.splashLogo);
  }
}

module.exports = SplashPage;
