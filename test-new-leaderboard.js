// Test the new leaderboard implementation
// Run this in browser console

const testNewLeaderboard = async () => {
  try {
    console.log('Testing new leaderboard implementation...');
    
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

    // Test the students endpoint directly (this should work)
    console.log('\n--- Testing students endpoint for 2028 ---');
    const studentsResponse = await fetch('http://localhost:4000/api/students?year=2028', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (studentsResponse.ok) {
      const studentsData = await studentsResponse.json();
      console.log('Students 2028 Response:', studentsData);
      console.log('Total students in 2028:', studentsData.length);
      
      // Count students with scores
      const studentsWithScores = studentsData.filter(student => {
        const totalScore = student.assignedTests?.reduce((total, test) => {
          const marks = Object.values(test.marks || {});
          return total + marks.reduce((sum, mark) => sum + (typeof mark === 'number' ? mark : 0), 0);
        }, 0) || 0;
        return totalScore > 0;
      });
      
      console.log('Students with scores > 0:', studentsWithScores.length);
      
      if (studentsWithScores.length > 0) {
        console.log('Sample student with scores:', studentsWithScores[0]);
      }
    } else {
      const errorText = await studentsResponse.text();
      console.error('Students request failed:', errorText);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
testNewLeaderboard();
