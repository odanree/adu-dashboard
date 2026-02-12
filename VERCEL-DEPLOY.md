# 🚀 Deploy ADU Dashboard to Vercel

Your ADU Dashboard is ready to deploy! Follow these steps to get it live:

## Step 1: Vercel Account

1. Go to https://vercel.com
2. Sign up (or log in if you have an account)
3. Click "New Project"

## Step 2: Deploy Options

### Option A: Deploy from GitHub (Recommended)

1. Push this folder to GitHub:
```bash
cd 
git remote add origin https://github.com/YOUR_USERNAME/adu-dashboard
git branch -M main
git push -u origin main
```

2. On Vercel, click "Import Project"
3. Select "Import Git Repository"
4. Paste: `https://github.com/YOUR_USERNAME/adu-dashboard`
5. Click "Import"
6. Vercel will auto-detect the settings
7. Click "Deploy"

### Option B: Deploy from CLI

1. Run in this directory:
```bash
cd 
vercel login
vercel --prod
```

2. Follow the prompts:
   - Project name: `adu-dashboard`
   - Scope: Your account
   - Link to existing project: No
   - Build command: Leave blank (press Enter)
   - Output directory: `.` (current directory)

## Step 3: Environment Setup

After deployment, configure these in Vercel Project Settings:

### For real-time Google Sheets sync:

1. Go to Project Settings → Environment Variables
2. Add:
   - `GOG_ACCOUNT` = `dtle82@gmail.com`
   - `SHEET_ID` = `1ZTX4H7qQPVZcU4TwoXcOVdbovHmRy3DZrcdfA3Qw2wk`

## Step 4: First Launch

After deployment:
1. Vercel will give you a URL like `adu-dashboard-xyz.vercel.app`
2. Visit it and you should see your dashboard
3. The data will load from hardcoded fallback initially
4. For live sync, you'll need to set up authentication

## 🎉 Done!

Your dashboard is now live! Share the URL with anyone who needs to track the ADU project.

## Future Enhancements

To enable real-time Google Sheets sync on Vercel:
1. Set up Google Service Account credentials
2. Upload to Vercel as encrypted environment variables
3. Update `api/data.py` to use service account auth

---

**Need help?** Check `/README.md`
