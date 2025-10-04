# Design Document

## Overview

This design outlines the comprehensive integration of the React frontend application (QUAI_Frontend/synq) into the existing Next.js backend application (QUAI/apps/web). The integration will transform the current basic Next.js pages into a full-featured social media application with dashboard functionality, QNS integration, and Web3 capabilities while preserving all existing backend functionality.

### Key Integration Points

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS + React Router + wagmi/Web3Modal
- **Backend**: Next.js 14 + TypeScript + App Router (already has basic social, qns, bridge pages)
- **Shared Dependencies**: React, TypeScript, Web3 libraries
- **Migration Strategy**: Component-by-component migration with route restructuring

## Architecture

### Directory Structure Transformation

The migration will transform the current structure from:

```
QUAI/apps/web/
├── app/
│   ├── layout.tsx (basic)
│   ├── page.tsx (basic homepage)
│   ├── social/page.tsx (basic social page)
│   ├── qns/page.tsx (basic QNS page)
│   └── bridge/page.tsx (basic bridge page)
└── src/lib/quai.ts
```

To a comprehensive structure:

```
QUAI/apps/web/
├── app/
│   ├── layout.tsx (enhanced with providers)
│   ├── page.tsx (landing page from frontend)
│   ├── dashboard/
│   │   ├── layout.tsx (dashboard layout)
│   │   ├── page.tsx (redirect to overview)
│   │   ├── overview/page.tsx
│   │   ├── social/page.tsx (enhanced)
│   │   ├── profile/page.tsx
│   │   ├── post/[postId]/page.tsx
│   │   ├── bridge/page.tsx (enhanced)
│   │   ├── namesearch/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── settings/page.tsx
│   └── qns/
│       ├── layout.tsx (QNS layout)
│       ├── page.tsx (redirect to profile)
│       ├── profile/page.tsx (enhanced)
│       ├── namesearch/page.tsx
│       ├── records/page.tsx
│       ├── ownership/page.tsx
│       └── subnames/page.tsx
├── src/
│   ├── components/ (migrated from frontend)
│   ├── hooks/ (migrated from frontend)
│   ├── lib/ (enhanced with frontend utilities)
│   └── assets/ (migrated from frontend)
└── public/ (enhanced with frontend assets)
```

### Component Migration Strategy

#### 1. Layout Components
- **DashboardLayout**: Convert to Next.js layout component at `/dashboard/layout.tsx`
- **QNSProfileLayout**: Convert to Next.js layout component at `/qns/layout.tsx`
- **Header**: Migrate as shared component with Next.js Link integration
- **Sidebar**: Migrate as shared component with Next.js navigation

#### 2. Page Components
- **LandingPage**: Replace current `app/page.tsx`
- **Dashboard Pages**: Enhance existing pages and add missing ones
- **QNS Pages**: Enhance existing QNS page and add missing functionality
- **Social Pages**: Enhance existing social page with frontend features

#### 3. Shared Components
- **CreatePostModal**: Migrate as client component
- **EditProfileModal**: Migrate as client component
- **Footer**: Migrate as shared component
- **QnsHeader**: Migrate as shared component

## Components and Interfaces

### Web3 Provider Integration

```typescript
// app/providers.tsx
"use client";
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';

export function Providers({ children }: { children: React.ReactNode }) {
  // Web3Modal and wagmi configuration
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### Route Mapping Strategy

| Frontend Route | Next.js Route | Component Source |
|---------------|---------------|------------------|
| `/` | `/` | LandingPage.tsx |
| `/dashboard` | `/dashboard` | Redirect to `/dashboard/overview` |
| `/dashboard/overview` | `/dashboard/overview` | UserOverview.tsx |
| `/dashboard/social` | `/dashboard/social` | Enhanced existing social page |
| `/dashboard/profile` | `/dashboard/profile` | SocialProfile.tsx |
| `/dashboard/post/:id` | `/dashboard/post/[postId]` | SocialPostDetail.tsx |
| `/dashboard/bridge` | `/dashboard/bridge` | Enhanced existing bridge page |
| `/dashboard/namesearch` | `/dashboard/namesearch` | NameSearch.tsx |
| `/dashboard/analytics` | `/dashboard/analytics` | Analytics.tsx |
| `/dashboard/settings` | `/dashboard/settings` | Settings.tsx |
| `/qns` | `/qns` | Redirect to `/qns/profile` |
| `/qns/profile` | `/qns/profile` | Enhanced existing QNS page |
| `/qns/records` | `/qns/records` | QNSRecords.tsx |
| `/qns/ownership` | `/qns/ownership` | QNSOwnership.tsx |
| `/qns/subnames` | `/qns/subnames` | QNSSubnames.tsx |

### Navigation Component Conversion

```typescript
// Convert React Router navigation to Next.js
// From: <NavLink to="/dashboard/social">
// To: <Link href="/dashboard/social" className={pathname === '/dashboard/social' ? 'active' : ''}>

