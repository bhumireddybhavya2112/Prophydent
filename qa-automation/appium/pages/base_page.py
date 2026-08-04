from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import logging

logger = logging.getLogger("AppiumPython")
logging.basicConfig(level=logging.INFO)

class BaseMobilePage:
    def __init__(self, driver):
        self.driver = driver

    def wait_for_element(self, by, selector, timeout=15):
        """Wait for an element to be visible (cross-context)"""
        return WebDriverWait(self.driver, timeout).until(
            EC.visibility_of_element_located((by, selector))
        )

    def click_element(self, by, selector):
        """Safely clicks an element"""
        element = self.wait_for_element(by, selector)
        element.click()

    def type_text(self, by, selector, text):
        """Safely types text into an input field"""
        element = self.wait_for_element(by, selector)
        element.clear()
        element.send_keys(text)

    def switch_to_webview_context(self, timeout=20):
        """Switches Appium driver to WebView context for hybrid elements, polling until available"""
        import time
        logger.info(f"Appium: Polling for WebView context for up to {timeout}s...")
        end_time = time.time() + timeout
        
        while time.time() < end_time:
            contexts = self.driver.contexts
            webview = next((c for c in contexts if "WEBVIEW" in c.upper()), None)
            if webview:
                self.driver.switch_to.context(webview)
                logger.info(f"Appium: Successfully switched context to: {webview}")
                return
            time.sleep(0.5)
            
        raise Exception(f"WebView context was not found within {timeout} seconds. Available contexts: {self.driver.contexts}")

    def switch_to_native_context(self):
        """Switches Appium driver back to Native App context"""
        logger.info("Appium: Switching context back to native wrapper")
        self.driver.switch_to.context("NATIVE_APP")
        logger.info("Appium: Switched context to NATIVE_APP")

    # Native Android Selectors
    from appium.webdriver.common.appiumby import AppiumBy
    NATIVE_ALLOW_PERMISSION = (AppiumBy.XPATH, '//android.widget.Button[@resource-id="com.android.permissioncontroller:id/permission_allow_button" or @text="Allow" or @text="WHILE USING THE APP" or contains(@text, "Allow")]')
    NATIVE_ALLOW_ALWAYS_PERMISSION = (AppiumBy.XPATH, '//android.widget.Button[@resource-id="com.android.permissioncontroller:id/permission_allow_always_button" or @text="Allow all the time"]')

    def handle_permission_dialog_if_shown(self):
        """Explicitly clicks the permission dialog confirmation button if displayed"""
        self.switch_to_native_context()
        try:
            # Short wait for permission dialog
            WebDriverWait(self.driver, 5).until(
                EC.element_to_be_clickable(self.NATIVE_ALLOW_PERMISSION)
            ).click()
            logger.info("Appium Native: Permission dialog detected, clicked Allow")
        except Exception:
            logger.info("Appium Native: No permissions dialog displayed on current screen transition")
        self.switch_to_webview_context()
