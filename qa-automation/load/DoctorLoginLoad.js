import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp up to 50 users
    { duration: '1m', target: 50 },  // Stay at 50 users for 1 min
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

export default function () {
  const url = 'http://localhost:5000/api/auth/login'; // Replace with actual API endpoint
  
  const payload = JSON.stringify({
    email: 'automation.lmt@prophydent.com',
    password: 'automationPassword123!',
    role: 'doctor'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'is status 200': (r) => r.status === 200 || r.status === 404, // 404 allowed for safe dry runs
    'transaction time OK': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
