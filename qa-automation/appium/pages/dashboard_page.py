from .base_page import BaseMobilePage
from selenium.webdriver.common.by import By
import logging

logger = logging.getLogger("AppiumPython")

class MobileDashboardPage(BaseMobilePage):
    # Selectors
    PAGE_TITLE = (By.CSS_SELECTOR, '.page-title')
    SUBTITLE = (By.CSS_SELECTOR, '.dashboard-header .text-muted')
    BTN_START_ANALYSIS = (By.XPATH, '//button[contains(text(), "Start New Analysis") or text()="Start New Analysis"]')
    
    STAT_CARDS = (By.CSS_SELECTOR, '.stat-card')
    RECENT_SCANS_CONTAINER = (By.CSS_SELECTOR, '.recent-scans')
    RECENT_SCANS_LIST = (By.CSS_SELECTOR, '.scan-item')
    
    AI_INSIGHTS_CONTAINER = (By.CSS_SELECTOR, '.ai-insights')
    INSIGHT_ITEMS = (By.CSS_SELECTOR, '.insight-item')

    def get_welcome_title(self):
        """Returns the welcome/header title text"""
        element = self.wait_for_element(*self.PAGE_TITLE)
        return element.text

    def click_start_analysis(self):
        """Taps the Start New Analysis button"""
        logger.info("Appium: Tapping Start New Analysis button")
        self.click_element(*self.BTN_START_ANALYSIS)

    def get_stat_cards_count(self):
        """Returns the count of statistics cards displayed"""
        self.wait_for_element(*self.STAT_CARDS)
        return len(self.driver.find_elements(*self.STAT_CARDS))
