# TixHub Frontend - Complete Documentation

This document aggregates all frontend documentation in one place.

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Pages & Routes](#pages--routes)
5. [Components](#components)
6. [API Integration](#api-integration)
7. [Authentication](#authentication)
8. [Real-Time Features](#real-time-features)
9. [Styling & UI](#styling--ui)
10. [Configuration](#configuration)
11. [Deployment](#deployment)

---

## Overview

TixHub Frontend is a modern event & ticketing platform frontend built with Next.js 16, React 19, and TypeScript. The frontend provides a complete user interface for event discovery, ticket purchasing, admin management, and organiser dashboards.

### Key Features

- **Landing Pages**: Beautiful, responsive landing pages
- **Admin Dashboard**: Complete admin interface for platform management
- **Organiser Dashboard**: Event management, analytics, and operations
- **User Management**: User profiles, settings, and preferences
- **Events Pages**: Event discovery, details, and booking
- **Authentication**: Login, signup, password recovery
- **Real-time Updates**: WebSocket integration for live updates
- **Responsive Design**: Mobile-first, works on all devices
- **Ticket Management**: View tickets, transfer, void
- **Order History**: View past orders and receipts

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Backend API** running (see backend documentation)

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd tixhub-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Configure API URL**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

---

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── admin/              # Admin dashboard pages
│   │   ├── [section]/     # Dynamic admin sections
│   │   └── layout.tsx     # Admin layout
│   ├── organizer/         # Organiser dashboard pages
│   │   ├── [section]/     # Dynamic organiser sections
│   │   ├── events/         # Event management
│   │   └── layout.tsx      # Organiser layout
│   ├── auth/               # Authentication pages
│   │   ├── login/          # Login page
│   │   ├── signup/        # Signup page
│   │   └── forgot-password/ # Password recovery
│   ├── events/             # Event pages
│   │   ├── [slug]/         # Event details by slug
│   │   └── page.tsx        # Event listing
│   ├── profile/            # User profile pages
│   │   ├── enhanced/       # Enhanced profile view
│   │   └── page.tsx        # Basic profile
│   ├── tickets/            # Ticket pages
│   │   ├── [id]/           # Ticket details
│   │   └── page.tsx        # Ticket listing
│   ├── settings/           # User settings
│   ├── calendar/           # Calendar view
│   ├── features/           # Features showcase
│   ├── system/             # System architecture
│   └── page.tsx            # Landing page
├── components/             # React components
│   ├── admin/              # Admin components
│   │   ├── dashboard-panels.tsx
│   │   ├── sidebar.tsx
│   │   ├── analytics/
│   │   ├── events/
│   │   ├── users/
│   │   └── ...
│   ├── organizer/          # Organiser components
│   │   ├── dashboard.tsx
│   │   ├── event-creation/
│   │   ├── analytics/
│   │   ├── checkin/
│   │   └── ...
│   ├── auth/               # Auth components
│   │   ├── auth-button.tsx
│   │   ├── auth-form-input.tsx
│   │   └── protected-route.tsx
│   ├── events/             # Event components
│   │   ├── events-grid.tsx
│   │   ├── events-filter.tsx
│   │   └── ...
│   ├── ui/                 # UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   └── charts/             # Chart components
├── contexts/               # React contexts
│   └── auth-context.tsx    # Authentication context
├── lib/                    # Utilities and helpers
│   ├── api.ts              # API client
│   ├── error-handler.ts    # Error handling
│   ├── logger.ts           # Logging utility
│   └── utils.ts            # Utility functions
└── data/                   # Mock data and types
    ├── events.ts
    ├── admin.ts
    ├── organizer.ts
    └── system.ts
```

---

## Pages & Routes

### Public Pages

- `/` - Landing page
- `/events` - Event discovery and listing
- `/events/[slug]` - Event details page
- `/features` - Features showcase
- `/features/[slug]` - Individual feature page
- `/system` - System architecture documentation

### Authentication Pages

- `/auth/login` - User login
- `/auth/signup` - User registration
- `/auth/forgot-password` - Password recovery

### Admin Dashboard

- `/admin` - Admin dashboard home
- `/admin/[section]` - Dynamic admin sections:
  - `users` - User management
  - `events` - Event management
  - `analytics` - Analytics and reporting
  - `payments` - Payment monitoring
  - `refunds` - Refund management
  - `settings` - Platform settings
  - `support` - Support ticket management
  - `venues` - Venue management
  - `tickets` - Ticket oversight
  - `checkins` - Check-in management
  - `integrations` - Third-party integrations
  - `marketing` - Marketing tools
  - `merchandising` - Merchandise management
  - `fraud` - Fraud prevention
  - `cms` - Content management
  - `api` - API management

### Organiser Dashboard

- `/organizer` - Organiser dashboard home
- `/organizer/[section]` - Dynamic organiser sections:
  - `events` - Event management
  - `analytics` - Event analytics
  - `checkin` - Check-in management
  - `finance` - Financial reports
  - `marketing` - Marketing suite
  - `orders` - Order management
  - `staff` - Staff management
  - `settings` - Organiser settings
- `/organizer/events/create` - Create new event
- `/organizer/events/edit/[id]` - Edit event

### User Pages

- `/profile` - User profile
- `/profile/enhanced` - Enhanced profile view
- `/tickets` - User tickets listing
- `/tickets/[id]` - Ticket details
- `/settings` - User settings
- `/calendar` - Calendar view of events

### Other Pages

- `/host` - Host dashboard
- `/ops` - Operations dashboard
- `/intelligence` - Intelligence dashboard
- `/journeys` - User journeys
- `/seat-maps` - Seat map viewer
- `/suites` - Suite management

---

## Components

### Admin Components

Located in `src/components/admin/`:

- **Dashboard Panels** - Main dashboard widgets
- **Sidebar** - Admin navigation sidebar
- **User Management** - User CRUD operations
- **Event Management** - Event oversight
- **Analytics** - Reporting and analytics
- **Support** - Support ticket management
- **Settings** - Platform settings

### Organiser Components

Located in `src/components/organizer/`:

- **Dashboard** - Organiser dashboard
- **Event Creation** - Event creation wizard
- **Analytics** - Event-specific analytics
- **Check-in Gate Control** - Check-in management
- **Finance Settlement** - Financial reports
- **Marketing Suite** - Marketing tools
- **Staff Access Control** - Staff management
- **Orders & Customers** - Order management

### Event Components

Located in `src/components/events/`:

- **Events Grid** - Event listing grid
- **Events Filter** - Event filtering
- **Event Showcase** - Featured events
- **Event Gallery** - Event image gallery
- **Merchandise Section** - Event merchandise

### UI Components

Located in `src/components/ui/`:

- **Button** - Reusable button component
- **Input** - Form input component
- **Dialog** - Modal dialogs
- **Select** - Dropdown select
- **Date Picker** - Date selection
- **Tabs** - Tab navigation
- **Rich Text Editor** - Text editing

---

## API Integration

### API Client

The frontend uses an API client (`src/lib/api.ts`) that:

- Handles authentication tokens automatically
- Provides typed API calls
- Manages error handling
- Supports refresh tokens
- Handles network errors gracefully

### Example Usage

```typescript
import { apiClient } from '@/lib/api';

// GET request
const events = await apiClient.get('/events');

// POST request
const order = await apiClient.post('/orders/checkout', {
  organiserId: '...',
  items: [...],
  payment: {...}
});

// PATCH request
await apiClient.patch('/users/me/role', { role: 'ORGANISER' });

// DELETE request
await apiClient.delete('/events/:id');
```

### API Base URL

Configured via `NEXT_PUBLIC_API_URL` environment variable:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Error Handling

The API client includes comprehensive error handling:

- Network errors are caught and formatted
- Authentication errors trigger token refresh
- Validation errors are displayed to users
- All errors are logged for debugging

See `src/lib/error-handler.ts` for details.

---

## Authentication

### Auth Context

Authentication is handled through `src/contexts/auth-context.tsx` which provides:

- Login/logout functionality
- Token management (stored in localStorage)
- User state management
- Protected routes
- Role-based access

### Protected Routes

Use the `ProtectedRoute` component to protect pages:

```typescript
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      {/* Admin content */}
    </ProtectedRoute>
  );
}
```

### Authentication Flow

1. User logs in via `/auth/login`
2. Backend returns JWT tokens (access + refresh)
3. Tokens stored in localStorage
4. API client automatically includes tokens in requests
5. On token expiration, refresh token is used automatically
6. On logout, tokens are cleared

---

## Real-Time Features

### WebSocket Integration

The frontend supports WebSocket connections for real-time updates:

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: 'jwt-token' }
});

// Join user room for personal notifications
socket.emit('join-user-room');

// Join event room for live updates
socket.emit('join-event-room', { eventId: 'event-id' });

// Listen for notifications
socket.on('notification', (payload) => {
  showNotification(payload);
});

// Listen for live stream
socket.on('live-stream-started', (data) => {
  startVideoPlayer(data.streamUrl);
});
```

### Real-Time Notifications

The system supports real-time notifications for:

- Event approval requests (admin)
- Event approval decisions (organiser)
- Ticket creation (user)
- Order payment (user & organiser)
- Live stream events (all users)

### Live Streaming

Events can have live streaming:

- Stream status updates in real-time
- Viewer count updates
- Stream start/end notifications
- Video player integration ready

---

## Styling & UI

### Tailwind CSS

The application uses Tailwind CSS for styling:

- Utility-first CSS framework
- Responsive design patterns
- Custom color palette
- Dark mode ready (when implemented)

### Component Library

UI components follow shadcn/ui patterns:

- Accessible components
- Consistent styling
- Reusable patterns
- TypeScript support

### Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl
- Touch-friendly interfaces
- Optimized for all screen sizes

---

## Configuration

### Environment Variables

Create `.env.local` file:

```env
# API Configuration (REQUIRED)
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Optional
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

### Next.js Config

The application uses:

- **Webpack** for bundling (configured for polling to avoid file watcher issues)
- **Image optimization** with Unsplash support
- **React Compiler** enabled
- **TypeScript** strict mode

---

## Deployment

### Production Build

```bash
npm run build
npm run start
```

### Deployment Platforms

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Your own server** (Node.js required)

### Production Checklist

- [ ] Set `NEXT_PUBLIC_API_URL` to production API URL
- [ ] Verify API connectivity
- [ ] Test authentication flow
- [ ] Verify all pages load correctly
- [ ] Check responsive design on mobile
- [ ] Test WebSocket connections
- [ ] Verify real-time notifications work
- [ ] Test live streaming functionality

---

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Structure

- Components are organized by feature
- Shared components in `components/ui/`
- TypeScript for type safety
- ESLint for code quality

### Best Practices

- Use TypeScript for all files
- Follow Next.js 16 app router patterns
- Implement proper error boundaries
- Use React Server Components where appropriate
- Keep components small and focused
- Use the API client for all backend calls
- Handle loading and error states

---

## Troubleshooting

### API Connection Issues

- Verify backend is running
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors
- Verify backend CORS configuration

### Build Issues

- Clear `.next` folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

### Authentication Issues

- Check token storage in localStorage
- Verify token expiration
- Check backend JWT configuration
- Verify API client token handling

### File Watcher Warnings

If you see `EMFILE: too many open files` warnings:

```bash
# Increase file watcher limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## Key Features

### Admin Dashboard

- User management and roles
- Event oversight and approval
- Analytics and reporting
- Platform settings
- Support ticket management
- Payment monitoring
- Refund management

### Organiser Dashboard

- Event creation and management
- Ticket type configuration
- Check-in management
- Financial reports
- Marketing tools
- Staff management
- Analytics dashboard

### User Features

- Event discovery with filters
- Ticket purchasing
- Ticket management (view, transfer, void)
- Profile customization
- Order history
- Calendar view

---

## Security

- **Environment variables** for sensitive data (API URLs)
- **API token management** (stored securely in localStorage)
- **Protected routes** for authenticated pages
- **Input validation** on forms
- **No sensitive data** in code - all in `.env.local`
- **HTTPS** required in production

---

## Performance

- **Next.js Image Optimization** for images
- **Code splitting** automatic
- **Server-side rendering** where appropriate
- **Client-side caching** for API responses
- **Lazy loading** for components
- **Optimized bundle size**

---

## License

Private - TixHub Platform

---

**Built with Next.js 16, React 19, TypeScript, and Tailwind CSS**

