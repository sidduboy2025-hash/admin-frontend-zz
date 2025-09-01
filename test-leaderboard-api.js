// Test script to verify the leaderboard API endpoint for different years
// Run this in browser console or as a Node.js script

const testLeaderboardAPI = async () => {
  try {
    console.log('Testing leaderboard API...');
    
    // First, login to get the token
    const loginResponse = await fetch('http://localhost:4000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'principal-viit',
        password: 'principal-viit'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('Login successful, token obtained');

    // Test leaderboard for 2026 (working year)
    console.log('\n--- Testing 2026 (working year) ---');
    const response2026 = await fetch('http://localhost:4000/api/admin/overall-leaderboard/2026', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('2026 Response status:', response2026.status);
    if (response2026.ok) {
      const data2026 = await response2026.json();
      console.log('2026 Response data:', data2026);
      console.log('2026 Total students:', data2026.totalStudentsEvaluated);
      console.log('2026 Leaderboard length:', data2026.overallLeaderboard?.length);
    } else {
      const errorText2026 = await response2026.text();
      console.error('2026 Request failed:', errorText2026);
    }

    // Test leaderboard for 2028 (problematic year)
    console.log('\n--- Testing 2028 (problematic year) ---');
    const response2028 = await fetch('http://localhost:4000/api/admin/overall-leaderboard/2028', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('2028 Response status:', response2028.status);
    if (response2028.ok) {
      const data2028 = await response2028.json();
      console.log('2028 Response data:', data2028);
      console.log('2028 Total students:', data2028.totalStudentsEvaluated);
      console.log('2028 Leaderboard length:', data2028.overallLeaderboard?.length);
    } else {
      const errorText2028 = await response2028.text();
      console.error('2028 Request failed:', errorText2028);
    }

    // Test with different data types (string vs number)
    console.log('\n--- Testing 2028 as string ---');
    const response2028String = await fetch('http://localhost:4000/api/admin/overall-leaderboard/"2028"', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('2028 String Response status:', response2028String.status);
    if (response2028String.ok) {
      const data2028String = await response2028String.json();
      console.log('2028 String Response data:', data2028String);
    } else {
      const errorText2028String = await response2028String.text();
      console.error('2028 String Request failed:', errorText2028String);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
testLeaderboardAPI();
