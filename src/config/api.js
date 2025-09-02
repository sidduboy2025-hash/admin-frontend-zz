// API Configuration - Single source of truth for all API endpoints
export const API_CONFIG = {
  BASE_URL: 'http://172.168.0.24:4002',
    BASE_URL: 'http://192.168.0.100:4002',

      BASE_URL: 'http://localhost:4002',

  API_VERSION: '/api',
  
  // Get the complete API base URL
  get API_BASE() {
    return `${this.BASE_URL}${this.API_VERSION}`;
  },
  
  // Specific endpoint builders
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/admin/login',
      LOGOUT: '/admin/logout',
      VERIFY: '/admin/verify'
    },
    
    // Tests endpoints
    TESTS: {
      CREATE: '/tests/create',
      ALL: '/tests/all',
      BY_ID: (id) => `/tests/${id}`,
      UPDATE: (id) => `/tests/${id}`,
      DELETE: (id) => `/tests/${id}`,
      STATUS: (id) => `/tests/${id}/status`,
      QUESTIONS: (id) => `/tests/${id}/questions`,
      RANDOM: (testName, categoryName) => `/tests/get-random/${testName}/${categoryName}/`
    },
    
    // Questions endpoints
    QUESTIONS: {
      UPDATE: (id) => `/tests/questions/${id}`,
      DELETE: (id) => `/tests/questions/${id}`,
      ADD: '/questions/add'
    },

    // Students endpoints
    STUDENTS: {
      BY_YEAR: (year) => `/students?year=${year}`,
      ALL: '/students'
    },

    // Leaderboard endpoints
    LEADERBOARD: {
      OVERALL: (year) => `/admin/overall-leaderboard/${year}`
    }
  }
};

// Frontend Configuration - Single source of truth for frontend URLs
export const FRONTEND_CONFIG = {
  BASE_URL: 'http://172.168.0.100:5175',
  
  // Frontend route builders
  ROUTES: {
    HOME: '/',
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    MY_TESTS: '/MyTests',
    MANAGE_TESTS: '/manage-tests',
    UPDATE_QUESTIONS: '/update-questions',
    QUIZ: '/quiz',
    START_TEST: '/start-test',
    LEADERBOARD: '/leaderboard'
  },
  
  // Helper to build complete frontend URLs
  getFullUrl: (route) => {
    return `${FRONTEND_CONFIG.BASE_URL}${route}`;
  }
};

// Helper function to build complete API URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.API_BASE}${endpoint}`;
};

// Helper function to build complete frontend URL
export const buildFrontendUrl = (route) => {
  return FRONTEND_CONFIG.getFullUrl(route);
};

// Export for easy access
export default API_CONFIG;
