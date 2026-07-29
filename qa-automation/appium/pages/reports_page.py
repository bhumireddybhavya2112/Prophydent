from .base_page import BaseMobilePage
from selenium.webdriver.common.by import By
import logging

logger = logging.getLogger("AppiumPython")

class MobileReportsPage(BaseMobilePage):
    # Selectors
    PAGE_TITLE = (By.CSS_SELECTOR, '.page-title')
    INPUT_SEARCH = (By.CSS_SELECTOR, '.search-bar input')
    REPORTS_LIST = (By.CSS_SELECTOR, '.report-card')
    SELECTED_REPORT_CARD = (By.CSS_SELECTOR, '.report-card.selected')
    
    VIEWER_CONTAINER = (By.CSS_SELECTOR, '.report-viewer')
    VIEWER_TITLE = (By.CSS_SELECTOR, '.viewer-header h2')
    
    BTN_DOWNLOAD_PDF = (By.CSS_SELECTOR, '.viewer-header button.print-btn')
    BTN_SHARE = (By.CSS_SELECTOR, '.viewer-header button.btn-primary')
    
    DIAGNOSTICS_SUMMARY = (By.XPATH, '//h3[contains(text(), "Diagnostic Summary")]')
    SUMMARY_AREAS = (By.CSS_SELECTOR, '.summary-area')
    MARKDOWN_ANALYSIS = (By.CSS_SELECTOR, '.markdown-body')
    
    EMPTY_VIEWER_STATE = (By.CSS_SELECTOR, '.empty-viewer')
    EMPTY_LIST_STATE = (By.CSS_SELECTOR, '.reports-list .empty-state')

    def select_report_by_index(self, index=0):
        """Taps the report card at the specified index"""
        logger.info(f"Appium: Tapping report card index: {index}")
        self.wait_for_element(*self.REPORTS_LIST)
        cards = self.driver.find_elements(*self.REPORTS_LIST)
        if not cards:
            raise Exception("No reports found to select")
        cards[index].click()
        self.wait_for_element(*self.VIEWER_TITLE)
