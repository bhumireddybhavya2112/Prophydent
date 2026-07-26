'use strict';

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class NavigationPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      sidebar:      By.css('.sidebar'),
      navItems:     By.css('.nav-item'),
      dashboardNav: By.xpath("//button[contains(@class,'nav-item')][.//span[contains(text(),'Dashboard')]]"),
      patientsNav:  By.xpath("//button[contains(@class,'nav-item')][.//span[contains(text(),'Patients')]]"),
      scansNav:     By.xpath("//button[contains(@class,'nav-item')][.//span[contains(text(),'Scans') or contains(text(),'My Scans')]]"),
      reportsNav:   By.xpath("//button[contains(@class,'nav-item')][.//span[contains(text(),'Reports') or contains(text(),'My Reports')]]"),
      settingsNav:  By.xpath("//button[contains(@class,'nav-item')][.//span[contains(text(),'Settings')]]"),
      logoText:     By.css('.logo-text'),
      userProfile:  By.css('.user-profile'),
      userName:     By.css('.user-name'),
      userRole:     By.css('.user-role'),
      signOutBtn:   By.css('.sign-out-btn'),
      activeNavItem:By.css('.nav-item.active')
    };
  }

  async isSidebarVisible()   { return this.isDisplayed(this.locators.sidebar); }
  async getNavItems()        { return this.findElements(this.locators.navItems); }
  async getLogoText()        { return this.getText(this.locators.logoText); }

  async getActiveNavItem() {
    try { return await this.getText(this.locators.activeNavItem); }
    catch (e) { return ''; }
  }

  async navigateToDashboard() {
    await this.jsClick(this.locators.dashboardNav);
    await this.waitForUrl('/dashboard', 8000);
  }

  async navigateToPatients() {
    await this.jsClick(this.locators.patientsNav);
    await this.waitForUrl('/patients', 8000);
  }

  async navigateToScans() {
    await this.jsClick(this.locators.scansNav);
    await this.waitForUrl('/analysis', 8000);
  }

  async navigateToReports() {
    await this.jsClick(this.locators.reportsNav);
    await this.waitForUrl('/reports', 8000);
  }

  async navigateToSettings() {
    await this.jsClick(this.locators.settingsNav);
    await this.waitForUrl('/settings', 8000);
  }

  async signOutFromSidebar() {
    await this.click(this.locators.signOutBtn);
    await this.waitForUrl('/welcome', 8000);
  }
}

module.exports = NavigationPage;
