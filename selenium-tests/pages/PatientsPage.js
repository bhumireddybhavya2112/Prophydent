'use strict';

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class PatientsPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      container:             By.css('.patients-container'),
      heading:               By.css('.patients-container h1'),
      tabButtons:            By.css('.tab-btn'),
      viewTab:               By.xpath("//button[contains(@class,'tab-btn') and contains(.,'View Patients')]"),
      addTab:                By.xpath("//button[contains(@class,'tab-btn') and contains(.,'Add Patient')]"),
      searchInput:           By.css('.search-bar input'),
      patientsTable:         By.css('.patients-table'),
      addPatientForm:        By.css('.add-patient-card form'),
      fullNameInput:         By.css('input[name="full_name"]'),
      dobInput:              By.css('input[name="dob"]'),
      emailInput:            By.css('input[name="email"]'),
      phoneInput:            By.css('input[name="phone"]'),
      medicalHistoryTextarea:By.css('textarea[name="medical_history"]'),
      savePatientBtn:        By.css('.form-actions .btn-primary'),
      cancelBtn:             By.css('.form-actions .btn-outline'),
      errorMessage:          By.css('.error-message')
    };
  }

  async open() {
    await this.navigate('/#/patients');
    await this.waitForElement(this.locators.container, 20000);
  }

  async isVisible()       { return this.isDisplayed(this.locators.container); }
  async getTabButtons()   { return this.findElements(this.locators.tabButtons); }
  async isTableVisible()  { return this.isDisplayed(this.locators.patientsTable); }

  async clickAddPatientTab() {
    await this.jsClick(this.locators.addTab);
    await this.waitForElement(this.locators.addPatientForm, 8000);
  }

  async clickViewPatientsTab() {
    await this.jsClick(this.locators.viewTab);
  }

  async searchPatient(term) {
    await this.type(this.locators.searchInput, term);
  }

  async fillAddPatientForm(data) {
    if (data.fullName)       await this.type(this.locators.fullNameInput, data.fullName);
    if (data.dob)            await this.type(this.locators.dobInput, data.dob);
    if (data.email)          await this.type(this.locators.emailInput, data.email);
    if (data.phone)          await this.type(this.locators.phoneInput, data.phone);
    if (data.medicalHistory) await this.type(this.locators.medicalHistoryTextarea, data.medicalHistory);
  }

  async clickSavePatient() {
    await this.click(this.locators.savePatientBtn);
  }

  async submitAddPatientForm() { await this.clickSavePatient(); }
}

module.exports = PatientsPage;
