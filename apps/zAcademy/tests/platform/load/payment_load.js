import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    steady_authorize: {
      executor: 'constant-arrival-rate',
      rate: 120,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 40,
      maxVUs: 120,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500', 'p(99)<1200'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8084';
const TOKEN = __ENV.TOKEN || 'dev-token';

export default function () {
  const payload = JSON.stringify({
    payment_id: `p-${__VU}-${__ITER}`,
    user_id: `u-${__VU}`,
    amount_minor: 4200,
    currency: 'USD',
    merchant_id: 'M-001',
    country_code: 'US',
  });

  const res = http.post(`${BASE_URL}/v1/payments/authorize`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
      'X-Request-ID': `k6-${__VU}-${__ITER}`,
    },
    timeout: '3s',
  });

  check(res, {
    'status is 200|202': (r) => r.status === 200 || r.status === 202,
  });

  sleep(0.1);
}
