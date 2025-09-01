# Admin Authentication System

## Overview
This implementation adds a complete authentication system to the admin assessment portal. Users must login before accessing any admin functionality.

## Features
- ✅ Login page with username/password authentication
- ✅ JWT token-based authentication
- ✅ Automatic token verification on app startup
- ✅ Protected routes - redirect to login if not authenticated
- ✅ Logout functionality with confirmation
- ✅ Automatic logout on token expiration (401 responses)
- ✅ All API calls include authentication headers
- ✅ Professional UI matching the existing design

## API Endpoint Used
```
POST http://localhost:4000/api/admin/login
Content-Type: application/json

{
    "username": "principal-viit",
    "password": "principal-viit"
}
```

## How It Works

### 1. Authentication Flow
1. User visits any protected route
2. If not authenticated → redirected to `/login`
3. User enters credentials and submits
4. Frontend calls `/api/admin/login` endpoint
5. If successful, stores JWT token in localStorage
6. User is redirected to dashboard
7. All subsequent API calls include `Authorization: Bearer <token>` header

### 2. Token Management
- Tokens are stored in localStorage with key `adminToken`
- On app startup, token is verified with backend (calls `/api/admin/verify`)
- If token is invalid/expired, user is redirected to login
- On 401 responses, token is cleared and user redirected to login

### 3. Protected Routes
All admin routes are wrapped in `<ProtectedRoute>` component:
- `/dashboard`
- `/create-test`
- `/manage-tests`
- `/manage-questions`
- `/update-questions`
- `/start-test`
- `/quiz`
- `/test/:testId`
- `/mytests`

Only `/login` is public.

## Files Created/Modified

### New Files
1. `src/contexts/AuthContext.jsx` - Authentication state management
2. `src/components/ProtectedRoute.jsx` - Route protection wrapper
3. `src/pages/Login.jsx` - Login page component
4. `src/utils/api.js` - Authenticated fetch wrapper

### Modified Files
1. `src/App.jsx` - Added AuthProvider and login route
2. `src/config/api.js` - Added auth endpoints
3. `src/components/Navigations/Header.jsx` - Added logout button
4. `src/api/testApi.js` - Added auth interceptors
5. `src/pages/CreateTest.jsx` - Updated to use authenticated fetch
6. `src/pages/Dashboard.jsx` - Updated to use authenticated fetch

## Backend Requirements
Your backend needs to implement these endpoints:

```javascript
// Login endpoint
POST /api/admin/login
Body: { username: string, password: string }
Response: { token: string, user?: object }

// Token verification (optional but recommended)
GET /api/admin/verify
Headers: { Authorization: "Bearer <token>" }
Response: { user: object } or 401 if invalid

// Logout (optional)
POST /api/admin/logout
Headers: { Authorization: "Bearer <token>" }
```

## Usage Instructions

### For Development
1. Start the backend server on `http://localhost:4000`
2. Start the frontend on `http://localhost:5173`
3. Navigate to any route - you'll be redirected to login
4. Use credentials: `principal-viit` / `principal-viit`
5. After login, you'll have access to all admin features

### For Production
- Update `API_CONFIG.BASE_URL` in `src/config/api.js` to your production API URL
- Update `FRONTEND_CONFIG.BASE_URL` to your production frontend URL
- Ensure HTTPS is used for production

## Security Features
- Passwords are sent over HTTPS (in production)
- JWT tokens have expiration (backend controlled)
- Automatic logout on token expiration
- Protected routes prevent unauthorized access
- Logout confirmation prevents accidental logouts

## Testing the Implementation

1. **Login Flow**:
   - Go to `http://localhost:5173`
   - Should redirect to `/login`
   - Enter credentials and login
   - Should redirect to dashboard

2. **Authentication Persistence**:
   - Login and refresh the page
   - Should remain logged in
   - Close and reopen browser
   - Should remain logged in

3. **Logout Flow**:
   - Click logout button in header
   - Confirm logout
   - Should redirect to login page

4. **Token Expiration**:
   - Manually expire token on backend
   - Make any API call
   - Should automatically logout and redirect to login

## Customization Options

### Styling
- Update colors in `src/pages/Login.jsx` to match your brand
- Modify logout button style in `src/components/Navigations/Header.jsx`

### Authentication Logic
- Modify token storage location in `src/contexts/AuthContext.jsx`
- Add remember me functionality
- Add password reset flow
- Add multi-factor authentication

### API Integration
- Update endpoints in `src/config/api.js`
- Modify request/response handling in `src/utils/api.js`
- Add role-based permissions

## Troubleshooting

### Common Issues
1. **CORS errors**: Ensure backend allows frontend origin
2. **Token not sent**: Check `src/utils/api.js` implementation
3. **Redirect loops**: Verify token verification endpoint
4. **Styling issues**: Check Tailwind CSS classes

### Debug Steps
1. Check browser console for errors
2. Check Network tab for API call details
3. Verify localStorage contains `adminToken`
4. Test API endpoints with Postman/curl

## Next Steps
- Add role-based access control
- Implement password reset functionality
- Add session timeout warnings
- Add audit logging for admin actions
- Implement refresh token mechanism
