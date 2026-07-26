'use strict';

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class ReportsPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      container: By.css('.reports-page'),
      pageTitle: By.css('.page-title'),
      searchInput: By.css('.reports-list input[type="text"]'),
      reportsList: By.css('.reports-list'),
      reportCards: By.css('.report-card'),
      reportViewer: By.css('.report-viewer'),
      emptyViewer: By.css('.empty-viewer'),
      emptyState: By.css('.empty-state'),
      loadingState: By.css('.loading-state')
    };
  }

  async open() {
    await this.navigate('/#/reports');
    await this.waitForElement(this.locators.container, 20000);
  }

  async isVisible() {
    return this.isDisplayed(this.locators.container);
  }

  async getPageTitle() {
    return this.getText(this.locators.pageTitle);
  }

  async getReportCards() {
    return this.findElements(this.locators.reportCards);
  }

  async searchReports(term) {
    await this.type(this.locators.searchInput, term);
  }

  async isViewerVisible() {
    return this.isDisplayed(this.locators.reportViewer);
  }

  async isEmptyViewerVisible() {
    return this.isDisplayed(this.locators.emptyViewer);
  }

  async clickFirstReport() {
    const cards = await this.getReportCards();
    if (cards.length > 0) {
      await cards[0].click();
    }
  }
}

module.exports = ReportsPage;
