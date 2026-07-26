const BasePage = require('./BasePage');
const logger = require('../utils/Logger');

class DashboardPage extends BasePage {
    // ----------------------------------------------------------------------
    // Selectors
    // ----------------------------------------------------------------------
    get pageTitle() { return $('.page-title'); }
    get subtitle() { return $('.dashboard-header .text-muted'); }
    get btnStartAnalysis() { return $('button=Start New Analysis'); }
    
    get statCards() { return $$('.stat-card'); }
    get recentScansContainer() { return $('.recent-scans'); }
    get recentScansList() { return $$('.scan-item'); }
    get btnViewAllScans() { return $('.recent-scans .btn-outline'); }
    
    get aiInsightsContainer() { return $('.ai-insights'); }
    get insightItems() { return $$('.insight-item'); }
    
    get noScansMessage() { return $('.scan-list div'); } // When list is empty

    // ----------------------------------------------------------------------
    // Methods
    // ----------------------------------------------------------------------

    /**
     * Navigates directly to dashboard (requires auth session)
     */
    async open() {
        logger.info('Navigating to Dashboard');
        await super.open('dashboard');
        await this.waitForElement(this.pageTitle);
    }

    /**
     * Retrieves the text of the welcome title
     */
    async getWelcomeTitle() {
        await this.waitForElement(this.pageTitle);
        return this.pageTitle.getText();
    }

    /**
     * Retrieves all statistic labels present on the dashboard
     */
    async getStatLabels() {
        await this.waitForElement(this.statCards[0]);
        const labels = await $$('.stat-label');
        return Promise.all(labels.map(async (label) => await label.getText()));
    }

    /**
     * Clicks "Start New Analysis" button
     */
    async clickStartAnalysis() {
        logger.info('Clicking "Start New Analysis" button');
        await this.clickElement(this.btnStartAnalysis);
    }
    
    /**
     * Checks if Recent Scans section is visible
     */
    async isRecentScansVisible() {
        return this.recentScansContainer.isDisplayed();
    }
}

module.exports = new DashboardPage();
