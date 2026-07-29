const axios = require('axios');
const logger = require('../utils/Logger');

class SupabaseApiClient {
    constructor() {
        this.supabaseUrl = 'https://ljbrwrpapbmdglpzbpon.supabase.co';
        this.anonKey = 'sb_publishable_FKWHVZTSoioV0yC7U4jNbg_nfscgxDP';
        
        // GoTrue Auth Client
        this.authClient = axios.create({
            baseURL: `${this.supabaseUrl}/auth/v1`,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.anonKey
            }
        });

        // PostgREST Database Client
        this.dbClient = axios.create({
            baseURL: `${this.supabaseUrl}/rest/v1`,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.anonKey,
                'Prefer': 'return=representation'
            }
        });
    }

    /**
     * Authenticates a user and returns GoTrue token payload
     */
    async login(email, password) {
        logger.info(`API: Requesting Supabase Auth token for ${email}`);
        try {
            const response = await this.authClient.post('/token?grant_type=password', {
                email,
                password
            });
            return response;
        } catch (error) {
            logger.error(`API: Supabase Auth failed - ${error.message}`);
            return error.response;
        }
    }

    /**
     * Signs up a new user via Supabase Auth
     */
    async signUp(email, password, metadata = {}) {
        logger.info(`API: Registering new user ${email} in Supabase`);
        try {
            const response = await this.authClient.post('/signup', {
                email,
                password,
                data: metadata
            });
            return response;
        } catch (error) {
            logger.error(`API: Supabase signup failed - ${error.message}`);
            return error.response;
        }
    }

    /**
     * Retrieves the clinical patients roster (requires Bearer Token)
     */
    async getPatients(token) {
        logger.info('API: Fetching patients roster from clinical_patients table');
        try {
            const response = await this.dbClient.get('/clinical_patients?select=*', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response;
        } catch (error) {
            logger.error(`API: Fetch patients failed - ${error.message}`);
            return error.response;
        }
    }

    /**
     * Inserts a new patient record (requires Bearer Token)
     */
    async createPatient(token, patientData) {
        logger.info(`API: Inserting new patient ${patientData.full_name} into clinical_patients`);
        try {
            const response = await this.dbClient.post('/clinical_patients', patientData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response;
        } catch (error) {
            logger.error(`API: Create patient failed - ${error.message}`);
            return error.response;
        }
    }

    /**
     * Retrieves clinical reports (requires Bearer Token)
     */
    async getReports(token) {
        logger.info('API: Fetching clinical reports from clinical_reports table');
        try {
            const response = await this.dbClient.get('/clinical_reports?select=*', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response;
        } catch (error) {
            logger.error(`API: Fetch reports failed - ${error.message}`);
            return error.response;
        }
    }
}

module.exports = new SupabaseApiClient();
