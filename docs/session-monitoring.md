# Session Monitoring System

The Tickit platform includes a comprehensive session monitoring system that prevents data loss when users' authentication sessions expire while they're working on forms or creating content.

## Overview

The session monitoring system consists of three main components:

1. **`useSessionMonitor` Hook** - Core logic for tracking session state and user activity
2. **`SessionProtectedForm` Component** - Wrapper for forms that need session protection
3. **`GlobalSessionMonitor` Component** - App-wide session monitoring for general notifications

## Features

- ✅ **Session Expiration Detection** - Automatically detects when a previously authenticated user's session expires
- ✅ **Inactivity Warnings** - Warns users when they've been inactive for extended periods
- ✅ **Unsaved Data Protection** - Special handling for forms with unsaved data
- ✅ **Activity Tracking** - Monitors user interactions to reset inactivity timers
- ✅ **Local Storage Persistence** - Remembers session state across page refreshes
- ✅ **Toast Notifications** - User-friendly notifications for session events
- ✅ **Automatic Token Refresh** - Works with existing API client token refresh logic

## Quick Start

### 1. Global Session Monitoring

The `GlobalSessionMonitor` is already added to the root layout and provides app-wide session tracking:

```tsx
import { GlobalSessionMonitor } from "@/components/auth/global-session-monitor";

// Already added to src/app/layout.tsx
<GlobalSessionMonitor />
```

### 2. Protecting Forms with Unsaved Data

Wrap any form component that contains user data with `SessionProtectedForm`:

```tsx
import { SessionProtectedForm } from "@/components/auth/session-protected-form";

function MyEventForm() {
  const [formData, setFormData] = useState(initialData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSave = () => {
    // Your save logic here
    localStorage.setItem('form_backup', JSON.stringify(formData));
  };

  return (
    <SessionProtectedForm
      hasUnsavedData={hasUnsavedChanges}
      onSave={handleSave}
      expiredMessage="Your session expired while creating this event!"
    >
      {/* Your form components here */}
      <form>
        <input 
          value={formData.title}
          onChange={(e) => {
            setFormData({...formData, title: e.target.value});
            setHasUnsavedChanges(true);
          }}
        />
        <button onClick={handleSave}>Save Draft</button>
      </form>
    </SessionProtectedForm>
  );
}
```

### 3. Custom Session Monitoring

Use the `useSessionMonitor` hook for custom session monitoring logic:

```tsx
import { useSessionMonitor } from "@/hooks/use-session-monitor";

function MyComponent() {
  const {
    isAuthenticated,
    wasAuthenticated,
    isSessionExpired,
    timeSinceLastActivity,
    updateActivity,
  } = useSessionMonitor({
    hasUnsavedData: true,
    onSessionExpired: () => {
      // Custom logic when session expires
      console.log("Session expired!");
    },
  });

  if (isSessionExpired && wasAuthenticated) {
    return <div>Session expired. Please log in again.</div>;
  }

  return <div>Your protected content</div>;
}
```

## API Reference

### `useSessionMonitor(options)`

Core hook that provides session monitoring functionality.

**Options:**
- `checkInterval?: number` - How often to check session status (default: 30 seconds)
- `inactivityWarningThreshold?: number` - Inactivity warning time (default: 25 minutes)
- `activityEvents?: string[]` - Events that reset activity timer
- `showWarnings?: boolean` - Whether to show toast notifications (default: true)
- `hasUnsavedData?: boolean` - Whether component has unsaved data (default: false)
- `onSessionExpired?: () => void` - Callback when session expires
- `onInactivityWarning?: () => void` - Callback for inactivity warnings

**Returns:**
- `isAuthenticated: boolean` - Current authentication status
- `wasAuthenticated: boolean` - Whether user was previously authenticated
- `isSessionExpired: boolean` - Whether session has expired
- `timeSinceLastActivity: number` - Milliseconds since last activity
- `updateActivity: () => void` - Manually update activity timestamp
- `clearSessionState: () => void` - Clear session tracking state

### `SessionProtectedForm` Component

Wrapper component that provides session protection for forms.

**Props:**
- `children: ReactNode` - Form content to protect
- `hasUnsavedData?: boolean` - Whether form has unsaved data
- `expiredMessage?: string` - Custom session expired message
- `inactivityMessage?: string` - Custom inactivity warning message
- `onSave?: () => void` - Callback to save form data locally
- `showPersistentWarning?: boolean` - Show persistent warning banner (default: true)
- `className?: string` - CSS class for wrapper

### `GlobalSessionMonitor` Component

