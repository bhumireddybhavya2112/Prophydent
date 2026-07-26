const logger = require('../utils/Logger');

module.exports = class BasePage {
    /**
     * Opens a sub page of the page
     * @param path path of the sub page (e.g. /path/to/page.html)
     */
    async open(path) {
        logger.info(`Navigating to URL: /${path}`);
        return browser.url(`/${path}`);
    }

    /**
     * Wait for an element to be visible
     * @param {WebdriverIO.Element} element 
     * @param {number} timeout 
     */
    async waitForElement(element, timeout = 10000) {
        await element.waitForDisplayed({ timeout });
    }

    /**
     * Click an element safely
     * @param {WebdriverIO.Element} element 
     */
    async clickElement(element) {
        await this.waitForElement(element);
        await element.click();
    }

    /**
     * Type text into an element safely
     * @param {WebdriverIO.Element} element 
     * @param {string} text 
     */
    async typeText(element, text) {
        await this.waitForElement(element);
        await element.setValue(text);
    }
};
