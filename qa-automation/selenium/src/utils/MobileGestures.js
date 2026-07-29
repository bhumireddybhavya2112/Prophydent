const logger = require('./Logger');

class MobileGestures {
    /**
     * Performs a tap action at specific coordinates
     */
    async tap(x, y) {
        logger.info(`Appium: Tapping at coordinates X: ${x}, Y: ${y}`);
        await driver.action('pointer', { parameters: { pointerType: 'touch' } })
            .move({ duration: 0, x, y })
            .down({ button: 0 })
            .up({ button: 0 })
            .perform();
    }

    /**
     * Performs a double tap at specific coordinates
     */
    async doubleTap(x, y) {
        logger.info(`Appium: Double tapping at coordinates X: ${x}, Y: ${y}`);
        await driver.action('pointer', { parameters: { pointerType: 'touch' } })
            .move({ duration: 0, x, y }).down({ button: 0 }).up({ button: 0 })
            .pause(100)
            .down({ button: 0 }).up({ button: 0 })
            .perform();
    }

    /**
     * Performs a long press at specific coordinates for a duration (ms)
     */
    async longPress(x, y, duration = 1500) {
        logger.info(`Appium: Long pressing at X: ${x}, Y: ${y} for ${duration}ms`);
        await driver.action('pointer', { parameters: { pointerType: 'touch' } })
            .move({ duration: 0, x, y })
            .down({ button: 0 })
            .pause(duration)
            .up({ button: 0 })
            .perform();
    }

    /**
     * Performs a swipe gesture from start coordinates to end coordinates
     */
    async swipe(startX, startY, endX, endY, duration = 800) {
        logger.info(`Appium: Swiping from (${startX}, ${startY}) to (${endX}, ${endY})`);
        await driver.action('pointer', { parameters: { pointerType: 'touch' } })
            .move({ duration: 0, x: startX, y: startY })
            .down({ button: 0 })
            .move({ duration, x: endX, y: endY })
            .up({ button: 0 })
            .perform();
    }

    /**
     * Scrolls down on the screen using swipe
     */
    async scrollDown() {
        const { width, height } = await driver.getWindowSize();
        const startX = Math.floor(width / 2);
        const startY = Math.floor(height * 0.8);
        const endY = Math.floor(height * 0.2);
        await this.swipe(startX, startY, startX, endY);
    }

    /**
     * Scrolls up on the screen using swipe
     */
    async scrollUp() {
        const { width, height } = await driver.getWindowSize();
        const startX = Math.floor(width / 2);
        const startY = Math.floor(height * 0.2);
        const endY = Math.floor(height * 0.8);
        await this.swipe(startX, startY, startX, endY);
    }

    /**
     * Drags an element from source coordinates to target coordinates
     */
    async dragAndDrop(startX, startY, endX, endY) {
        logger.info(`Appium: Dragging from (${startX}, ${startY}) and dropping at (${endX}, ${endY})`);
        await this.swipe(startX, startY, endX, endY, 1500);
    }
}

module.exports = new MobileGestures();
