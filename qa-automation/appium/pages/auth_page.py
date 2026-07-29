from .base_page import BaseMobilePage
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
import logging

logger = logging.getLogger("AppiumPython")

class MobileAuthPage(BaseMobilePage):
    # Selectors
    CONTAINER = (By.CSS_SELECTOR, '.auth-container')
    HEADING = (By.CSS_SELECTOR, '.auth-header h2')
    ROLE_LABEL = (By.CSS_SELECTOR, '.auth-header .text-muted')
    BACK_BTN = (By.CSS_SELECTOR, '.back-btn')
    
    INPUT_EMAIL = (By.CSS_SELECTOR, 'input[type="email"]')
    INPUT_PASSWORD = (By.CSS_SELECTOR, 'input[type="password"]')
    INPUT_FULL_NAME = (By.CSS_SELECTOR, 'input[placeholder*="Doe"]')
    INPUT_MOBILE = (By.CSS_SELECTOR, 'input[type="tel"]')
    INPUT_ADDRESS = (By.CSS_SELECTOR, 'input[placeholder*="Clinical"]')
    SELECT_GENDER = (By.CSS_SELECTOR, 'select')
    INPUT_AVATAR = (By.CSS_SELECTOR, 'input#avatarUpload')
    
    BTN_SUBMIT = (By.CSS_SELECTOR, 'button[type="submit"]')
    LINK_TOGGLE_MODE = (By.CSS_SELECTOR, '.text-link')
    ERROR_MESSAGE = (By.CSS_SELECTOR, '.error-message')

    def login(self, email, password):
        """Authenticates the user in the mobile WebView"""
        logger.info(f"Appium: Typing email: {email}")
        self.type_text(*self.INPUT_EMAIL, email)
        
        logger.info("Appium: Typing password")
        self.type_text(*self.INPUT_PASSWORD, password)
        
        logger.info("Appium: Tapping Sign In")
        self.click_element(*self.BTN_SUBMIT)

    def toggle_auth_mode(self):
        """Toggles between signup and login screens"""
        logger.info("Appium: Tapping Toggle Mode link")
        self.click_element(*self.LINK_TOGGLE_MODE)

    def get_error_message(self):
        """Retrieves validation error message from screen"""
        element = self.wait_for_element(*self.ERROR_MESSAGE)
        return element.text

    def fill_signup_form(self, full_name=None, mobile=None, address=None, gender=None, email=None, password=None):
        """Fills out registration details"""
        logger.info("Appium: Filling mobile signup form details")
        if full_name:
            self.type_text(*self.INPUT_FULL_NAME, full_name)
        if mobile:
            self.type_text(*self.INPUT_MOBILE, mobile)
        if address:
            self.type_text(*self.INPUT_ADDRESS, address)
        if gender:
            select_el = self.wait_for_element(*self.SELECT_GENDER)
            Select(select_el).select_by_value(gender)
        if email:
            self.type_text(*self.INPUT_EMAIL, email)
        if password:
            self.type_text(*self.INPUT_PASSWORD, password)
