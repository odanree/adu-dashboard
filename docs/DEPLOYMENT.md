# ADU Dashboard - Deployment Guide

## 📦 Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the fastest way to deploy React apps. They support serverless functions for your Python backend.

#### Prerequisites
- Vercel account (free at vercel.com)
- GitHub repository

#### Steps

1. **Push to GitHub**
```bash
git add .
git commit -m "React + TypeScript refactor"
git push origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Select your repository
- Vercel auto-detects it's a Vite project

3. **Configure Build**
```
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

4. **Environment Variables**
Add in Vercel dashboard:
```
VITE_API_URL=/api
VITE_GOOGLE_CLIENT_ID=your_client_id
```

5. **Deploy**
- Click "Deploy"
- Vercel builds and deploys automatically
- Your site is live!

#### Automatic Deployments
- Push to `main` branch → automatic production deploy
- Create pull request → automatic preview deploy

---

### Option 2: AWS S3 + CloudFront

For static hosting with CDN and custom domain.

#### Prerequisites
- AWS account
- S3 bucket (e.g., `adu-dashboard.example.com`)
- CloudFront distribution
- Custom domain (optional)

#### Steps

1. **Build the project**
```bash
npm run build
# Creates dist/ folder with optimized files
```

2. **Install AWS CLI**
```bash
# macOS
brew install awscli

# Or install globally with pip
pip3 install awscli
```

3. **Configure AWS credentials**
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1
# Default output format: json
```

4. **Deploy to S3**
```bash
# Sync dist/ to S3 bucket
aws s3 sync dist/ s3://adu-dashboard.example.com --delete

# Make files public (for static hosting)
aws s3 cp s3://adu-dashboard.example.com --recursive --exclude "*" --include "*.*" --metadata-directive COPY --cache-control max-age=31536000
```

5. **Invalidate CloudFront cache**
```bash
# Replace with your distribution ID
aws cloudfront create-invalidation \
  --distribution-id E1Q8F9KWR1P5M3 \
  --paths "/*"
```

#### S3 Bucket Configuration
- Enable static website hosting
- Set index.html as default
- Configure error page to index.html (for SPA routing)

---

### Option 3: Railway / Render

Easy deployment with Git integration.

#### Railway

1. **Connect GitHub**
- Go to [railway.app](https://railway.app)
- Click "New Project"
- Select "GitHub Repo"

2. **Configure**
```
Build Command: npm run build
Start Command: npm run preview
Port: 3000
```

3. **Deploy**
- Click "Deploy"
- Railway handles everything

#### Render

1. **Create Static Site**
- Go to [render.com](https://render.com)
- Click "New +"
- Select "Static Site"

2. **Connect GitHub**
- Select your repository
- Set build command: `npm run build`
- Set publish directory: `dist`

3. **Deploy**
- Click "Create Static Site"

---

### Option 4: Docker + Self-Hosted

For complete control over deployment.

#### Create Dockerfile
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

#### Build and Push
```bash
# Build Docker image
docker build -t adu-dashboard:latest .

# Test locally
docker run -p 3000:3000 adu-dashboard:latest

# Push to registry
docker push your-registry/adu-dashboard:latest
```

#### Deploy
```bash
# Docker Compose (local)
docker-compose up -d

# Kubernetes
kubectl apply -f deployment.yaml

# AWS ECS, Google Cloud Run, etc.
# Follow their specific instructions
```

---

## 🔐 Environment Variables

### Required for Production

```env
# API Configuration
VITE_API_URL=https://api.example.com

# Google Sign-In
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Analytics (optional)
VITE_GA_ID=your_google_analytics_id
```

### Get Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials
5. Copy "Client ID"
6. Add authorized JavaScript origins: `https://your-domain.com`

---

## 📊 Performance Optimization

### Before Deployment

```bash
# Check bundle size
npm run build

# Analyze production build
npm install -D vite-plugin-visualizer
# Then add to vite.config.ts and run build
```

### Tailwind CSS Purging
Automatically configured - only used styles included in build.

### Image Optimization
- Use WebP format
- Compress before uploading
- Use CDN for caching

### Code Splitting
Vite automatically splits code. No config needed.

---

## 🔄 Continuous Deployment

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run build
      
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🧪 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] TypeScript compilation succeeds
- [ ] ESLint passes with no errors
- [ ] Build completes without warnings
- [ ] Preview build works locally
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Google Sign-In credentials configured
- [ ] SSL/HTTPS enabled (production)
- [ ] CORS headers configured on backend
- [ ] Analytics tracking verified
- [ ] Error logging configured

---

## 📈 Monitoring & Maintenance

### Vercel Dashboard
- View deployments and logs
- Monitor performance
- Check analytics

### AWS CloudWatch
```bash
# View S3 access logs
aws s3api get-bucket-logging \
  --bucket adu-dashboard.example.com
```

### Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Datadog for monitoring

---

## 🆘 Troubleshooting Deployment

### Build fails with "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### TypeScript errors after deploy
```bash
npm run type-check
# Fix any errors before deploying
```

### API calls failing in production
- Check API_URL env variable
- Verify CORS headers on backend
- Check API endpoint is accessible

### Static assets not loading
- Verify build output directory
- Check asset paths in code
- Clear CDN cache

---

## 📝 Deployment Workflow

### Development
```bash
npm run dev          # Local development
npm run type-check   # Type checking
npm run lint         # Code quality
```

### Staging
```bash
npm run build        # Build optimized
npm run preview      # Test production build
```

### Production
```bash
git push origin main # Triggers automatic deploy
# Or manually deploy via Vercel/Docker/etc.
```

---

## 🎯 Recommended Setup

**For rapid development & deployment:**
1. Use **Vercel** for frontend
2. Use **Python backend** on separate service
3. Use **GitHub** for version control
4. Configure GitHub Actions for CI/CD

**For complete control:**
1. Use **Docker** for containerization
2. Deploy to **AWS ECS** or **Kubernetes**
3. Use **RDS** for database (future)
4. Use **ElastiCache** for caching (future)

---

## 📞 Support

For deployment help:
- Vercel: https://vercel.com/docs
- AWS: https://docs.aws.amazon.com/
- Docker: https://docs.docker.com/
- Railway: https://docs.railway.app/

---

**Last Updated:** February 2026
