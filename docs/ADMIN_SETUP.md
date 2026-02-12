# ADU Dashboard - Admin Setup Guide

## Overview

The Admin Panel is a complete data management system for editing ADU budget and expense data. Only whitelisted users can access this feature.

### Components

1. **Admin Panel** (`/src/pages/Admin.tsx`)
   - Clean, professional interface for editing expense data
   - Edit phase names, line items, and costs
   - Real-time total calculations
   - Save/load functionality
   - Visible only to whitelisted users

2. **Python Backend** (`server.py`)
   - Serves API data from JSON file (`data.json`)
   - POST endpoint to save changes
   - CORS enabled for cross-origin requests
   - Maintains default fallback data (7 phases including OHP)

3. **Router Navigation** (`src/Router.tsx`)
   - Toggles between Dashboard and Admin pages
   - "Data Manager" button hidden from non-whitelisted users
   - "Back to Dashboard" button on admin page

4. **Data Persistence**
   - Data stored in `data.json` file
   - Falls back to hardcoded defaults if file doesn't exist
   - Easy to edit directly or through admin UI

## Access Requirements

✅ **Must be signed in**  
✅ **Email must be whitelisted** (set via `WHITELISTED_EMAILS` environment variable)  

⛔ Non-whitelisted users will NOT see the Data Manager button

### Setting Up Whitelisted Emails

**Local Development:**
```bash
# In your .env file
WHITELISTED_EMAILS=user1@example.com,user2@example.com
```

**Production (Railway):**
1. Go to Railway project dashboard
2. Click "Variables"
3. Add new variable:
   - **Name:** `WHITELISTED_EMAILS`
   - **Value:** `email1@example.com,email2@example.com` (comma-separated)
4. Deploy - the whitelist is now active

## How to Use

### Start the Backend
```bash
cd 
python3 server.py
# Runs on http://localhost:8888
```

### Start the Frontend
```bash
cd 
npm run dev
# Runs on http://localhost:5173
```

### Access the Admin Panel

1. Open http://localhost:5173 in browser
2. Sign in with a whitelisted email (configured in `.env`)
3. Click "📊 Data Manager" button at bottom of dashboard
4. Edit expense data as needed
5. Click "Save All Changes" to persist to backend

### Manage Expense Data

**View & Edit:**
- ✏️ Edit phase names
- ✏️ Edit line item descriptions
- 💰 Edit cost values
- 📊 Real-time phase total recalculation

**Modify Structure:**
- ➕ Add new phases with custom names and budgets
- ➕ Add new line items to any phase
- ❌ Remove phases or line items
- 🔒 Configure phase visibility (public vs. restricted)
- 💾 Save changes to backend

## Data Structure

Phases are fully configurable through the admin interface:

**Public Phases:**
- Visible to all users (whitelisted and non-whitelisted)
- Budget included in totals for all users

**Restricted Phases:**
- Visible only to whitelisted users
- Budget included only in whitelisted user totals
- Hidden completely from non-whitelisted view

**Dynamic Calculations:**
- Phase totals = Sum of all line items in phase
- Budget totals = Sum of all visible phases for current user
- Updates in real-time as data changes

## API Endpoints

All endpoints run on `http://localhost:8888`

```
GET /api/data
  Returns complete expense data structure (all phases configured)
  Example response:
  {
    "expenses": [
      {
        "phase": 1,
        "category": "[Phase name configured in admin]",
        "visibility": "public",
        "items": [
          {"task": "[Item name]", "cost": 1000},
          {"task": "[Item name]", "cost": 2000}
        ],
        "total": 3000
      },
      {
        "phase": 2,
        "category": "[Restricted phase]",
        "visibility": "restricted",
        "items": [...],
        "total": 5000
      }
    ],
    "lastUpdated": "[ISO timestamp]"
  }

POST /api/data
  Saves updated expense data to data.json
  Request body: Same structure as GET response
  Response: { "success": true, "message": "Data saved" }

GET /api/sheets-link?email=USER_EMAIL
  Checks if email is whitelisted and returns Google Sheets link
  Response: { "authorized": true/false, "url": "..." }
```

## File Organization

```
/admin-related/
├── src/Router.tsx              # Page navigation (+ whitelist check)
├── src/pages/Admin.tsx         # Admin data manager component
├── src/styles/Admin.css        # Admin panel styling
├── src/styles/Router.css       # Navigation styling
├── src/hooks/useAuth.ts        # Auth state (isWhitelisted)
├── server.py                   # Backend API
└── data.json                   # Persistent data storage
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Data Manager button not visible | Ensure you're signed in with whitelisted email |
| Changes not saving | Check backend is running on port 8888 |
| Server error on save | Verify data.json file exists and is writable |
| Admin page shows errors | Reload page and try again |
| OHP data showing for all users | Clear browser cache/localStorage |

## Security Notes

✅ **Access Control:**
- Data Manager only visible to whitelisted users
- Admin page can be accessed directly but requires whitelist check
- OHP data filtered in App.tsx based on whitelist status

✅ **Data Protection:**
- All data saved to JSON file on backend
- No external API calls for data storage
- No database required

## Future Enhancements

Potential improvements for Admin Panel:
- [ ] Add expense categories/grouping
- [ ] Bulk upload from CSV
- [ ] Export to Excel
- [ ] Audit trail of changes
- [ ] Date tracking for when items were added
- [ ] Item descriptions/notes field
- [ ] Multi-user approval workflow
- 💾 Save changes to backend
- 🔄 Reload data to discard changes

## Data Structure

```json
{
  "expenses": [
    {
      "category": "Phase 1: Site Mobilization",
      "phase": 1,
      "total": 21800,
      "items": [
        {
          "task": "Architect and Engineering",
          "cost": 8000
        }
      ]
    }
  ],
  "lastUpdated": "2026-02-11T20:00:00.000000"
}
```

## API Endpoints

- **GET /api/data** - Fetch current data
- **POST /api/data** - Save data (body: JSON data object)
- **GET /api/sheets-link?email=X** - Check authorization
- **GET /api/expenses-signoff** - Get sign-off status

## File Locations

- **Admin Component**: `src/pages/Admin.tsx`
- **Admin Styles**: `src/styles/Admin.css`
- **Router**: `src/Router.tsx`
- **Backend**: `server.py`
- **Data File**: `data.json` (created on first save)

## Features

✅ Add/edit/remove expense items
✅ Automatic total recalculation
✅ Real-time budget tracking
✅ Persistent data storage
✅ Responsive mobile-friendly design
✅ Clean, intuitive UI
✅ No external dependencies for admin UI (pure CSS)

## Next Steps (Optional)

1. **Deploy Admin Panel** - Add authentication to restrict access
2. **Google Sheets Sync** - Connect to Google Sheets for real-time sync
3. **Audit Trail** - Track who changed what and when
4. **Export Functions** - Export data to CSV/PDF
5. **Multi-user** - Add user permissions for editing

## Troubleshooting

**Admin panel not loading?**
- Check that both Vite dev server and Python backend are running
- Ensure backend is on port 8888

**Changes not saving?**
- Check browser console for errors
- Verify `data.json` file has write permissions

**Port already in use?**
- For port 8888: `lsof -ti:8888 | xargs kill -9`
- For port 5173: `lsof -ti:5173 | xargs kill -9`