// Convert useNavigate to useRouter
// From: const navigate = useNavigate();
// To: const router = useRouter();
```

### Client Component Identification

Components requiring "use client" directive:
- All components using Web3 hooks (wagmi, Web3Modal)
- Components with browser APIs (localStorage, window)
- Interactive components with state management
- Components using React Router hooks (converted to Next.js equivalents)

## Data Models

### Configuration Integration

#### Tailwind CSS Configuration
```javascript
// Merge frontend Tailwind config into backend
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B1E3F',
        secondary: '#6C3B9E',
        background: '#0D0D0D',
        surface: '#1A1A1A',
        text: {
          primary: '#EDEDED',
          secondary: '#A0A0A0',
        },
        border: '#2a2a2a',
      },
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
        'manrope': ['Manrope', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg, #8B1E3F, #6C3B9E)',
      },
    },
  },
  plugins: [],
}
```

#### Package.json Dependencies Merge
```json
{
  "dependencies": {
    // Existing Next.js dependencies
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "quais": "1.0.0-alpha.52",
    
    // Added from frontend
    "@fortawesome/fontawesome-svg-core": "^7.0.1",
    "@fortawesome/free-brands-svg-icons": "^7.0.1",
    "@fortawesome/free-regular-svg-icons": "^7.0.1",
    "@fortawesome/free-solid-svg-icons": "^7.0.1",
    "@fortawesome/react-fontawesome": "^3.0.2",
    "@tanstack/react-query": "latest",
    "@web3modal/wagmi": "^5.1.11",
    "viem": "latest",
    "wagmi": "^2.16.9",
    "tailwindcss": "^3.4.17",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6"
  }
}
```

### Asset Migration Strategy

1. **Images and Icons**: Copy from `QUAI_Frontend/synq/src/assets/` to `QUAI/apps/web/public/assets/`
2. **Update Import Paths**: Convert relative imports to public folder references
3. **Optimize for Next.js**: Use Next.js Image component where appropriate

## Error Handling

### Migration Error Prevention

1. **Dependency Conflicts**: 
   - Resolve React version conflicts (frontend uses React 19, backend uses React 18)
   - Update backend to React 19 or downgrade frontend dependencies
   - Test all Web3 libraries compatibility

2. **Routing Conflicts**:
   - Ensure no route conflicts between existing backend routes and new frontend routes
   - Implement proper redirects for route changes
   - Handle dynamic route parameters correctly

3. **Build Configuration**:
   - Merge Tailwind configurations without conflicts
   - Update Next.js config for new dependencies
   - Ensure PostCSS configuration is compatible

4. **Environment Variables**:
   - Migrate frontend environment variables to Next.js format
   - Update API endpoints and configuration references
   - Ensure Web3 provider configurations work in Next.js

### Runtime Error Handling

```typescript
// Error boundary for Web3 components
export function Web3ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={<div>Web3 connection error. Please refresh and try again.</div>}
      onError={(error) => console.error('Web3 Error:', error)}
    >
      {children}
    </ErrorBoundary>
  );
}
```

## Testing Strategy

### Integration Testing Phases

1. **Phase 1: Basic Migration**
   - Verify all components render without errors
   - Test basic navigation between pages
   - Ensure styling is preserved

2. **Phase 2: Functionality Testing**
   - Test Web3 wallet connections
   - Verify social media features work
   - Test QNS functionality
   - Validate bridge operations

3. **Phase 3: Performance Testing**
   - Measure page load times
   - Test responsive design on various devices
   - Verify SEO and accessibility compliance

4. **Phase 4: Integration Testing**
   - Test interaction between frontend and existing backend APIs
   - Verify data persistence and state management
   - Test error scenarios and edge cases

### Testing Checklist

- [ ] All pages load without JavaScript errors
- [ ] Navigation works correctly between all routes
- [ ] Web3 wallet connection functions properly
- [ ] Social media posting and interactions work
- [ ] QNS search and registration functions
- [ ] Bridge functionality is preserved
- [ ] Responsive design works on mobile and desktop
- [ ] All assets load correctly
- [ ] Performance meets acceptable standards
- [ ] Accessibility standards are maintained

## Implementation Phases

### Phase 1: Foundation Setup
1. Update package.json with merged dependencies
2. Configure Tailwind CSS integration
3. Set up Web3 providers in root layout
4. Migrate shared components and utilities

### Phase 2: Layout Migration
1. Convert DashboardLayout to Next.js layout
2. Convert QNSProfileLayout to Next.js layout
3. Update Header and Sidebar components for Next.js
4. Implement proper navigation structure

### Phase 3: Page Migration
1. Replace landing page with frontend version
2. Enhance existing social, QNS, and bridge pages
3. Add missing dashboard pages
4. Add missing QNS pages
5. Implement proper routing and redirects

### Phase 4: Asset and Configuration Migration
1. Copy and optimize assets
2. Update import paths and references
3. Configure build tools and optimizations
4. Test and fix any remaining issues

### Phase 5: Testing and Optimization
1. Comprehensive testing of all functionality
2. Performance optimization
3. Bug fixes and refinements
4. Documentation updates