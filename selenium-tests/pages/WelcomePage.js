'use strict';

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class WelcomePage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      screen: By.css('.onboarding-screen'),
      welcomeContent: By.css('.welcome-content'),
      logo: By.css('.welcome-logo'),
      heading: By.css('.welcome-content h1'),
      subtitle: By.css('.welcome-subtitle'),
      getStartedBtn: By.css('.btn-large')
    };
  }

  async open() {
    await this.navigate('/#/welcome');
    await this.waitForElement(this.locators.getStartedBtn);
  }

  async isVisible() {
    return this.isDisplayed(this.locators.welcomeContent);
  }

  async getHeadingText() {
    return this.getText(this.locators.heading);
  }

  async getSubtitleText() {
    return this.getText(this.locators.subtitle);
  }

  async clickGetStarted() {
    await this.click(this.locators.getStartedBtn);
    await this.waitForUrl('/role');
  }

  async isLogoVisible() {
    return this.isDisplayed(this.locators.logo);
  }
}

module.exports = WelcomePage;
