const baseURL = 'http://localhost:3000/api';
let authToken = '';

console.log('\n=== Testing openSOP Backend API ===\n');

async function fetchAPI(endpoint, options = {}) {
  const url = `${baseURL}${endpoint}`;
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }
  return data;
}

async function testAPI() {
  try {
    // Test 1: Login
    console.log('1. Testing Login...');
    const loginResponse = await fetchAPI('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@bps.go.id',
        password: 'admin123'
      })
    });
    
    authToken = loginResponse.data.token;
    console.log('   ✓ Login successful!');
    console.log(`   User: ${loginResponse.data.user.fullName}`);
    console.log(`   Role: ${loginResponse.data.user.role}\n`);

    const headers = { 
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    // Test 2: Get Actors
    console.log('2. Testing GET /api/actors...');
    const actorsResponse = await fetchAPI('/actors', { headers });
    console.log('   ✓ Success!');
    console.log(`   Total actors: ${actorsResponse.data.pagination.total}\n`);

    // Test 3: Get Actor Statistics
    console.log('3. Testing GET /api/actors/statistics...');
    const statsResponse = await fetchAPI('/actors/statistics', { headers });
    console.log('   ✓ Success!');
    console.log(`   Total: ${statsResponse.data.total}`);
    console.log(`   Active: ${statsResponse.data.active}\n`);

    // Test 4: Get Evaluations
    console.log('4. Testing GET /api/evaluations...');
    const evaluationsResponse = await fetchAPI('/evaluations', { headers });
    console.log('   ✓ Success!');
    console.log(`   Total evaluations: ${evaluationsResponse.data.pagination.total}\n`);

    // Test 5: Get Monitoring Dashboard
    console.log('5. Testing GET /api/monitoring/dashboard...');
    const dashboardResponse = await fetchAPI('/monitoring/dashboard', { headers });
    console.log('   ✓ Success!');
    console.log(`   Total SOPs: ${dashboardResponse.data.kpis.totalSOPs}`);
    console.log(`   Compliance Rate: ${dashboardResponse.data.kpis.complianceRate}%\n`);

    // Test 6: Get Profile
    console.log('6. Testing GET /api/profile...');
    const profileResponse = await fetchAPI('/profile', { headers });
    console.log('   ✓ Success!');
    console.log(`   Name: ${profileResponse.data.fullName}`);
    console.log(`   Email: ${profileResponse.data.email}`);
    console.log(`   Department: ${profileResponse.data.department.name}\n`);

    // Test 7: Get Departments
    console.log('7. Testing GET /api/departments...');
    const departmentsResponse = await fetchAPI('/departments', { headers });
    console.log('   ✓ Success!');
    console.log(`   Total departments: ${departmentsResponse.data.length}\n`);

    // Test 8: Get Categories
    console.log('8. Testing GET /api/categories...');
    const categoriesResponse = await fetchAPI('/categories', { headers });
    console.log('   ✓ Success!');
    console.log(`   Total categories: ${categoriesResponse.data.length}\n`);

    // Test 9: Get SOPs
    console.log('9. Testing GET /api/sop...');
    const sopsResponse = await fetchAPI('/sop', { headers });
    console.log('   ✓ Success!');
    console.log(`   Total SOPs: ${sopsResponse.data.pagination.total}\n`);

    console.log('=== All Tests Passed! ===\n');
    process.exit(0);

  } catch (error) {
    console.error('   ✗ Test failed:', error.message);
    process.exit(1);
  }
}

testAPI();
