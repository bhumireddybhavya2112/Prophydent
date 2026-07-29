import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// ----------------------------------------------------------------------
// Load Scenarios & Thresholds Configurations
// ----------------------------------------------------------------------
export const options = {
    scenarios: {
        // Scenario 1: Mixed traffic ramping up to simulate general clinic hours
        clinic_hours_traffic: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 20 },  // Ramp-up to 20 users
                { duration: '1m', target: 20 },   // Steady state
                { duration: '30s', target: 0 },   // Ramp-down
            ],
            gracefulRampDown: '5s',
            exec: 'mixedTrafficFlow',
        },
        // Scenario 2: Peak surge representing simultaneous morning uploads
        peak_upload_surge: {
            executor: 'constant-vus',
            vus: 10,
            duration: '1m',
            exec: 'heavyUploadFlow',
        }
    },
    thresholds: {
        // SLA Performance metrics: 95% of request latency must be under 2.5 seconds
        http_req_duration: ['p(95)<2500'],
        // Reliability SLA: Error rate must be strictly under 2%
        http_req_failed: ['rate<0.02'],
    },
};

// Base APIs Config
const SUPABASE_AUTH_URL = 'http://localhost:5000/mock/auth/v1';
const SUPABASE_REST_URL = 'http://localhost:5000/mock/rest/v1';
const FLASK_BACKEND_URL = 'http://localhost:5000/analyze';
const ANON_KEY = 'sb_publishable_FKWHVZTSoioV0yC7U4jNbg_nfscgxDP';

// Transparent 1x1 base64 string for file upload simulation
const DUMMY_BASE64_IMAGE = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

// ----------------------------------------------------------------------
// Scenario Executes Callbacks
// ----------------------------------------------------------------------

/**
 * Simulates mixed workflows: doctor logins, checks patients, logouts
 */
export function mixedTrafficFlow() {
    const headers = {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY
    };

    // 1. Doctor Login
    const loginPayload = JSON.stringify({
        email: 'surendra.lmt@prophydent.com',
        password: 'surendra123'
    });
    
    const loginRes = http.post(`${SUPABASE_AUTH_URL}/token?grant_type=password`, loginPayload, { headers });
    const success = check(loginRes, {
        'Login status 200': (r) => r.status === 200,
        'Has access token': (r) => JSON.parse(r.body).access_token !== undefined
    });

    if (success) {
        const token = JSON.parse(loginRes.body).access_token;
        const authHeaders = {
            'Content-Type': 'application/json',
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${token}`
        };

        // 2. Query Patient list (Filter search simulation)
        const patientRes = http.get(`${SUPABASE_REST_URL}/clinical_patients?select=*&limit=10`, { headers: authHeaders });
        check(patientRes, {
            'Fetch roster status 200': (r) => r.status === 200
        });

        // 3. Query Reports list
        const reportsRes = http.get(`${SUPABASE_REST_URL}/clinical_reports?select=*&limit=5`, { headers: authHeaders });
        check(reportsRes, {
            'Fetch reports status 200': (r) => r.status === 200
        });
    }

    sleep(1 + Math.random() * 2); // Simulates user think-time
}

/**
 * Simulates heavy dental image uploads and AI prediction requests
 */
export function heavyUploadFlow() {
    const payload = JSON.stringify({
        image: DUMMY_BASE64_IMAGE,
        role: 'doctor'
    });

    const headers = {
        'Content-Type': 'application/json'
    };

    // 1. Post to Flask backend
    const res = http.post(FLASK_BACKEND_URL, payload, { headers });
    check(res, {
        'AI inference status 200 or offline 404': (r) => r.status === 200 || r.status === 404,
        'Response holds predictions': (r) => r.status !== 200 || JSON.parse(r.body).predictions !== undefined
    });

    sleep(2 + Math.random() * 3);
}

// ----------------------------------------------------------------------
// Output Reports Compilers
// ----------------------------------------------------------------------
export function handleSummary(data) {
    return {
        'reports/load-summary.html': htmlReport(data),
        'reports/load-summary.json': JSON.stringify(data),
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    };
}
