from .base_page import BaseMobilePage
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import logging

logger = logging.getLogger("AppiumPython")

class MobileUploadAnalysisPage(BaseMobilePage):
    # Selectors
    PAGE_HEADER = (By.CSS_SELECTOR, '.page-title')
    
    # Patient Selection
    SELECT_PATIENT = (By.CSS_SELECTOR, '.patient-selector select')
    LOCKED_OVERLAY = (By.CSS_SELECTOR, '.locked-overlay')
    
    # Upload zone actions
    BTN_TAKE_PHOTO = (By.CSS_SELECTOR, '.native-upload-zone button.btn-primary')
    BTN_CHOOSE_FROM_GALLERY = (By.CSS_SELECTOR, '.native-upload-zone button.btn-outline')
    
    # States
    EMPTY_STATE = (By.CSS_SELECTOR, '.empty-state')
    SCANNING_STATE = (By.CSS_SELECTOR, '.scanning-state')
    RESULTS_STATE = (By.CSS_SELECTOR, '.results-state')
    
    # Results
    IMAGE_PREVIEW = (By.CSS_SELECTOR, '.image-preview')
    BOUNDING_BOXES = (By.CSS_SELECTOR, '.bounding-box')
    FINDINGS_TABLE = (By.CSS_SELECTOR, '.findings-table')
    BTN_SAVE_REPORT = (By.CSS_SELECTOR, '.results-state button:nth-of-type(1)')
    BTN_SCAN_ANOTHER = (By.CSS_SELECTOR, '.results-state button:nth-of-type(2)')

    # Native Android Selectors (to use in NATIVE_APP context)
    NATIVE_SHUTTER_BTN = (By.XPATH, '//android.widget.ImageView[@content-desc="Shutter" or @resource-id="com.android.camera2:id/shutter_button" or @resource-id="com.android.camera:id/shutter_button" or @content-desc="Take picture"]')
    NATIVE_CAMERA_ACCEPT_BTN = (By.XPATH, '//android.widget.ImageView[@content-desc="Done" or @resource-id="com.android.camera2:id/done_button" or @text="OK" or @text="SAVE" or @resource-id="com.android.camera2:id/confirm_button"]')
    NATIVE_FIRST_GALLERY_ITEM = (By.XPATH, '//android.widget.ImageView[contains(@resource-id, "icon") or contains(@resource-id, "thumbnail") or @content-desc="Photo" or @index="0"]')

    def capture_image_from_native_camera(self):
        """Triggers the native camera and captures an image"""
        logger.info("Appium: Tapping native Take Photo button in WebView")
        self.click_element(*self.BTN_TAKE_PHOTO)
        
        # Handle native permission dialogs if they show up
        self.handle_permission_dialog_if_shown()
        
        # Switch to native context for camera capture
        self.switch_to_native_context()
        
        logger.info("Appium Native: Clicking camera shutter button")
        self.click_element(*self.NATIVE_SHUTTER_BTN)
        time.sleep(2)  # Wait for capture processing
        
        logger.info("Appium Native: Clicking accept/confirm picture button")
        self.click_element(*self.NATIVE_CAMERA_ACCEPT_BTN)
        
        # Switch back to WebView context
        self.switch_to_webview_context()

    def select_image_from_native_gallery(self):
        """Selects an image from the device's native gallery picker"""
        logger.info("Appium: Tapping native Choose from Gallery button in WebView")
        self.click_element(*self.BTN_CHOOSE_FROM_GALLERY)
        
        # Handle native permission dialogs if they show up
        self.handle_permission_dialog_if_shown()
        
        # Switch to native context
        self.switch_to_native_context()
        
        logger.info("Appium Native: Selecting first image thumbnail from native photo gallery")
        self.click_element(*self.NATIVE_FIRST_GALLERY_ITEM)
        
        # Switch back to WebView context
        self.switch_to_webview_context()

    def select_first_patient(self):
        """Selects the first patient from the patient dropdown list"""
        logger.info("Appium: Selecting patient from dropdown")
        element = self.wait_for_element(*self.SELECT_PATIENT)
        Select(element).select_by_index(1)
        
        # Wait for value to change
        WebDriverWait(self.driver, 10).until(
            lambda d: Select(d.find_element(*self.SELECT_PATIENT)).first_selected_option.get_attribute("value") != ""
        )
