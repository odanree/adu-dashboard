# ADU Construction Progress Dashboard

A modern React + TypeScript dashboard for tracking ADU construction progress, expenses, and milestones with real-time backend data management.

## 🎯 Features

✨ **Current Features:**
- 📊 Real-time budget tracking with backend persistence
- 💰 Customizable multi-phase expense breakdown (configurable via CMS)
- 🧾 Configurable expense items with dynamic details
- 📈 Animated progress visualization
- 🔐 Email-based authentication with whitelist
- 🔒 **Whitelisted users see:**
  - Full budget including all configured phases
  - All project phases and line items
  - Data Manager admin panel
- 👥 **Non-whitelisted users see:**
  - Public view with filtered phases
  - Project costs based on visibility rules
- 📱 Fully responsive mobile design
- ⚡ Built with React 18, TypeScript, Vite, and Tailwind CSS
- 🗄️ Python backend with data persistence to JSON

## 🚀 Quick Start

### Backend Setup

```bash
# Terminal 1: Start Python backend API
python3 server.py
# Runs at http://localhost:8888
```

### Frontend Setup

```bash
# Terminal 2: Start React development server
npm install  # if needed
npm run dev
# Opens at http://localhost:5173
```

Then open: **http://localhost:5173**

## 📋 Root Organization

This project follows **industry-standard conventions** for a clean, professional root directory:

**Root contains only essential files:**
- Configuration files (`.env`, `.gitignore`, `tsconfig.json`, etc.)
- Build/runtime configuration (`vite.config.ts`, `tailwind.config.js`, `jest.config.js`)
- Package management (`package.json`, `package-lock.json`)
- Core backend (`server.py`)
- Entry point (`index.html`)

