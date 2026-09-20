require('dotenv').config();
const http = require('http');
const app = require('../app');

async function testHttpEndpoints() {
  console.log('\n--- STARTING LIVE HTTP ROUTES VERIFICATION ---');

  const server = app.listen(0);
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  function makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: port,
          path: path,
          method: options.method || 'GET',
          headers: options.headers || {},
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
        }
      );
      req.on('error', reject);
      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  }

  let passed = 0;
  let failed = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
      failed++;
    }
  }

  try {
    // 1. Landing Page
    const homeRes = await makeRequest('/');
    assert(homeRes.status === 200, `GET / returned 200 (was ${homeRes.status})`);
    assert(homeRes.body.includes('Hostel Room Allotment & Mess Management'), 'Landing page contains title');

    // 2. Login Page
    const loginRes = await makeRequest('/login');
    assert(loginRes.status === 200, `GET /login returned 200 (was ${loginRes.status})`);
    assert(loginRes.body.includes('Sign In'), 'Login page renders sign in form');

    // 3. Register Page
    const registerRes = await makeRequest('/register');
    assert(registerRes.status === 200, `GET /register returned 200 (was ${registerRes.status})`);
    assert(registerRes.body.includes('Student Registration'), 'Register page renders form');

    // 4. Auth Guard on Student Route
    const studentGuardRes = await makeRequest('/student/dashboard');
    assert(studentGuardRes.status === 302, `Unauthenticated GET /student/dashboard redirected 302 (was ${studentGuardRes.status})`);
    assert(studentGuardRes.headers.location === '/login', 'Redirects to /login');

    // 5. Auth Guard on Admin Route
    const adminGuardRes = await makeRequest('/admin/dashboard');
    assert(adminGuardRes.status === 302, `Unauthenticated GET /admin/dashboard redirected 302 (was ${adminGuardRes.status})`);
    assert(adminGuardRes.headers.location === '/login', 'Redirects to /login');

    // 6. Test Admin Login
    console.log('\n--- Testing Authentication Flow ---');
    const adminLoginBody = 'email=admin%40hostel.com&password=Admin%40123';
    const loginAttempt = await makeRequest('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(adminLoginBody),
      },
      body: adminLoginBody,
    });

    assert(loginAttempt.status === 302, `Admin login returned 302 redirect (was ${loginAttempt.status})`);
    assert(loginAttempt.headers.location === '/admin/dashboard', 'Admin login redirects to /admin/dashboard');

    // Extract Session Cookie
    const rawCookies = loginAttempt.headers['set-cookie'];
    assert(rawCookies && rawCookies.length > 0, 'Session cookie was issued');
    const sessionCookie = rawCookies[0].split(';')[0];

    // 7. Test Authenticated Admin Dashboard with Session Cookie
    const adminDashboardRes = await makeRequest('/admin/dashboard', {
      headers: { Cookie: sessionCookie },
    });
    assert(adminDashboardRes.status === 200, `Authenticated GET /admin/dashboard returned 200 (was ${adminDashboardRes.status})`);
    assert(adminDashboardRes.body.includes('Warden & Administrator Dashboard'), 'Admin dashboard HTML rendered');
    assert(adminDashboardRes.body.includes('Block-Wise Occupancy Overview'), 'Admin dashboard contains occupancy table');

    // 8. Test Admin Accessing Student Directory
    const studentsRes = await makeRequest('/admin/students', {
      headers: { Cookie: sessionCookie },
    });
    assert(studentsRes.status === 200, `GET /admin/students returned 200`);
    assert(studentsRes.body.includes('Aarav Patel'), 'Student directory includes Aarav Patel');

    // 9. Test Student Login Flow
    const studentLoginBody = 'email=student1%40example.com&password=Student%40123';
    const stuLoginAttempt = await makeRequest('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(studentLoginBody),
      },
      body: studentLoginBody,
    });
    assert(stuLoginAttempt.status === 302, `Student login returned 302 redirect`);
    assert(stuLoginAttempt.headers.location === '/student/dashboard', 'Student redirects to /student/dashboard');

    const stuCookie = stuLoginAttempt.headers['set-cookie'][0].split(';')[0];
    const stuDashboardRes = await makeRequest('/student/dashboard', {
      headers: { Cookie: stuCookie },
    });
    assert(stuDashboardRes.status === 200, `Authenticated GET /student/dashboard returned 200`);
    assert(stuDashboardRes.body.includes('Room Allotted: Block A'), 'Student dashboard shows allotted room');

    // 10. Test Student Prevented from Accessing Admin Routes
    const stuUnauthorizedAdmin = await makeRequest('/admin/dashboard', {
      headers: { Cookie: stuCookie },
    });
    assert(stuUnauthorizedAdmin.status === 302, 'Student unauthorized to view /admin/dashboard (redirected 302)');
    assert(stuUnauthorizedAdmin.headers.location === '/student/dashboard', 'Student redirected back to /student/dashboard');

    console.log(`\n======================================================`);
    console.log(`HTTP TESTS COMPLETE: ${passed} Passed, ${failed} Failed.`);
    console.log(`======================================================`);

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('HTTP Test Exception:', err);
    server.close();
    process.exit(1);
  }
}

testHttpEndpoints();
