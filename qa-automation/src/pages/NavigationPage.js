const BasePage = require('./BasePage');
const logger = require('../utils/Logger');

class NavigationPage extends BasePage {
    // ----------------------------------------------------------------------
    // Selectors
    // ----------------------------------------------------------------------
    get sidebar() { return $('.sidebar'); }
    get navItems() { return $$('.nav-item'); }
    
    // Dynamic getter for specific nav items by text
    async getNavItemByText(text) {
        const items = await this.navItems;
        for (let item of items) {
            const itemText = await item.getText();
            if (itemText.includes(text)) {
                return item;
            }
        }
        return null;
    }

    // User Profile in Sidebar
    get userProfile() { return $('.user-profile'); }
    get userName() { return $('.user-name'); }
    get userRole() { return $('.user-role'); }
    get btnSignOut() { return $('.sign-out-btn'); }

    // Header
    get header() { return $('.header'); }
    get mobileLogo() { return $('.mobile-logo'); }

    // ----------------------------------------------------------------------
    // Methods
    // ----------------------------------------------------------------------

    /**
     * Clicks a specific navigation link
     * @param {string} linkText 
     */
    async clickNav(linkText) {
        logger.info(`Clicking sidebar navigation item: ${linkText}`);
        const el = await this.getNavItemByText(linkText);
        if (!el) throw new Error(`Navigation item containing text '${linkText}' not found`);
        await this.clickElement(el);
    }

    /**
     * Signs out the user
     */
    async signOut() {
        logger.info('Signing out the user');
        await this.clickElement(this.btnSignOut);
    }

    /**
     * Validates if a specific navigation item is present
     * @param {string} linkText 
     */
    async isNavPresent(linkText) {
        const el = await this.getNavItemByText(linkText);
        return el !== null;
    }
}

module.exports = new NavigationPage();