**All documentation organized in `/docs`:**
- 10 markdown files covering every aspect
- See [📁 Project Structure](#-project-structure) section below for details
- All README links point to `/docs/` for easy maintenance

**Directories for source code:**
- `src/` - React components and application code
- `api/` - API routes and handlers
- `assets/` - Static files and images
- `tests/` - Test suites

## 📚 Documentation

### Getting Started
- **[Quick Reference](./docs/QUICK_REFERENCE.md)** - Commands, budget, emails, and quick lookup
- **[Admin Setup](./docs/ADMIN_SETUP.md)** - Admin panel features and usage guide

### Understanding the Project
- **[Project Overview](./docs/PROJECT-OVERVIEW.md)** - Current implementation status and features
- **[Development Summary](./docs/DEVELOPMENT-SUMMARY.md)** - Development phases and architecture
- **[Structure Guide](./docs/STRUCTURE.md)** - Detailed directory structure

### Technical & Deployment
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Deployment options (Vercel, S3, etc.)
- **[React Migration](./docs/REACT-MIGRATION.md)** - React migration history
- **[Changelog](./docs/CHANGELOG.md)** - Version history and release notes

### Git & Version Control
- **[Git Summary](./docs/GIT_AND_DOCUMENTATION_SUMMARY.md)** - Complete git organization
- **[Git History](./docs/GIT_COMMIT_SUMMARY.txt)** - Detailed commit history

## 🔌 API Endpoints

```
GET /api/data
  → Returns all expense phases with line items
  
POST /api/data
  → Save updated expense data to data.json
  
GET /api/sheets-link?email=USER_EMAIL
  → Check if email is whitelisted and return Google Sheets link
  
GET /api/expenses-signoff
  → Return expense sign-off status
```

## 🏗️ Data Structure

**Budget Calculation:** Dynamically calculated from configured phases

### Phase Configuration

Phases are fully configurable via the Data Manager:
- Each phase can contain multiple line items
- Phase totals are auto-calculated from line items
- Phases can be hidden/shown based on user role
- Budget totals update automatically when data changes

## 🔐 Authentication

Whitelisted emails are configured in `.env` file under `VITE_WHITELISTED_EMAILS`:

```bash
VITE_WHITELISTED_EMAILS=user1@example.com,user2@example.com
```

Users with whitelisted emails see:
- All 7 expense phases
- Full $225,200 budget
- Data Manager admin panel
- OHP cost breakdown

## 🛠️ Admin Panel

Whitelisted users can access the Data Manager to:
- Edit phase names and line item descriptions
- Update cost values
- Add/remove line items
- Auto-calculated phase totals
- Save changes to backend (persisted to data.json)

Access: Click "📊 Data Manager" button on dashboard footer (whitelisted users only)

## 📁 Project Structure

### Root Directory (Industry Standard)
```
/
├── README.md                    # Main project documentation (you are here)
├── package.json                 # Node dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite build configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── eslint.config.mjs            # ESLint configuration
├── jest.config.js               # Jest test configuration
├── vitest.config.mjs            # Vitest configuration
│
├── .env                         # Environment variables (local)
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── vercel.json                  # Vercel deployment config
│
├── server.py                    # Python backend API server
├── index.html                   # HTML entry point
│
├── src/                         # React source code
├── api/                         # API routes/handlers
├── assets/                      # Static assets
├── tests/                       # Test files
├── docs/                        # 📚 All documentation (organized)
├── node_modules/                # Dependencies (auto-generated)
└── .git/                        # Git repository
```

### Source Code Structure
```
src/
├── App.tsx                      # Main app with data filtering
├── Router.tsx                   # Page routing (Dashboard/Admin)
├── pages/
│   └── Admin.tsx               # Data manager admin panel
├── components/
│   ├── ExpenseBreakdown.tsx    # Phase display
│   ├── ProgressBar.tsx         # Progress visualization
│   ├── StatCard.tsx            # Metric cards
│   └── ... (other components)
├── hooks/
│   ├── useAuth.ts              # Authentication logic
│   └── useFetchADUData.ts      # Data fetching
├── styles/
│   ├── Admin.css               # Admin panel styling
│   ├── Router.css              # Navigation styling
│   └── App.css                 # Global styles
└── types/
    └── index.ts                # TypeScript interfaces
```

### Documentation Structure (`/docs`)
```
docs/
├── QUICK_REFERENCE.md          # Quick commands and lookup
├── ADMIN_SETUP.md              # Admin panel guide
├── PROJECT-OVERVIEW.md         # Implementation status
├── DEVELOPMENT-SUMMARY.md      # Development phases
├── STRUCTURE.md                # Detailed directory info
├── DEPLOYMENT.md               # Deployment instructions
├── CHANGELOG.md                # Version history
├── REACT-MIGRATION.md          # Migration notes
├── GIT_AND_DOCUMENTATION_SUMMARY.md  # Git organization
└── GIT_COMMIT_SUMMARY.txt      # Detailed commit history
```

## 🚀 Deployment

See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions on:
- Building for production
- Deploying to Vercel
- Deploying to AWS S3 + CloudFront
- Other hosting options

## 🔄 Recent Changes

### Latest Updates (v2.0)

- ✅ Added OHP (Overhead & Profit) phase for whitelisted users only
- ✅ Updated total budget to $225,200 for whitelisted, $214,076 for others
- ✅ Data Manager admin panel with full CRUD operations
- ✅ Backend data persistence to JSON file
- ✅ Compressed vertical spacing on Admin panel
- ✅ Fixed phase header alignment (prices stay on one line)
- ✅ Phase prices now align vertically in dashboard grid
- ✅ Non-whitelisted users cannot see Data Manager button
- ✅ Non-whitelisted users filtered from seeing OHP data
- ✅ Refactored root directory with industry standards
- ✅ All documentation moved to `/docs` directory

## ❓ Troubleshooting

**Port 8888 already in use:**
```bash
# Find and kill the process
lsof -i :8888
kill -9 <PID>

# Then restart
python3 server.py
```

**Port 5173 already in use:**
```bash
npm run dev -- --port 3000
# Will run on http://localhost:3000
```

**Dependencies issues:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

For more troubleshooting, see [Deployment Guide](./docs/DEPLOYMENT.md).

## 🔗 Useful Links

- See [Changelog](./docs/CHANGELOG.md) for version history
- See [Git History](./docs/GIT_AND_DOCUMENTATION_SUMMARY.md) for project timeline
- See [Structure Guide](./docs/STRUCTURE.md) for detailed directory info

---

**Project Location:** `/`  
**Last Updated:** February 11, 2026  
**Status:** ✅ v2.0 Production Ready  
**Built with:** React 18, TypeScript, Python, Tailwind CSS
