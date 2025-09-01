import axios from "axios";
import { API_CONFIG, buildApiUrl } from "../config/api";

// Create axios instance with interceptors for authentication
const apiClient = axios.create();

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 🟢 Create a new test
export const createTest = async (testData) => {
  const response = await apiClient.post(buildApiUrl(API_CONFIG.ENDPOINTS.TESTS.CREATE), testData);
  return response.data;
};

// 🔵 Update a test by testId
export const updateTest = async (testId, updatedData) => {
  const response = await apiClient.put(buildApiUrl(API_CONFIG.ENDPOINTS.TESTS.UPDATE(testId)), updatedData);
  return response.data;
};

// 🟢 Fetch all tests
export const fetchTests = async () => {
  const response = await apiClient.get(buildApiUrl(API_CONFIG.ENDPOINTS.TESTS.ALL));
  return response.data;
};

// 🟢 Fetch questions of a specific test (by testId)
export const fetchQuestions = async (testId) => {
  const response = await apiClient.get(buildApiUrl(API_CONFIG.ENDPOINTS.TESTS.QUESTIONS(testId)));
  return response.data.questions;
};

// 🔵 Update a question by questionId
export const updateQuestion = async (questionId, updatedData) => {
  await apiClient.put(buildApiUrl(API_CONFIG.ENDPOINTS.QUESTIONS.UPDATE(questionId)), updatedData);
};

// 🔴 Delete a question by questionId
export const deleteQuestion = async (questionId) => {
  await apiClient.delete(buildApiUrl(API_CONFIG.ENDPOINTS.QUESTIONS.DELETE(questionId)));
};

// 🟢 Get 20 random questions for a given testName + categoryName
export const getTest = async (testName, categoryName) => {
  const response = await apiClient.get(buildApiUrl(API_CONFIG.ENDPOINTS.TESTS.RANDOM(testName, categoryName)));
  return response.data; // assuming backend returns { randomQuestions: [...] }
};

// 🟢 Fetch overall leaderboard by graduation year with filters
export const fetchOverallLeaderboard = async (graduationYear, filters = {}) => {
  try {
    // First try the original leaderboard endpoint
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString 
      ? `${buildApiUrl(API_CONFIG.ENDPOINTS.LEADERBOARD.OVERALL(graduationYear))}?${queryString}`
      : buildApiUrl(API_CONFIG.ENDPOINTS.LEADERBOARD.OVERALL(graduationYear));
    
    console.log('Trying original leaderboard endpoint:', url);
    const response = await apiClient.get(url);
    
    // If we get data with students, return it
    if (response.data && response.data.totalStudentsEvaluated > 0) {
      return response.data;
    }
    
    // If no students found, try the alternative approach with students endpoint
    console.log('No students found in leaderboard endpoint, trying students endpoint...');
    return await fetchLeaderboardFromStudents(graduationYear, filters);
    
  } catch (error) {
    console.error('Error with leaderboard endpoint, trying alternative approach:', error);
    // Fallback to students endpoint approach
    return await fetchLeaderboardFromStudents(graduationYear, filters);
  }
};

