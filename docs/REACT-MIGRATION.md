# ADU Dashboard - React Frontend Migration Guide

## ✨ What's New

You now have a modern React + TypeScript frontend for the ADU Dashboard! Here's what changed:

### Before (Old Setup)
- Single 1072-line HTML file with embedded JavaScript
- Inline CSS and scripts mixed together
- No component architecture
- No type safety
- Difficult to maintain and extend

### After (New Setup)
- ✅ Modular React component architecture
- ✅ Full TypeScript type safety
- ✅ Tailwind CSS for styling
- ✅ Reusable hooks for state management
- ✅ Separated concerns (services, components, utilities)
- ✅ Better testing infrastructure
- ✅ Fast development with Vite
- ✅ Production-ready build optimization

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd 
npm install
```

### 2. Set Up Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
# You need Google Sign-In Client ID for authentication
```

### 3. Start Development Server
```bash
# Terminal 1: Start React development server
npm run dev
# Opens at http://localhost:5173

# Terminal 2: Start Python backend API
python3 server.py
# Runs at http://localhost:8000
```

### 4. Build for Production
```bash
npm run build
npm run preview
```

## 📁 Key Files & Directories

### Components (`src/components/`)
- **App.tsx** - Main dashboard component
- **Header.tsx** - Navigation header with auth
- **ProgressBar.tsx** - Visual progress indicator
- **StatCard.tsx** - Statistics display card
- **ExpenseBreakdown.tsx** - Expense details & modal
- **SignOffSection.tsx** - Contractor sign-off status
- **Modal.tsx** - Generic reusable modal

### Hooks (`src/hooks/`)
- **useFetchADUData.ts** - Fetches and caches ADU data
- **useAuth.ts** - Authentication state management

### Services (`src/services/`)
- **api.ts** - Axios client with interceptors
- **data.ts** - Data fetching & calculations
- **auth.ts** - Google Sign-In & session management

### Utilities (`src/utils/`)
- **formatters.ts** - Currency, number, text formatting
- **dates.ts** - Date calculations and formatting

### Types (`src/types/`)
- **index.ts** - All TypeScript interfaces & types

## 🛠️ Development Workflow

### Adding a New Feature

1. **Create a new component**
```tsx
// src/components/NewFeature.tsx
import React from 'react'

interface NewFeatureProps {
  title: string
}

export const NewFeature: React.FC<NewFeatureProps> = ({ title }) => {
  return <div>{title}</div>
}

export default NewFeature
```

2. **Use in App or other components**
```tsx
import { NewFeature } from '@components/NewFeature'

// In your component:
<NewFeature title="My Feature" />
```

3. **Add TypeScript types if needed**
```tsx
// src/types/index.ts
export interface NewFeatureData {
  id: string
  name: string
}
```

4. **Create a custom hook if managing state**
```tsx
// src/hooks/useNewFeature.ts
import { useState, useEffect } from 'react'

export const useNewFeature = () => {
  const [data, setData] = useState(null)
  // Hook logic here
  return { data }
}
```

### Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# All checks at once
npm run type-check && npm run lint
```

## 🎨 Styling Guide

### Using Tailwind CSS

The project uses Tailwind CSS. Common classes:
```tsx
// Colors
className="text-primary-500 bg-blue-50 border-gray-200"

// Responsive
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"

// Spacing
className="p-4 mb-8 gap-3"

// Hover/Active states
className="hover:bg-primary-600 transition-colors"
```

### Custom Colors

Available in `tailwind.config.js`:
- `primary-500`: Main brand color (#667eea)
- `primary-600`: Darker shade for hover
- `gradient-primary`: Brand gradient

### Responsive Design

Mobile-first approach:
```tsx
className="text-sm md:text-base lg:text-lg"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
className="p-2 md:p-4 lg:p-8"
```

## 🔐 Authentication Flow

1. User clicks "Sign in with Google" button
2. Google Sign-In modal appears
3. After signing in, credential is validated
4. Session is saved to localStorage (expires in 24 hours)
5. UI updates to show signed-in user
6. Restricted features become available

### Checking Auth Status

```tsx
import { useAuth } from '@hooks/useAuth'

function MyComponent() {
  const { isSignedIn, email, signOut } = useAuth()

  if (isSignedIn) {
    return <div>Welcome, {email}!</div>
  }

  return <div>Please sign in</div>
}
```

## 📊 Data Fetching

### Using the Data Hook

```tsx
import { useFetchADUData } from '@hooks/useFetchADUData'

function Dashboard() {
  const { data, loading, error, refetch } = useFetchADUData()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return <div>{/* Use data */}</div>
}
```

### Manual API Calls

```tsx
import { dataService } from '@services/data'

async function handleRefresh() {
  try {
    const data = await dataService.refreshData()
    // Use data
  } catch (error) {
    console.error('Error:', error)
  }
}
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Watch Mode
```bash
npm run test:watch
```

## 📦 Deployment Options

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Static Export
```bash
npm run build
# Upload dist/ folder to any static host
```

### Docker
```bash
docker build -t adu-dashboard .
docker run -p 3000:3000 adu-dashboard
```

## 🔗 Useful Links

- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Axios Docs**: https://axios-http.com

## ❓ Troubleshooting

### Port already in use
```bash
npm run dev -- --port 3000
```

### Build errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Type errors
```bash
npm run type-check
```

### CORS issues
Check that backend is running on port 8000 and configured in vite.config.ts

## 📝 Project Structure Comparison

### Old (HTML + Inline JS)
```
index.html (1072 lines)
├── CSS (inline)
├── JavaScript (inline)
└── Hard to maintain
```

### New (React + TypeScript)
```
src/
├── components/     (Reusable UI)
├── hooks/         (State logic)
├── services/      (Business logic)
├── utils/         (Helper functions)
├── types/         (Type definitions)
├── App.tsx        (Main component)
└── main.tsx       (Entry point)
```

## 🎯 Next Steps

1. **Test the development environment**
   ```bash
   npm run dev
   # Visit http://localhost:5173
   ```

2. **Add Google Sign-In credentials** to `.env`

3. **Connect backend API** and test data fetching

4. **Deploy to production** using your preferred platform

5. **Monitor and optimize** performance

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Run `npm run type-check` for TypeScript errors
3. Check the backend API is running
4. Review the specific component/service code
5. Check network requests in DevTools

---

**Happy coding! 🚀**
