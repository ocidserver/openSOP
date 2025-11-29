// Test SOP API endpoint
const baseURL = 'http://localhost:3000/api';

async function testSOPEndpoint() {
  console.log('🧪 Testing SOP API Endpoint\n');
  
  try {
    // Test 1: Get all SOPs
    console.log('1️⃣  GET /api/sop (all SOPs)');
    const response = await fetch(`${baseURL}/sop?page=1&limit=10`);
    const data = await response.json();
    
    console.log('   Status:', response.status);
    console.log('   Success:', data.success);
    console.log('   Total SOPs:', data.data?.pagination?.total || 0);
    console.log('   Returned:', data.data?.sops?.length || 0);
    
    if (data.data?.sops?.length > 0) {
      console.log('\n   📄 Sample SOP:');
      const sop = data.data.sops[0];
      console.log('   - ID:', sop.id);
      console.log('   - Number:', sop.sopNumber);
      console.log('   - Title:', sop.title);
      console.log('   - Status:', sop.status);
      console.log('   - Department:', sop.department?.name);
      console.log('   - Categories:', sop.categories?.length || 0);
    }
    
    console.log('\n✅ Test completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSOPEndpoint();
