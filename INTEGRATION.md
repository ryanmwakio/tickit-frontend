# Frontend-Backend Integration Guide

This document describes how the frontend is integrated with the backend API.

## Configuration

### Environment Variables

The frontend uses `.env.local` for configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

### Backend CORS

The backend is configured to accept requests from:
- `http://localhost:3000` (default Next.js port)
- `http://localhost:3001` (alternative port)
- Any `localhost` port in development mode

## API Client

The frontend uses a centralized API client (`src/lib/api.ts`) that:

- **Automatically includes JWT tokens** in requests
- **Handles token refresh** when tokens expire
- **Wraps responses** in standardized format
- **Provides error handling** with helpful messages
- **Logs API calls** in development mode

### Usage

```typescript
import { apiClient } from '@/lib/api';

// GET request
const events = await apiClient.get('/events');

// POST request
const order = await apiClient.post('/orders/checkout', {
  organiserId: '...',
  items: [...]
});

// PATCH request
await apiClient.patch('/users/me/role', { role: 'ORGANISER' });
```

## Authentication Flow

### Login

1. User submits credentials via `/auth/login`
2. Backend returns `{ tokens: {...}, user: {...} }`
3. Frontend stores tokens in localStorage
4. Frontend sets user in auth context
5. All subsequent requests include `Authorization: Bearer <token>`

### Token Refresh

- When a request returns 401, the API client automatically attempts token refresh
- Uses `/auth/refresh` endpoint with refresh token
- Updates stored tokens on success
- Clears tokens and redirects to login on failure

### Logout

- Calls `/auth/logout` endpoint (optional)
- Clears tokens from localStorage
- Clears user from auth context
- Redirects to login page

## Response Format

The backend wraps all responses in a standardized format:

```json
{
  "success": true,
  "data: {...},
  "timestamp": "2025-01-15T10:30:00.000Z",
  "requestId": "optional-request-id"
}
```

The API client automatically extracts the `data` field, so components receive the actual data directly.

## Error Handling

The API client handles errors gracefully:

- **Network errors**: Shows helpful message about backend connection
- **401 Unauthorized**: Attempts token refresh, then redirects to login
- **Validation errors**: Extracts and displays field-specific errors
- **Server errors**: Displays user-friendly error messages

## Testing the Integration

### 1. Start Backend

```bash
cd tixhub-backend
npm run start:dev
```

Backend should be running on `http://localhost:5000`

### 2. Start Frontend

```bash
cd tixhub-frontend
npm run dev
```

Frontend should be running on `http://localhost:3000` or `http://localhost:3001`

### 3. Test Login

Use the seeded test accounts:

- **Admin**: `admin@tixhub.com` / `Password123!`
- **Organiser**: `organiser1@tixhub.com` / `Password123!`
- **User**: `user1@tixhub.com` / `Password123!`

### 4. Verify Integration

- Open browser console (F12)
- Check for API request logs in development mode
- Verify tokens are stored in localStorage
- Test protected routes (should redirect to login if not authenticated)

## Common Issues

### CORS Errors

If you see CORS errors:
1. Verify backend is running
2. Check `CORS_ORIGIN` in backend `.env`
3. Ensure frontend URL matches allowed origins
4. In development, backend allows any `localhost` port

### Network Errors

If you see "Cannot connect to server":
1. Verify backend is running on port 5000
2. Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
3. Test backend health: `curl http://localhost:5000/api/v1/health`

### Authentication Errors

If login fails:
1. Check browser console for error details
2. Verify backend auth endpoints are working
3. Check that tokens are being stored correctly
4. Verify user exists in database (run `npm run seed:users`)

## API Endpoints Used

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### User Management
- `GET /users/me` - Get current user
- `PATCH /users/me` - Update user profile
- `PATCH /users/me/role` - Update active role

### Events
- `GET /events` - List events
- `GET /events/:id` - Get event details
- `POST /events` - Create event (organiser)

### Orders
- `POST /orders/checkout` - Create order
- `GET /orders` - List user orders
- `GET /orders/:id` - Get order details

### Tickets
- `GET /tickets` - List user tickets
- `GET /tickets/:id` - Get ticket details
- `POST /tickets/:id/transfer` - Transfer ticket

## Next Steps

1. **Implement WebSocket connection** for real-time notifications
2. **Add error boundaries** for better error handling
3. **Implement request caching** for better performance
4. **Add request retry logic** for failed requests
5. **Implement offline support** with service workers

