# ADU Construction Progress Dashboard - React + TypeScript

A modern, real-time dashboard for tracking ADU construction progress, expenses, and milestones using data from Google Sheets.

## 🎯 Key Features

✨ **Live Features:**
- 📊 Real-time budget tracking (syncs with Google Sheets)
- 💰 Payment milestone progress with visual indicators
- 🧾 Expense breakdown by category with drill-down details
- 📈 Animated progress indicators and metrics
- 🔄 Auto-refresh capability with manual refresh option
- 📱 Fully responsive mobile design
- 🔐 Google Sign-In authentication
- 🎨 Modern React + TypeScript architecture with Tailwind CSS

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18.2 with TypeScript
- Vite for fast development and production builds
- Tailwind CSS for styling
- Axios for HTTP requests
- React Hooks for state management

**Backend:**
- Python with FastAPI (for API)
- Google Sheets API integration
- Vercel serverless functions (for deployment)

### Project Structure

```
adu-dashboard/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── App.tsx          # Main application component
│   │   ├── Header.tsx       # Navigation header
│   │   ├── ProgressBar.tsx  # Progress visualization
│   │   ├── StatCard.tsx     # Statistics display
│   │   ├── Modal.tsx        # Generic modal component
│   │   ├── ExpenseBreakdown.tsx  # Expense details
│   │   └── SignOffSection.tsx    # Sign-off status
│   ├── hooks/               # Custom React hooks
│   │   ├── useFetchADUData.ts    # Data fetching hook
│   │   └── useAuth.ts            # Authentication hook
│   ├── services/            # Business logic services
│   │   ├── api.ts           # API client setup
│   │   ├── data.ts          # Data fetching service
│   │   └── auth.ts          # Authentication service
│   ├── utils/               # Utility functions
│   │   ├── formatters.ts    # Number/currency formatting
│   │   └── dates.ts         # Date utilities
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Core types
│   ├── App.tsx              # Root component
│   ├── App.css              # App styles
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles
├── api/                     # Vercel serverless functions
│   ├── data.py              # API endpoint for data
│   └── sheets-link.py       # Authorization endpoint
├── tests/                   # Testing infrastructure
├── public/                  # Static assets
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind configuration
├── eslint.config.mjs        # ESLint configuration
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x
- Python 3.9+
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd 

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Development

```bash
# Start development server (Vite runs on http://localhost:5173)
npm run dev

# In another terminal, start backend API
# Option 1: Using Python server
python3 server.py

# Option 2: Using simple HTTP server (static data)
python3 -m http.server 8000
```

Then open: **http://localhost:5173**

### Type Checking

```bash
# Check for TypeScript errors
npm run type-check
```

### Linting

```bash
# Check code quality
npm run lint
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📡 API Endpoints

If using the backend server:

```
GET /api/data
  → Returns latest ADU data from Google Sheets
  
GET /api/refresh
  → Force refresh from Google Sheets

GET /api/sheets-link?email=user@example.com
  → Returns authorized Google Sheets link (if user is whitelisted)
```

## 🔐 Authentication

The dashboard supports Google Sign-In for secure access to sensitive data:

1. Users sign in with their Google account
2. Session is stored in localStorage (24-hour expiry)
3. Authorized users can access expense details and Google Sheets
4. Email whitelist controls access to sensitive features

## 🎨 Component API Reference

### ProgressBar Component

```tsx
<ProgressBar
  progress={65}
  milestones={[
    { name: 'Foundation', position: 10 },
    { name: 'Framing', position: 50 },
  ]}
/>
```

### StatCard Component

```tsx
<StatCard
  label="Total Spent"
  value="$150,000"
  icon="💰"
  highlight={true}
  subtext="80% of budget"
/>
```

### Modal Component

```tsx
<Modal
  isOpen={true}
  onClose={() => {}}
  title="Category Details"
  size="md"
>
  {/* Content */}
</Modal>
```

## 🧪 Testing

```bash
# Run all tests
npm run test:all

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

## 📝 Environment Variables

Create a `.env` file (based on `.env.example`):

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api

# Google Sign-In Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Environment
VITE_ENV=development
```

## 🚢 Deployment

### Vercel Deployment

```bash
# Build and deploy
npm run build
vercel deploy
```

### Static Export

```bash
# Build static site
npm run build

# Deploy dist/ folder to your hosting
```

## 🐛 Troubleshooting

### Port 5173 already in use

```bash
# Use a different port
npm run dev -- --port 3000
```

### Module not found errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors

```bash
# Check for type issues
npm run type-check

# Rebuild types
npm run build
```

## 📚 Documentation

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Axios Documentation](https://axios-http.com/docs)

## 📋 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## 📄 License

This project is proprietary and confidential.

## 👤 Author

Danh Le

## 🤝 Contributing

This is a personal project. For contributions, please contact the owner.

---

**Last Updated:** February 2026
