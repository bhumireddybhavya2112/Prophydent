from .base_page import BaseMobilePage
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
import logging

logger = logging.getLogger("AppiumPython")

class MobileSettingsPage(BaseMobilePage):
    # Selectors
    PAGE_TITLE = (By.CSS_SELECTOR, '.page-title')
    
    # Profile Section
    INPUT_FULL_NAME = (By.XPATH, '//label[text()="Full Name"]/following-sibling::input')
    INPUT_EMAIL = (By.XPATH, '//label[text()="Email Address"]/following-sibling::input')
    INPUT_MOBILE = (By.XPATH, '//label[text()="Mobile Number"]/following-sibling::input')
    SELECT_GENDER = (By.XPATH, '//label[text()="Gender"]/following-sibling::select')
    INPUT_ADDRESS = (By.XPATH, '//label[text()="Address"]/following-sibling::input')
    BTN_SAVE_PROFILE = (By.XPATH, '//button[contains(text(), "Save Profile Changes")]')
    
    # Appearance Section
    TOGGLE_DARK_MODE = (By.CSS_SELECTOR, '.toggle-switch input')
    CURRENT_THEME_ELEMENT = (By.CSS_SELECTOR, 'html')

    # Security Section
    INPUT_NEW_PASSWORD = (By.CSS_SELECTOR, 'input[placeholder="Enter new password"]')
    INPUT_CONFIRM_PASSWORD = (By.CSS_SELECTOR, 'input[placeholder="Re-enter new password"]')
    BTN_UPDATE_PASSWORD = (By.XPATH, '//button[contains(text(), "Update Password")]')

    # Sign Out Section
    BTN_SIGN_OUT = (By.XPATH, '//button[text()="Sign Out" or contains(text(), "Sign Out")]')

    # Messages
    ALERT_SUCCESS = (By.CSS_SELECTOR, '.alert-success')
    ALERT_ERROR = (By.CSS_SELECTOR, '.alert-error')

    def update_profile(self, full_name=None, mobile=None, gender=None, address=None):
        """Updates user profile settings details"""
        logger.info("Appium: Updating user profile settings")
        if full_name:
            self.type_text(*self.INPUT_FULL_NAME, full_name)
        if mobile:
            self.type_text(*self.INPUT_MOBILE, mobile)
        if gender:
            select_el = self.wait_for_element(*self.SELECT_GENDER)
            Select(select_el).select_by_value(gender)
        if address:
            self.type_text(*self.INPUT_ADDRESS, address)
        self.click_element(*self.BTN_SAVE_PROFILE)
