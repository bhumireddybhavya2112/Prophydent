const logger = require('../../utils/Logger');

class BaseMobilePage {
    /**
     * Wait for an element to be displayed (cross-context)
     */
    async waitForElement(element, timeout = 15000) {
        await element.waitForDisplayed({ timeout });
    }

    /**
     * Safely clicks an element
     */
    async clickElement(element) {
        await this.waitForElement(element);
        await element.click();
    }

    /**
     * Safely sets input text value
     */
    async typeText(element, text) {
        await this.waitForElement(element);
        await element.setValue(text);
    }

    /**
     * Switches Appium driver to WebView context for hybrid web element interactions
     */
    async switchToWebViewContext() {
        logger.info('Appium: Switching to WebView context');
        const contexts = await driver.getContexts();
        logger.info(`Appium: Available contexts: ${JSON.stringify(contexts)}`);
        
        // Find webview context
        const webview = contexts.find(c => c.includes('WEBVIEW') || c.includes('webview'));
        if (webview) {
            await driver.switchContext(webview);
            logger.info(`Appium: Successfully switched context to: ${webview}`);
        } else {
            throw new Error('WebView context was not found in active session context list');
        }
    }

    /**
     * Switches Appium driver back to Native App context for system level dialogue triggers
     */
    async switchToNativeContext() {
        logger.info('Appium: Switching context back to native wrapper');
        await driver.switchContext('NATIVE_APP');
        logger.info('Appium: Switched context to NATIVE_APP');
    }

    /**
     * Native Android locator for permission buttons
     */
    get btnNativeAllowPermission() { 
        return $('//android.widget.Button[@resource-id="com.android.permissioncontroller:id/permission_allow_button" or @text="Allow" or @text="WHILE USING THE APP" or contains(@text, "Allow")]'); 
    }
    
    get btnNativeAllowAlwaysPermission() {
        return $('//android.widget.Button[@resource-id="com.android.permissioncontroller:id/permission_allow_always_button" or @text="Allow all the time"]');
    }

    /**
     * Explicitly clicks the permission dialog confirmation button if displayed
     */
    async handlePermissionDialogIfShown() {
        await this.switchToNativeContext();
        try {
            if (await this.btnNativeAllowPermission.waitForDisplayed({ timeout: 5000 })) {
                logger.info('Appium Native: Permission dialog detected, clicking Allow');
                await this.btnNativeAllowPermission.click();
            }
        } catch (e) {
            logger.info('Appium Native: No permissions dialog displayed on current screen transition');
        }
        await this.switchToWebViewContext();
    }
}

module.exports = BaseMobilePage;
