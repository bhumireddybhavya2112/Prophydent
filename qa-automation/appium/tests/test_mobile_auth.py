import pytest
from pages.auth_page import MobileAuthPage
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

def test_tc_mob_001_splash_loader_transitions(driver):
    """TC-MOB-001 | Splash screen loader transitions to welcome page successfully"""
    auth_page = MobileAuthPage(driver)

    driver.get("http://localhost:5173/")
    
    splash = auth_page.wait_for_element(By.CSS_SELECTOR, '.splash-screen')
    assert splash.is_displayed()
    
    # Wait for welcome page redirect
    WebDriverWait(driver, 10).until(
        lambda d: "welcome" in d.current_url
    )
    assert "welcome" in driver.current_url

def test_tc_mob_002_role_selection_navigates(driver):
    """TC-MOB-002 | Role selection navigates to doctor auth route"""
    auth_page = MobileAuthPage(driver)

    driver.get("http://localhost:5173/#/role")
    
    doctor_card = auth_page.wait_for_element(By.CSS_SELECTOR, '.role-cards .role-card:nth-child(1)')
    doctor_card.click()
    
    WebDriverWait(driver, 5).until(
        lambda d: "role=doctor" in d.current_url
    )
    assert "/auth?role=doctor" in driver.current_url

@pytest.mark.parametrize("tc_id, email, password, err_type", [
    ('TC-MOB-003', 'surendra@prophydent.com', 'surendra123', 'domain'),
    ('TC-MOB-004', 'surendra.lmt@gmail.com', 'surendra123', 'invalid'),
    ('TC-MOB-005', 'surendra.lmt@prophydent.org', 'surendra123', 'domain'),
    ('TC-MOB-006', 'invalid.format.email', 'surendra123', 'format'),
    ('TC-MOB-007', 'surendra.lmt@prophydent.com', 'wrongpass', 'credentials')
])
def test_doctor_login_negative_scenarios(driver, tc_id, email, password, err_type):
    """Doctor login negative validation loops"""
    auth_page = MobileAuthPage(driver)

    driver.get("http://localhost:5173/#/auth?role=doctor")
    auth_page.login(email, password)
    
    if err_type == 'format':
        # Form validation blocks routing
        assert "auth" in driver.current_url
    else:
        err_msg = auth_page.get_error_message()
        assert len(err_msg) > 0

def test_tc_mob_008_doctor_login_success(driver, credentials):
    """TC-MOB-008 | Doctor successfully authenticates on mobile device"""
    auth_page = MobileAuthPage(driver)

    driver.get("http://localhost:5173/#/auth?role=doctor")
    
    doctor_creds = credentials.get("users", {}).get("doctor", {}).get("valid", {})
    auth_page.login(doctor_creds.get("email"), doctor_creds.get("password"))
    
    WebDriverWait(driver, 10).until(
        lambda d: "dashboard" in d.current_url
    )
    assert "dashboard" in driver.current_url

@pytest.mark.parametrize("tc_id, email, password, err_type", [
    ('TC-MOB-051', 'nandureddy@yahoo.com', 'nandureddy', 'non-gmail'),
    ('TC-MOB-052', 'invalidpatientgmail', 'nandureddy', 'format'),
    ('TC-MOB-053', 'nandureddy@gmail.com', 'wrongpassword', 'credentials')
])
def test_patient_login_negative_scenarios(driver, tc_id, email, password, err_type):
    """Patient login negative validation loops"""
    auth_page = MobileAuthPage(driver)

    driver.get("http://localhost:5173/#/auth?role=patient")
    auth_page.login(email, password)
    
    if err_type == 'format':
        assert "auth" in driver.current_url
    else:
        err_msg = auth_page.get_error_message()
        assert len(err_msg) > 0