// Alternative implementation using students endpoint
const fetchLeaderboardFromStudents = async (graduationYear, filters = {}) => {
  try {
    // Use the working students endpoint
    const studentsResponse = await apiClient.get(buildApiUrl(API_CONFIG.ENDPOINTS.STUDENTS.BY_YEAR(graduationYear)));
    const studentsData = studentsResponse.data;
    
    console.log(`Found ${studentsData.length} students in ${graduationYear} collection`);
    
    // Process the data to create leaderboard format
    const processedStudents = studentsData.map((student) => {
      // Calculate total score from all tests
      const totalScore = student.assignedTests?.reduce((total, assignedTest) => {
        const marks = Object.values(assignedTest.marks || {});
        return total + marks.reduce((sum, mark) => sum + (typeof mark === 'number' ? mark : 0), 0);
      }, 0) || 0;
      
      // Calculate total tests taken
      const totalTests = student.assignedTests?.length || 0;
      
      // Calculate average score
      const averageScore = totalTests > 0 ? (totalScore / totalTests).toFixed(2) : '0.00';
      
      return {
        studentId: student._id,
        name: student.name,
        rollno: student.rollno,
        branch: student.branch,
        section: student.section,
        year: student.year || graduationYear,
        totalScore,
        totalTests,
        averageScore,
        categoryBreakdown: student.assignedTests?.reduce((breakdown, test) => {
          Object.entries(test.marks || {}).forEach(([category, mark]) => {
            breakdown[category] = (breakdown[category] || 0) + (typeof mark === 'number' ? mark : 0);
          });
          return breakdown;
        }, {}) || {}
      };
    });
    
    console.log(`Processed ${processedStudents.length} students`);
    
    // Apply filters
    let filteredStudents = processedStudents;
    
    if (filters.branch) {
      filteredStudents = filteredStudents.filter(s => s.branch === filters.branch);
      console.log(`After branch filter (${filters.branch}): ${filteredStudents.length} students`);
    }
    
    if (filters.section) {
      filteredStudents = filteredStudents.filter(s => s.section === filters.section);
      console.log(`After section filter (${filters.section}): ${filteredStudents.length} students`);
    }
    
    if (filters.specificYear) {
      const filterYear = parseInt(filters.specificYear, 10);
      filteredStudents = filteredStudents.filter(s => s.year === filterYear);
      console.log(`After specific year filter (${filterYear}): ${filteredStudents.length} students`);
    }
    
    // Filter out students with 0 total score
    const studentsWithScores = filteredStudents.filter(s => s.totalScore > 0);
    console.log(`Students with scores > 0: ${studentsWithScores.length}`);
    
    // Sort by total score (descending) and assign ranks
    studentsWithScores.sort((a, b) => b.totalScore - a.totalScore);
    const rankedStudents = studentsWithScores.map((student, index) => ({
      ...student,
      rank: index + 1
    }));
    
    // Apply limit filter
    const limit = parseInt(filters.limit, 10) || 25;
    const limitedStudents = rankedStudents.slice(0, limit);
    
    // Get available categories from all tests
    const categories = [...new Set(
      studentsData.flatMap(s => 
        s.assignedTests?.flatMap(test => Object.keys(test.marks || {})) || []
      )
    )].sort();
    
    // Create response in expected format
    const result = {
      graduationYear: graduationYear.toString(),
      overallLeaderboard: limitedStudents,
      appliedFilters: {
        graduationYear: graduationYear.toString(),
        branch: filters.branch || 'All branches',
        section: filters.section || 'All sections',
        specificYear: filters.specificYear || 'All years',
        limit: limit
      },
      totalStudentsEvaluated: studentsWithScores.length,
      totalStudentsInYear: studentsData.length,
      totalCollectionsProcessed: 1, // We processed 1 collection
      categories: categories.length > 0 ? categories : ['Coding', 'Aptitude', 'Reasoning', 'Verbal'],
      message: studentsWithScores.length > 0 
        ? `Top ${Math.min(limit, studentsWithScores.length)} students overall leaderboard for graduation year ${graduationYear} (Generated from students data)`
        : `No students found with scores > 0 for year ${graduationYear} (Found ${studentsData.length} total students)`
    };
    
    console.log('Final result:', result);
    return result;
    
  } catch (error) {
    console.error('Error in fetchLeaderboardFromStudents:', error);
    // Return empty result to prevent application crash
    return {
      graduationYear: graduationYear.toString(),
      overallLeaderboard: [],
      appliedFilters: {
        graduationYear: graduationYear.toString(),
        branch: 'All branches',
        section: 'All sections',
        specificYear: 'All years',
        limit: 25
      },
      totalStudentsEvaluated: 0,
      totalStudentsInYear: 0,
      totalCollectionsProcessed: 0,
      categories: ['Coding', 'Aptitude', 'Reasoning', 'Verbal'],
      message: `Error fetching data for year ${graduationYear}: ${error.message}`
    };
  }
};
