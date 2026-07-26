const BaseMobilePage = require('./BaseMobilePage');
const logger = require('../../utils/Logger');

class MobileDashboardPage extends BaseMobilePage {
    // ----------------------------------------------------------------------
    // Selectors
    // ----------------------------------------------------------------------
    get pageTitle() { return $('.page-title'); }
    get subtitle() { return $('.dashboard-header .text-muted'); }
    get btnStartAnalysis() { return $('button=Start New Analysis'); }
    
    get statCards() { return $$('.stat-card'); }
    get recentScansContainer() { return $('.recent-scans'); }
    get recentScansList() { return $$('.scan-item'); }
    
    get aiInsightsContainer() { return $('.ai-insights'); }
    get insightItems() { return $$('.insight-item'); }

    // ----------------------------------------------------------------------
    // Methods
    // ----------------------------------------------------------------------
    async getWelcomeTitle() {
        await this.waitForElement(this.pageTitle);
        return this.pageTitle.getText();
    }

    async clickStartAnalysis() {
        logger.info('Appium: Tapping Start New Analysis button');
        await this.clickElement(this.btnStartAnalysis);
    }
}

module.exports = new MobileDashboardPage();
