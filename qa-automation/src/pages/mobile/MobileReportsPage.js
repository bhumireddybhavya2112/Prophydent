const BaseMobilePage = require('./BaseMobilePage');
const logger = require('../../utils/Logger');

class MobileReportsPage extends BaseMobilePage {
    // ----------------------------------------------------------------------
    // Selectors
    // ----------------------------------------------------------------------
    get pageTitle() { return $('.page-title'); }
    get inputSearch() { return $('.search-bar input'); }
    get reportsList() { return $$('.report-card'); }
    get selectedReportCard() { return $('.report-card.selected'); }
    
    get viewerContainer() { return $('.report-viewer'); }
    get viewerTitle() { return $('.viewer-header h2'); }
    
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
    async selectReportByIndex(index = 0) {
        logger.info(`Appium: Tapping report card index: ${index}`);
        const cards = await this.reportsList;
        if (cards.length === 0) throw new Error('No reports found to select');
        await this.clickElement(cards[index]);
        await this.waitForElement(this.viewerTitle);
    }
}

module.exports = new MobileReportsPage();
