'use strict';

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class RoleSelectionPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      roleContent: By.css('.role-content'),
      heading:     By.css('.role-content h2'),
      roleCards:   By.css('.role-card'),
      doctorCard:  By.xpath("//div[contains(@class,'role-card')][.//h3[contains(text(),'Doctor')]]"),
      patientCard: By.xpath("//div[contains(@class,'role-card')][.//h3[contains(text(),'Patient')]]"),
      logo:        By.css('.small-logo')
    };
  }

  async open() {
    await this.navigate('/#/role');
    await this.waitForElement(this.locators.roleContent, 15000);
    await this.sleep(400);
  }

  async isVisible()      { return this.isDisplayed(this.locators.roleContent); }
  async getHeadingText() { return this.getText(this.locators.heading); }
  async getRoleCards()   { return this.findElements(this.locators.roleCards); }

  /**
   * Select the Doctor role card.
   * Total budget: ~35 s (15 s click+poll + 20 s waitForUrl) × 2 retries = 70 s < 120 s timeout.
   */
  async selectDoctor() {
    await this._invokeReactOnClick(this.locators.doctorCard);
    await this.waitForUrl('/auth', 20000);
  }

  async selectPatient() {
    await this._invokeReactOnClick(this.locators.patientCard);
    await this.waitForUrl('/auth', 20000);
  }

  /**
   * Invoke React's onClick handler directly via __reactProps$ key (React 18).
   *
   * Why not dispatchEvent / Selenium click:
   * Chrome background tasks (TF XNNPACK ~20 s, GCM registration ~5 s each)
   * block Chrome's main-thread event processing, so synthetic DOM events
   * queue up and fire only after those tasks finish.  Calling the React prop
   * function directly bypasses that queue entirely.
   *
   * Budget: 1 click invocation + 15 s URL poll = ~15 s per call.
   */
  async _invokeReactOnClick(locator) {
    await this.waitForElement(locator, 15000);

    // Fire the React onClick once
    try {
      const el = await this.driver.findElement(locator);
      await this.driver.executeScript(`
        var card = arguments[0];
        // React 18: direct props key
        var pk = Object.keys(card).find(function(k){ return k.startsWith('__reactProps'); });
        if (pk && card[pk] && typeof card[pk].onClick === 'function') {
          card[pk].onClick({ preventDefault: function(){}, stopPropagation: function(){} });
          return;
        }
        // Fallback: fiber walk
        var fk = Object.keys(card).find(function(k){ return k.startsWith('__reactFiber'); });
        if (fk) {
          var f = card[fk], depth = 0;
          while (f && depth < 20) {
            if (f.memoizedProps && typeof f.memoizedProps.onClick === 'function') {
              f.memoizedProps.onClick({ preventDefault: function(){}, stopPropagation: function(){} });
              return;
            }
            f = f.return;
            depth++;
          }
        }
      `, el);
    } catch (e) {
      // Element re-rendered or session issue — waitForUrl will catch it
    }

    // Poll for navigation for up to 15 s before handing off to waitForUrl()
    for (let i = 0; i < 75; i++) {
      await this.sleep(200);
      try {
        if ((await this.driver.getCurrentUrl()).includes('/auth')) return;
      } catch (e) {
        return; // Dead session — let caller handle
      }
    }
    // No navigation yet — waitForUrl in the caller will either succeed or fail cleanly
  }
}

module.exports = RoleSelectionPage;
