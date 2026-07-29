import pytest
from pages.auth_page import MobileAuthPage
from pages.dashboard_page import MobileDashboardPage
from pages.upload_analysis_page import MobileUploadAnalysisPage
from selenium.webdriver.support.ui import WebDriverWait

@pytest.fixture(scope="function")
def authenticated_doctor_driver(driver, credentials):
    """Fixture to ensure the driver is logged in as a doctor before test runs"""
    auth_page = MobileAuthPage(driver)
    auth_page.switch_to_webview_context()
    driver.get("http://localhost:5173/#/auth?role=doctor")
    
    doctor_creds = credentials.get("users", {}).get("doctor", {}).get("valid", {})
    auth_page.login(doctor_creds.get("email"), doctor_creds.get("password"))
    
    WebDriverWait(driver, 10).until(
        lambda d: "dashboard" in d.current_url
    )
    return driver

def test_tc_mob_101_dashboard_renders_stats(authenticated_doctor_driver):
    """TC-MOB-101 | Mobile Dashboard renders statistic items list cleanly"""
    dashboard_page = MobileDashboardPage(authenticated_doctor_driver)
    dashboard_page.switch_to_webview_context()
    
    title = dashboard_page.get_welcome_title()
    assert "dr." in title.lower()
    
    card_count = dashboard_page.get_stat_cards_count()
    assert card_count > 0

def test_tc_mob_221_start_new_analysis_navigation(authenticated_doctor_driver):
    """TC-MOB-221 | Start New Analysis navigates to scan upload portal"""
    dashboard_page = MobileDashboardPage(authenticated_doctor_driver)
    dashboard_page.switch_to_webview_context()
    
    dashboard_page.click_start_analysis()
    
    WebDriverWait(authenticated_doctor_driver, 10).until(
        lambda d: "analysis" in d.current_url
    )
    assert "/analysis" in authenticated_doctor_driver.current_url

def test_tc_mob_222_native_camera_photo_capture(authenticated_doctor_driver):
    """TC-MOB-222 | Native camera photo capture handles permissions and confirms picture"""
    upload_page = MobileUploadAnalysisPage(authenticated_doctor_driver)
    upload_page.switch_to_webview_context()
    authenticated_doctor_driver.get("http://localhost:5173/#/analysis")
    
    upload_page.select_first_patient()
    upload_page.capture_image_from_native_camera()
    
    # Assert we are back in WebView context and scanning state is visible
    scanning_visible = upload_page.wait_for_element(*upload_page.SCANNING_STATE).is_displayed()
    assert scanning_visible

def test_tc_mob_223_native_gallery_selection(authenticated_doctor_driver):
    """TC-MOB-223 | Gallery image selection picker picks first native thumbnail item"""
    upload_page = MobileUploadAnalysisPage(authenticated_doctor_driver)
    upload_page.switch_to_webview_context()
    authenticated_doctor_driver.get("http://localhost:5173/#/analysis")
    
    upload_page.select_first_patient()
    upload_page.select_image_from_native_gallery()
    
    # Assert we are back in WebView context and scanning state is visible
    scanning_visible = upload_page.wait_for_element(*upload_page.SCANNING_STATE).is_displayed()
    assert scanning_visible
