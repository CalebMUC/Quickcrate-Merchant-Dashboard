// One-time cleanup script to ensure no mock tokens remain
if (typeof window !== 'undefined') {
  console.log('🧹 CLEANUP: Removing all mock tokens and data');
  
  // List of all possible mock-related keys
  const mockKeys = [
    'mock-jwt-token',
    'mock-jwt-token-1760676387746',
    'mock_user_data',
    'mock_refresh_token',
    'auth_token', // old key
    'mock-user',
    'temp-password'
  ];
  
  // Remove all mock keys
  mockKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`🗑️ CLEANUP: Removing ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  // Check for any remaining keys with 'mock' in the name
  Object.keys(localStorage).forEach(key => {
    if (key.toLowerCase().includes('mock')) {
      console.log(`🗑️ CLEANUP: Removing additional mock key: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ CLEANUP: Complete - All mock data removed');
  console.log('🚀 READY: Using real backend API at https://localhost:7270/api');
}