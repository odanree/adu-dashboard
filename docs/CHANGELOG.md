# Changelog

All notable changes to the ADU Dashboard project are documented here.

## [2.0] - 2026-02-11

### Added

#### Phase 7: OHP (Overhead & Profit)
- New phase for whitelisted users only: $11,124 total
- Includes 2 line items:
  - General Contractor Overhead: $6,000
  - General Contractor Profit: $5,124
- Completely hidden from non-whitelisted users

#### Role-Based Data Filtering
- Whitelisted users now see full $225,200 budget (includes OHP)
- Non-whitelisted users see $214,076 budget (excludes OHP)
- Dynamic budget calculation based on user whitelist status

#### Admin Panel Enhancements
- Data Manager button now only visible to whitelisted users
- Added check in Router.tsx to conditionally render button
- Non-whitelisted users cannot access admin functionality

#### Documentation Updates
- Updated README.md with v2.0 features
- Updated PROJECT-OVERVIEW.md with current status
- Updated DEVELOPMENT-SUMMARY.md with implementation details
- Updated ADMIN_SETUP.md with admin access requirements
- Created QUICK_REFERENCE.md for quick lookup

### Fixed

#### Data Filtering
- Fixed "payment is not defined" error in App.tsx line 81
- Changed `payment.title` to `expense.category` for fallback milestone names

#### UI/UX Improvements
- Compressed vertical padding throughout Admin panel (20px → 10px)
- Fixed phase header alignment to keep titles and prices on one line
- Vertically aligned phase prices in dashboard grid
- Changed grid layout from flex-scroll to responsive grid (2-6 columns)

#### Event Handling
- Fixed issue where clicking inputs in admin panel closed phase panels
- Added `onClick={(e) => e.stopPropagation()}` to prevent event bubbling

### Changed

#### Budget Calculations
- Updated `totalBudget` to be dynamic based on `isWhitelisted` status
- Whitelisted: $225,200 (7 phases)
- Non-whitelisted: $214,076 (6 phases)
- Updated milestone creation to use filtered expenses

#### Component Updates
- App.tsx: Added `visibleExpenses` filtering logic
- Router.tsx: Added `useAuth()` hook for whitelist check
- ExpenseBreakdown.tsx: Grid layout improvements for price alignment

#### Admin Panel
- Improved vertical spacing for compact, professional look
- Phase headers now maintain single-line layout
- Better mobile responsiveness

### Removed

- ❌ Removed hardcoded 6-phase limit (now dynamic)
- ❌ Removed `payment` variable references (replaced with expense)

### Security

- ✅ Strengthened role-based access control
- ✅ Hidden sensitive OHP data from non-whitelisted users
- ✅ Admin panel button hidden from unauthorized users
- ✅ Data filtering happens on frontend and backend

## [1.0] - 2026-02-10

### Initial Release

#### Core Features
- React 18 + TypeScript + Vite setup
- Tailwind CSS responsive styling
- Python backend with JSON persistence
- 6-phase expense tracking with line items
- Email-based authentication
- Whitelisted user access control

#### Components
- Dashboard with stat cards
- Progress bar visualization
- Expense breakdown display
- Admin panel for data management
- Modal for expense details
- Header with auth controls

#### Backend
- HTTP API server (Python)
- GET /api/data endpoint
- POST /api/data endpoint
- GET /api/sheets-link endpoint
- CORS headers enabled
- JSON file persistence

#### Infrastructure
- Vite dev server (fast reload)
- Path aliases for cleaner imports
- TypeScript strict mode
- ESLint code quality
- Responsive mobile design

---

## Version History Summary

| Version | Date | Status | Features |
|---------|------|--------|----------|
| 2.0 | 2026-02-11 | ✅ Stable | OHP phase, role-based filtering, admin button controls |
| 1.0 | 2026-02-10 | ✅ Stable | Core dashboard, auth, admin panel |

---

## Known Issues & Limitations

### Current Limitations
- None currently known

### Future Considerations
- Google Sheets live sync (currently using fallback data)
- Email notifications for changes
- Audit trail for data modifications
- CSV/Excel import functionality
- Payment milestone tracking

---

## Development Timeline

### Session 1: Core Setup
- Created React + TypeScript project structure
- Set up Vite build configuration
- Implemented authentication system
- Created basic dashboard layout

### Session 2: Data Management
- Built Python backend API
- Implemented JSON persistence
- Created Admin panel component
- Added expense editing capabilities

### Session 3: UI/UX Refinements
- Compressed vertical spacing
- Fixed layout alignment
- Improved responsive design
- Enhanced visual hierarchy

### Session 4: Authorization & OHP
- Added whitelist-based data filtering
- Implemented OHP phase (whitelisted only)
- Updated budget calculations
- Restricted admin access
- Updated documentation

---

## Testing Checklist

- [x] Backend API working on localhost:8888
- [x] Frontend running on localhost:5173
- [x] Data persisting to data.json
- [x] Whitelisted users see all 7 phases
- [x] Non-whitelisted users see 6 phases
- [x] Admin button visible only to whitelisted
- [x] OHP data hidden from non-whitelisted
- [x] Budget calculations correct
- [x] UI responsive on mobile/tablet/desktop
- [x] No console errors in browser

---

## Credits

**Project:** ADU Construction Dashboard  
**Owner:** Danh Le  
**Tech Stack:** React 18, TypeScript, Python 3, Vite, Tailwind CSS  
**Backend:** Python HTTP Server with JSON persistence  
**Frontend:** React with modern hooks and components  

---

**Last Updated:** February 11, 2026
