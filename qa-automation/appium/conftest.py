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

@pytest.fixture(autouse=True)
def auto_switch_to_webview(driver):
    """Automatically switches to the WEBVIEW context after driver is created."""
    from pages.base_page import BaseMobilePage
    page = BaseMobilePage(driver)
    # Wait for webview, native splash might still be active but Appium should find webview
    page.switch_to_webview_context(timeout=20)

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    # Execute all other hooks to obtain the report object
    outcome = yield
    rep = outcome.get_result()

    # We only care about actual failing test calls, not setup/teardown
    if rep.when == 'call' and rep.failed:
        # Get the driver instance if it exists in the test fixture
        driver = item.funcargs.get('driver', None)
        if not driver:
            driver = item.funcargs.get('authenticated_doctor_driver', None)
            
        if driver:
            try:
                import os
                report_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'reports'))
                os.makedirs(report_dir, exist_ok=True)
                
                safe_name = item.nodeid.replace("::", "_").replace("/", "_").replace(".py", "")
                
                # 1. Capture contexts
                with open(os.path.join(report_dir, f"{safe_name}_contexts.txt"), "w") as f:
                    f.write(f"Available contexts: {driver.contexts}\n")
                    f.write(f"Current context: {driver.current_context}\n")
                
                # 2. Capture page source
                with open(os.path.join(report_dir, f"{safe_name}_source.txt"), "w", encoding='utf-8') as f:
                    f.write(driver.page_source)
                
                # 3. Capture screenshot
                driver.save_screenshot(os.path.join(report_dir, f"{safe_name}_screenshot.png"))
                
                print(f"\n[Diagnostics] Saved screenshot and context diagnostics to {report_dir}")
            except Exception as e:
                print(f"Failed to capture diagnostics: {e}")
