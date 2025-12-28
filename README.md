# Tickit Frontend

A modern event & ticketing platform frontend built with Next.js 16, React, and TypeScript. This frontend provides a complete user interface for event discovery, ticket purchasing, admin management, and organiser dashboards.

## 🚀 Features

- **Landing Pages**: Beautiful, responsive landing pages
- **Admin Dashboard**: Complete admin interface for platform management
- **Organiser Dashboard**: Event management, analytics, and operations
- **User Management**: User profiles, settings, and preferences
- **Events Pages**: Event discovery, details, and booking
- **Authentication**: Login, signup, password recovery
- **Real-time Updates**: WebSocket integration for live updates
- **Responsive Design**: Mobile-first, works on all devices

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Backend API** running (see backend README)

## 🛠️ Installation

1. **Navigate to frontend directory**
   ```bash
   cd tickit-frontend
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

## 🏃 Running the Application

### Development
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production
```bash
npm run build
npm run start
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── admin/              # Admin dashboard pages
│   ├── organizer/          # Organiser dashboard pages
│   ├── auth/               # Authentication pages
│   ├── events/             # Event pages
│   ├── profile/            # User profile pages
│   ├── tickets/            # Ticket pages
│   └── page.tsx            # Landing page
├── components/             # React components
│   ├── admin/              # Admin components
│   ├── organizer/          # Organiser components
│   ├── auth/               # Auth components
│   ├── events/             # Event components
│   └── ui/                 # UI components
├── contexts/               # React contexts
│   └── auth-context.tsx    # Authentication context
├── lib/                    # Utilities and helpers
│   ├── api.ts              # API client
│   └── utils.ts            # Utility functions
└── data/                   # Mock data and types
```

## 🎨 Pages

### Landing Pages
- `/` - Home page
- `/features` - Features showcase
- `/events` - Event discovery

### Authentication
- `/auth/login` - User login
- `/auth/signup` - User registration
- `/auth/forgot-password` - Password recovery

### Admin Dashboard
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/events` - Event management
- `/admin/analytics` - Analytics
- `/admin/settings` - Platform settings

### Organiser Dashboard
- `/organizer` - Organiser dashboard
- `/organizer/events` - Event management
- `/organizer/analytics` - Event analytics
- `/organizer/checkin` - Check-in management
- `/organizer/finance` - Financial reports

### User Pages
- `/profile` - User profile
- `/profile/enhanced` - Enhanced profile view
- `/tickets` - User tickets
- `/tickets/[id]` - Ticket details
- `/settings` - User settings

### Events
- `/events` - Event listing
- `/events/[slug]` - Event details

## 🔧 Configuration

### Environment Variables

**All configuration uses environment variables via `.env.local` file. No sensitive data is hardcoded.**

Create `.env.local` file:

```env
# API Configuration (REQUIRED)
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Next.js Config

The application uses:
- **Webpack** for bundling (configured for polling to avoid file watcher issues)
- **Image optimization** with Unsplash support
- **React Compiler** enabled

## 🎯 Key Features

### Admin Dashboard
- User management and roles
- Event oversight
- Analytics and reporting
- Platform settings
- Support ticket management

### Organiser Dashboard
- Event creation and management
- Ticket type configuration
- Check-in management
- Financial reports
- Marketing tools
- Staff management

### User Features
- Event discovery
- Ticket purchasing
- Ticket management
- Profile customization
- Order history

## 🔐 Authentication

Authentication is handled through the `auth-context.tsx` which provides:
- Login/logout functionality
- Token management (stored in localStorage)
- User state management
- Protected routes
- Role-based access

### API Client

The frontend uses an API client (`lib/api.ts`) that:
- Handles authentication tokens automatically
- Provides typed API calls
- Manages error handling
- Supports refresh tokens
- Handles network errors gracefully

## 📡 API Integration

The frontend connects to the backend API at the URL specified in `NEXT_PUBLIC_API_URL`. All API calls go through the `apiClient` which:

- Automatically includes JWT tokens
- Handles token refresh
- Provides consistent error handling
- Supports all HTTP methods (GET, POST, PATCH, DELETE)

### Example API Usage

```typescript
import { apiClient } from '@/lib/api';

// GET request
const events = await apiClient.get('/events');

// POST request
const order = await apiClient.post('/orders', {
  organiserId: '...',
  items: [...]
});

// PATCH request
await apiClient.patch('/users/me/role', { role: 'ORGANISER' });
```

## 🎨 Styling

The application uses:
- **Tailwind CSS** for styling
- **Custom components** in `components/ui/`
- **Responsive design** patterns
- **Modern UI** with shadcn/ui patterns

## 🧪 Development

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

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

1. **Set production environment variables** in `.env.local`
2. **Build the application**: `npm run build`
3. **Start the server**: `npm run start`

Or deploy to platforms like:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Your own server**

### Production Checklist

- [ ] Set `NEXT_PUBLIC_API_URL` to production API URL
- [ ] Verify API connectivity
- [ ] Test authentication flow
- [ ] Verify all pages load correctly
- [ ] Check responsive design on mobile
- [ ] Test WebSocket connections (if used)

## 🔒 Security

- **Environment variables** for sensitive data (API URLs)
- **API token management** (stored securely in localStorage)
- **Protected routes** for authenticated pages
- **Input validation** on forms
- **No sensitive data** in code - all in `.env.local`

## 🐛 Troubleshooting

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

## 📄 License

Private - Tickit Platform

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

---

**Built with Next.js 16, React, TypeScript, and Tailwind CSS**
