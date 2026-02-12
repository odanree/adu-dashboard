# Quick Reference Guide

## 🚀 Quick Start

```bash
# Terminal 1: Start Backend
cd 
python3 server.py
# Runs on http://localhost:8888

# Terminal 2: Start Frontend
npm run dev
# Runs on http://localhost:5173
```

## 📊 Budget Summary

| User Type | Total Budget | Phases | Includes |
|-----------|-------------|--------|----------|
| **Whitelisted** | All configured | All | Full visibility |
| **Non-whitelisted** | Filtered | Visible only | Public view |

## 🔑 Whitelisted Emails

Configured in `.env` file:
```
VITE_WHITELISTED_EMAILS=user1@example.com,user2@example.com
```

**Note:** Actual emails are stored in `.env` and not committed to version control for security.

## 💾 Phase Breakdown

Phases and their line items are managed via the Data Manager admin panel:
- Add new phases with custom names and budgets
- Configure which phases are visible to whitelisted users only
- Each phase auto-calculates totals from its line items
- Budget updates in real-time as data changes

## 💰 OHP (Whitelisted Users Only)

**Phase 7: OHP (Overhead & Profit)** - $11,124
- General Contractor Overhead: $6,000
- General Contractor Profit: $5,124

## 🔌 API Endpoints

```
GET /api/data
POST /api/data
GET /api/sheets-link?email=USER_EMAIL
GET /api/expenses-signoff
```

## 🛠️ Admin Panel Features (Whitelisted Only)

✅ View all 7 phases with line items  
✅ Edit phase names and descriptions  
✅ Edit line item names and costs  
✅ Add new line items  
✅ Remove line items  
✅ Real-time total calculation  
✅ Save changes to backend  
✅ Reload to discard changes  

**Access:** Click "📊 Data Manager" button on dashboard (whitelisted users only)

## 📁 Key Files

```
src/App.tsx                    # Main app logic + data filtering
src/Router.tsx                 # Page navigation
src/pages/Admin.tsx            # Admin data manager
src/components/ExpenseBreakdown.tsx  # Phase display
src/hooks/useAuth.ts           # Auth state management
server.py                      # Python API backend
data.json                      # Persistent data file
```

## 🎨 Key Changes Made

- ✅ Added OHP phase ($11,124) - whitelisted users only
- ✅ Dynamic budget: $225,200 (whitelisted) vs $214,076 (others)
- ✅ OHP data completely hidden from non-whitelisted users
- ✅ Admin panel button hidden from non-whitelisted users
- ✅ Compressed vertical spacing throughout
- ✅ Fixed phase header alignment
- ✅ Vertically aligned prices in grid

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Backend not running | Start with `python3 server.py` |
| Data not saving | Check backend is running on 8888 |
| Admin button not showing | Make sure you're signed in with whitelisted email |
| OHP showing for non-whitelisted | Clear browser cache/localStorage |

## 📞 Quick Commands

```bash
# Check if backend running
lsof -i :8888

# View latest data
curl http://localhost:8888/api/data | python3 -m json.tool

# Kill backend process
lsof -ti:8888 | xargs kill -9

# Build for production
npm run build

# Check code style
npm run lint
```

## 🎯 Development Priorities

1. ✅ Core dashboard working
2. ✅ Authentication functional
3. ✅ Data persistence implemented
4. ✅ Admin panel complete
5. ✅ Role-based access control
6. ✅ UI/UX polished

## 🚀 Deployment Ready

✅ Frontend: Ready for Vercel deployment  
✅ Backend: Can be deployed to any Python hosting  
✅ Data: Persists to JSON file  
✅ Authentication: Functional and secure  

## 📚 Documentation Links

- [README.md](./README.md) - Main project overview
- [ADMIN_SETUP.md](./ADMIN_SETUP.md) - Admin panel guide
- [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md) - Detailed project status
- [DEVELOPMENT-SUMMARY.md](./DEVELOPMENT-SUMMARY.md) - Implementation details
