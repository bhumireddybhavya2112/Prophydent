import pytest
import json
import os
from appium import webdriver
from appium.options.common import AppiumOptions

@pytest.fixture(scope="session")
def credentials():
    # Load credentials from the selenium/test-data directory
    creds_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "selenium", "test-data", "credentials.json"))
    if os.path.exists(creds_path):
        with open(creds_path, "r") as f:
            return json.load(f)
    return {}

@pytest.fixture(scope="function")
def driver():
    # Setup Appium capabilities for Android execution
    options = AppiumOptions()
    options.set_capability("platformName", "Android")
    options.set_capability("automationName", "UiAutomator2")
    options.set_capability("deviceName", "Android Emulator")
    options.set_capability("appPackage", "com.prophydent.app")
    options.set_capability("appActivity", ".MainActivity")
    options.set_capability("noReset", True)
    options.set_capability("appium:chromedriverAutodownload", True)
    
    # Establish connection to the local Appium server
    driver = webdriver.Remote("http://127.0.0.1:4723", options=options)
    yield driver
    driver.quit()
