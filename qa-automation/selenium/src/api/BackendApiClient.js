const axios = require('axios');
const logger = require('../utils/Logger');

class BackendApiClient {
    constructor() {
        this.baseUrl = 'http://localhost:5000'; // Default local Flask server URL
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 30000, // Inference might take longer
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Sends a dental image payload to Flask YOLO server for analysis
     * @param {string} base64Image base64 encoded image string (without data:image/jpeg prefix)
     * @param {string} role 'doctor' or 'patient'
     */
    async analyzeImage(base64Image, role = 'doctor') {
        logger.info(`API: Sending inference request to Flask backend /analyze (role: ${role})`);
        try {
            const response = await this.client.post('/analyze', {
                image: base64Image,
                role: role
            });
            return response;
        } catch (error) {
            logger.error(`API: Flask inference request failed - ${error.message}`);
            return error.response;
        }
    }
}

module.exports = new BackendApiClient();