App-wide session monitoring component (place in root layout).

**Props:**
- `showNotifications?: boolean` - Show toast notifications (default: true)
- `checkInterval?: number` - Check frequency (default: 60 seconds)
- `inactivityThreshold?: number` - Inactivity warning threshold (default: 20 minutes)

## Examples

### Event Creation Form (Complete Example)

```tsx
import { useState, useMemo } from "react";
import { SessionProtectedForm } from "@/components/auth/session-protected-form";

function EventCreationForm() {
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
  });
  const [initialData] = useState(eventData);

  // Detect unsaved changes
  const hasUnsavedData = useMemo(() => {
    return JSON.stringify(eventData) !== JSON.stringify(initialData);
  }, [eventData, initialData]);

  // Save to localStorage for session protection
  const handleLocalSave = () => {
    localStorage.setItem('event_draft', JSON.stringify({
      eventData,
      timestamp: Date.now(),
    }));
  };

  const handleSubmit = async () => {
    try {
      await createEvent(eventData);
      localStorage.removeItem('event_draft');
    } catch (error) {
      if (error.statusCode === 401) {
        // Session expired during submit - data is already saved locally
        alert("Session expired! Your work is saved locally.");
      }
    }
  };

  return (
    <SessionProtectedForm
      hasUnsavedData={hasUnsavedData}
      onSave={handleLocalSave}
      expiredMessage="Session expired while creating event! Your work will be saved locally."
    >
      <form onSubmit={handleSubmit}>
        <input
          value={eventData.title}
          onChange={(e) => setEventData({...eventData, title: e.target.value})}
          placeholder="Event title"
        />
        <textarea
          value={eventData.description}
          onChange={(e) => setEventData({...eventData, description: e.target.value})}
          placeholder="Event description"
        />
        <input
          type="date"
          value={eventData.date}
          onChange={(e) => setEventData({...eventData, date: e.target.value})}
        />
        <button type="submit">Create Event</button>
      </form>
    </SessionProtectedForm>
  );
}
```

### HOC Pattern

```tsx
import { withSessionMonitoring } from "@/components/auth/global-session-monitor";

const ProtectedAdminPanel = withSessionMonitoring(AdminPanel, {
  requireAuth: true,
  redirectOnExpiry: true,
  showWarnings: true,
});
```

### Custom Session State Hook

```tsx
import { useGlobalSessionState } from "@/components/auth/global-session-monitor";

function StatusIndicator() {
  const { 
    wasAuthenticated, 
    isSessionExpired, 
    isInactive 
  } = useGlobalSessionState();

  if (isSessionExpired) {
    return <div className="text-red-500">Session Expired</div>;
  }

  if (isInactive) {
    return <div className="text-yellow-500">Inactive</div>;
  }

  return <div className="text-green-500">Active</div>;
}
```

## Session States

The system tracks several session states:

1. **Never Authenticated** - User has never logged in during this session
2. **Currently Authenticated** - User is logged in and session is valid
3. **Session Expired** - User was logged in but session expired
4. **Inactive** - User is logged in but hasn't been active recently

## Local Storage

The system uses localStorage to persist session state:

- `tickit_session_state` - Core session tracking data
- `tickit_event_draft_${organizerId}` - Event form backup (example)

## Configuration

Default timeouts and intervals:

- **Session Check Interval**: 30 seconds (forms), 60 seconds (global)
- **Inactivity Warning**: 20-25 minutes
- **Activity Events**: mousedown, mousemove, keypress, scroll, touchstart, click
- **Toast Duration**: 5-10 seconds depending on severity

## Best Practices

1. **Always wrap long forms** with `SessionProtectedForm`
2. **Implement local save** for important form data
3. **Test session expiration** in development
4. **Handle 401 errors gracefully** in API calls
5. **Clear drafts** after successful submission
6. **Use meaningful messages** for different contexts

## Troubleshooting

### Session not detected as expired
- Check that API returns 401 status codes for expired sessions
- Verify that `refreshUser()` is being called properly
- Ensure localStorage is available

### Warnings not showing
- Check `showWarnings` prop is set to `true`
- Verify ToastProvider is properly configured
- Check browser console for errors

### Activity not being tracked
- Verify activity events are being attached to document
- Check that component is mounted properly
- Ensure user interaction is happening on tracked events

## Future Enhancements

- [ ] Server-side session validation
- [ ] Cross-tab session synchronization
- [ ] Configurable activity events per component
- [ ] Session recovery mechanisms
- [ ] Analytics for session behavior