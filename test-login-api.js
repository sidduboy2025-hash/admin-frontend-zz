// Test script to verify the login API endpoint
// Run this in browser console or as a Node.js script

const testLoginAPI = async () => {
  try {
    console.log('Testing login API...');
    
    const response = await fetch('http://localhost:4000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'principal-viit',
        password: 'principal-viit'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (response.ok) {
      const data = await response.json();
      console.log('Login successful!');
      console.log('Response data:', data);
      
      // Test token verification if endpoint exists
      if (data.token) {
        console.log('Testing token verification...');
        const verifyResponse = await fetch('http://localhost:4000/api/admin/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Verify response status:', verifyResponse.status);
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('Token verification successful:', verifyData);
        } else {
          console.log('Token verification failed or endpoint not implemented');
        }
      }
    } else {
      const errorText = await response.text();
      console.error('Login failed:', errorText);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
testLoginAPI();
