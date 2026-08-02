const BasePage = require('./BasePage');
const logger = require('../utils/Logger');

class ReportsPage extends BasePage {
    // ----------------------------------------------------------------------
    // Selectors
    // ----------------------------------------------------------------------
    get pageTitle() { return $('.page-title'); }
    get inputSearch() { return $('.search-bar input'); }
    get reportsList() { return $$('.report-card'); }
    get selectedReportCard() { return $('.report-card.selected'); }
    
    get viewerContainer() { return $('.report-viewer'); }
    get viewerTitle() { return $('.viewer-header h2'); }
    get viewerMeta() { return $('.viewer-meta'); }
    
    get btnDownloadPdf() { return $('.viewer-header button.print-btn'); }
    get btnShare() { return $('.viewer-header button.btn-primary'); }
    
    get diagnosticsSummary() { return $('.viewer-section h3*=Diagnostic Summary'); }
    get summaryAreas() { return $$('.summary-area'); }
    get markdownAnalysis() { return $('.markdown-body'); }
    
    get emptyViewerState() { return $('.empty-viewer'); }
    get emptyListState() { return $('.reports-list .empty-state'); }

    // ----------------------------------------------------------------------
    // Methods
    // ----------------------------------------------------------------------

    /**
     * Navigates directly to reports view (requires auth session)
     */
    async open() {
        logger.info('Navigating to Reports Page');
        await super.open('reports');
        try {
            await this.waitForElement(this.pageTitle);
        } catch (e) {
            const fs = require('fs');
            const path = require('path');
            const reportsDir = path.join(__dirname, '../reports/screenshots');
            if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const screenshotPath = path.join(reportsDir, `TC_WEB_254_debug_${timestamp}.png`);
            const pageSource = await browser.getPageSource();
            const sourcePath = path.join(reportsDir, `TC_WEB_254_debug_${timestamp}.html`);
            fs.writeFileSync(screenshotPath, await browser.takeScreenshot(), 'base64');
            fs.writeFileSync(sourcePath, pageSource);
            console.log(`[DEBUG TC-WEB-254] Screenshot: ${screenshotPath}`);
            console.log(`[DEBUG TC-WEB-254] PageSource: ${sourcePath}`);
            throw e;
        }
    }

    /**
     * Searches for a report using name or date
     * @param {string} term 
     */
    async searchReport(term) {
        logger.info(`Searching reports for term: ${term}`);
        await this.typeText(this.inputSearch, term);
        await browser.pause(500); // Brief pause to allow filters to update
    }

    /**
     * Selects a report card from the list by index
     * @param {number} index 
     */
    async selectReportByIndex(index = 0) {
        logger.info(`Selecting report at index: ${index}`);
        const cards = await this.reportsList;
        if (cards.length === 0) {
            throw new Error('No reports available in the list to select.');
        }
        if (index >= cards.length) {
            throw new Error(`Index ${index} is out of bounds. Only ${cards.length} reports exist.`);
        }
        await this.clickElement(cards[index]);
        await this.waitForElement(this.viewerTitle);
    }
}

module.exports = new ReportsPage();
