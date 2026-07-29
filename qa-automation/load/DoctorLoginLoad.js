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
  const url = 'http://localhost:5000/mock/auth/v1/token?grant_type=password';
  const ANON_KEY = 'sb_publishable_FKWHVZTSoioV0yC7U4jNbg_nfscgxDP';
  
  const payload = JSON.stringify({
    email: 'surendra.lmt@prophydent.com',
    password: 'surendra123'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'is status 200': (r) => r.status === 200,
    'transaction time OK': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
