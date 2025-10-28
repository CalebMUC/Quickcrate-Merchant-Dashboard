// Simple API test to check if backend is running and accessible
async function testAPI() {
  const API_URL = 'https://localhost:7270/api';
  
  console.log('🔍 Testing API connectivity...');
  console.log('API URL:', API_URL);
  
  try {
    // Test basic connectivity
    const response = await fetch(`${API_URL}/Products/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You might need to add Authorization header with a valid token
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify({
        Page: 1,
        PageSize: 10,
        SortBy: 'CreatedOn',
        SortDirection: 'DESC'
      })
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Error Response:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Network Error:', error);
  }
}

testAPI();