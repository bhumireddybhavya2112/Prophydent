'use strict';

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      dashboard:        By.css('.dashboard'),
      pageTitle:        By.css('.page-title'),
      statsGrid:        By.css('.stats-grid'),
      statCards:        By.css('.stat-card'),
      recentScans:      By.css('.recent-scans'),
      aiInsights:       By.css('.ai-insights'),
      startAnalysisBtn: By.css('.dashboard-header .btn.btn-primary'),
      sidebar:          By.css('.sidebar')
    };
  }

  async open() {
    await this.navigate('/#/dashboard');
    await this.waitForElement(this.locators.dashboard, 20000);
  }

  async isVisible()          { return this.isDisplayed(this.locators.dashboard); }
  async getPageTitle()       { return this.getText(this.locators.pageTitle); }
  async getStatCards()       { return this.findElements(this.locators.statCards); }
  async isStatsGridVisible() { return this.isDisplayed(this.locators.statsGrid); }
  async isRecentScansVisible(){ return this.isDisplayed(this.locators.recentScans); }
  async isAiInsightsVisible() { return this.isDisplayed(this.locators.aiInsights); }
  async isSidebarVisible()   { return this.isDisplayed(this.locators.sidebar); }
}

module.exports = DashboardPage;
