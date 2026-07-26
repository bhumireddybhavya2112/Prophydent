const { expect } = require('chai');
const ApiClient = require('../../src/api/ApiClient');
const credentials = require('../../test-data/credentials.json');
const logger = require('../../src/utils/Logger');

describe('API: Supabase Database REST Endpoints', () => {
    let token = null;

    before(async () => {
        // Authenticate doctor once to get JWT token
        const { email, password } = credentials.users.doctor.valid;
        const response = await ApiClient.supabase.login(email, password);
        if (response.status === 200) {
            token = response.data.access_token;
        }
    });

    describe('GET /rest/v1/clinical_patients (Fetch Roster)', () => {
        
        it('TC-API-101 | Fetch patients succeeds with valid Doctor Bearer token', async () => {
            logger.info('Executing TC-API-101');
            if (!token) throw new Error('Auth token setup failed');

            const response = await ApiClient.supabase.getPatients(token);
            expect(response.status).to.equal(200);
            expect(response.data).to.be.an('array');
            
            // Schema validation
            if (response.data.length > 0) {
                const firstRow = response.data[0];
                expect(firstRow).to.have.property('id');
                expect(firstRow).to.have.property('full_name');
                expect(firstRow).to.have.property('dob');
            }
        });

        it('TC-API-102 | Fetch patients fails with missing Authorization header', async () => {
            logger.info('Executing TC-API-102');
            const response = await ApiClient.supabase.getPatients(null); // Passing null token
            expect(response.status).to.be.oneOf([401, 403]);
        });

        it('TC-API-103 | Fetch patients fails with invalid/tampered Bearer token', async () => {
            logger.info('Executing TC-API-103');
            const response = await ApiClient.supabase.getPatients('invalid.jwt.token.string');
            expect(response.status).to.be.oneOf([401, 403]);
        });
    });

    describe('POST /rest/v1/clinical_patients (Insert Patient)', () => {

        it('TC-API-104 | Creating patient succeeds with valid payload and token', async () => {
            logger.info('Executing TC-API-104');
            if (!token) throw new Error('Auth token setup failed');

            const uniqueName = `ApiPatient_${Date.now()}`;
            const patientPayload = {
                full_name: uniqueName,
                dob: '1990-05-15',
                email: 'apipatient@example.com',
                phone: '5557891234',
                status: 'Active'
            };

            const response = await ApiClient.supabase.createPatient(token, patientPayload);
            expect(response.status).to.be.oneOf([200, 201]);
            
            if (response.data && response.data.length > 0) {
                expect(response.data[0].full_name).to.equal(uniqueName);
            }
        });

        it('TC-API-105 | Creating patient fails with empty body parameters', async () => {
            logger.info('Executing TC-API-105');
            if (!token) throw new Error('Auth token setup failed');

            try {
                const response = await ApiClient.supabase.dbClient.post('/clinical_patients', {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                expect(response.status).to.be.oneOf([400, 422]);
            } catch (e) {
                expect(e.response.status).to.be.oneOf([400, 422]);
            }
        });
    });
});
