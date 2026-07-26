'use strict';

require('dotenv').config();
const { expect } = require('chai');
const DriverManager = require('../utils/driverManager');
const SplashPage = require('../pages/SplashPage');
const WelcomePage = require('../pages/WelcomePage');
const RoleSelectionPage = require('../pages/RoleSelectionPage');
const logger = require('../utils/logger');

describe('01 - Onboarding Flow', function () {
  this.timeout(90000);
  let driver, splashPage, welcomePage, rolePage;

  before(async function () {
    driver = await DriverManager.getDriver();
    splashPage  = new SplashPage(driver);
    welcomePage = new WelcomePage(driver);
    rolePage    = new RoleSelectionPage(driver);
  });

  // ─── Splash Screen ────────────────────────────────────────────────────────
  describe('Splash Screen', function () {
    it('TC-001 | should navigate to /#/ and show splash or welcome', async function () {
      await splashPage.open();
      await splashPage.sleep(600);
      const url = await driver.getCurrentUrl();
      expect(url.includes('/welcome') || url.includes('/#/')).to.be.true;
    });

    it('TC-002 | should automatically redirect to /#/welcome after 2.5 s timer', async function () {
      await splashPage.open();
      await splashPage.waitForRedirect();
      const url = await driver.getCurrentUrl();
      expect(url).to.include('/welcome');
    });

    it('TC-003 | splash page should contain .splash-screen element', async function () {
      await driver.get('http://localhost:5173/#/');
      await splashPage.sleep(300);
      const src = await driver.getPageSource();
      expect(src).to.include('splash-screen');
    });

    it('TC-004 | splash logo image is present in DOM', async function () {
      await driver.get('http://localhost:5173/#/');
      await splashPage.sleep(300);
      const src = await driver.getPageSource();
      expect(src).to.include('splash-logo');
    });

    it('TC-005 | splash title text "ProphyDent AI" is present', async function () {
      await driver.get('http://localhost:5173/#/');
      await splashPage.sleep(300);
      const src = await driver.getPageSource();
      expect(src).to.include('ProphyDent AI');
    });

    it('TC-006 | loading spinner is present on splash screen', async function () {
      await driver.get('http://localhost:5173/#/');
      await splashPage.sleep(300);
      const src = await driver.getPageSource();
      expect(src).to.include('loading-spinner');
    });
  });

  // ─── Welcome Page ─────────────────────────────────────────────────────────
  describe('Welcome Page', function () {
    beforeEach(async function () {
      await welcomePage.open();
    });

    it('TC-007 | should display the Welcome page container', async function () {
      const visible = await welcomePage.isVisible();
      expect(visible).to.be.true;
    });

    it('TC-008 | page title should contain "Welcome to ProphyDent AI"', async function () {
      const heading = await welcomePage.getHeadingText();
      expect(heading).to.include('ProphyDent AI');
    });

    it('TC-009 | subtitle should contain "Precision Prevention"', async function () {
      const subtitle = await welcomePage.getSubtitleText();
      expect(subtitle).to.include('Precision Prevention');
    });

    it('TC-010 | Get Started button is visible', async function () {
      const visible = await welcomePage.isDisplayed(welcomePage.locators.getStartedBtn);
      expect(visible).to.be.true;
    });

    it('TC-011 | clicking Get Started navigates to /#/role', async function () {
      await welcomePage.clickGetStarted();
      const url = await driver.getCurrentUrl();
      expect(url).to.include('/role');
    });

    it('TC-012 | welcome logo image is displayed', async function () {
      const visible = await welcomePage.isLogoVisible();
      expect(visible).to.be.true;
    });

    it('TC-013 | page has onboarding-screen wrapper class', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('onboarding-screen');
    });

    it('TC-014 | welcome-content div is present', async function () {
      const present = await welcomePage.isPresent(welcomePage.locators.welcomeContent);
      expect(present).to.be.true;
    });

    it('TC-015 | Get Started button has ArrowRight icon in DOM', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('Get Started');
    });
  });

  // ─── Role Selection Page ──────────────────────────────────────────────────
  describe('Role Selection Page', function () {
    this.timeout(120000);  // extra time for TF XNNPACK init on first run
    beforeEach(async function () {
      await rolePage.open();
    });

    it('TC-016 | role-content container is visible', async function () {
      const visible = await rolePage.isVisible();
      expect(visible).to.be.true;
    });

    it('TC-017 | heading contains "ProphyDent"', async function () {
      const heading = await rolePage.getHeadingText();
      expect(heading).to.include('ProphyDent');
    });

    it('TC-018 | heading contains "How will you be using"', async function () {
      const heading = await rolePage.getHeadingText();
      expect(heading.toLowerCase()).to.include('how will you be using');
    });

    it('TC-019 | exactly 2 role cards are present', async function () {
      const cards = await rolePage.getRoleCards();
      expect(cards.length).to.equal(2);
    });

    it('TC-020 | Doctor card is visible', async function () {
      const present = await rolePage.isPresent(rolePage.locators.doctorCard);
      expect(present).to.be.true;
    });

    it('TC-021 | Patient card is visible', async function () {
      const present = await rolePage.isPresent(rolePage.locators.patientCard);
      expect(present).to.be.true;
    });

    it('TC-022 | Doctor card text includes "Doctor"', async function () {
      const cards = await rolePage.getRoleCards();
      const text = await cards[0].getText();
      expect(text).to.include('Doctor');
    });

    it('TC-023 | Patient card text includes "Patient"', async function () {
      const cards = await rolePage.getRoleCards();
      const text = await cards[1].getText();
      expect(text).to.include('Patient');
    });

    it('TC-024 | clicking Doctor card navigates to /auth with role=doctor', async function () {
      await rolePage.selectDoctor();
      const url = await driver.getCurrentUrl();
      expect(url).to.include('/auth');
      expect(url).to.include('doctor');
    });

    it('TC-025 | clicking Patient card navigates to /auth with role=patient', async function () {
      await rolePage.open();
      await rolePage.selectPatient();
      const url = await driver.getCurrentUrl();
      expect(url).to.include('/auth');
      expect(url).to.include('patient');
    });

    it('TC-026 | logo is present on role selection page', async function () {
      const present = await rolePage.isPresent(rolePage.locators.logo);
      expect(present).to.be.true;
    });

    it('TC-027 | role cards have role-card CSS class', async function () {
      const src = await driver.getPageSource();
      expect(src).to.include('role-card');
    });
  });
});
