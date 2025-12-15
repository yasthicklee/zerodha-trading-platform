# 🚀 Vercel Deployment Guide

This guide will help you deploy your Zerodha Trading Platform to Vercel with PostgreSQL database.

## 📋 Prerequisites

### 1. **Vercel Account**
- Sign up at [vercel.com](https://vercel.com)
- Install Vercel CLI: `npm install -g vercel`
- Login: `vercel login`

### 2. **PostgreSQL Database**
We recommend using **Supabase** (free PostgreSQL):
- Go to [supabase.com](https://supabase.com)
- Create new project
- Get connection string from Settings > Database

### 3. **GitHub Repository**
- Push your code to GitHub
- Vercel will auto-deploy on push

---

## 🔧 Configuration Steps

### **Step 1: Update Database Configuration**

#### **Option A: Supabase (Recommended)**
```env
# In Vercel Environment Variables
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

#### **Option B: Railway PostgreSQL**
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST].railway.app:5432/railway"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST].railway.app:5432/railway"
```

### **Step 2: Set Up Environment Variables**

In your Vercel project dashboard, add these environment variables:

```env
# Database
DATABASE_URL="your-postgresql-connection-string"
DIRECT_URL="your-postgresql-connection-string"

# NextAuth
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="your-32-character-random-secret"

# Application
NEXT_PUBLIC_APP_URL="https://your-app-name.vercel.app"

# Zerodha (optional - add when you have API keys)
ZERODHA_API_KEY="your-zerodha-api-key"
ZERODHA_API_SECRET="your-zerodha-api-secret"
```

### **Step 3: Generate NextAuth Secret**
```bash
# Generate a secure secret
openssl rand -base64 32
```

---

## 🚀 Deployment Methods

### **Method 1: Vercel CLI (Recommended)**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from project root
vercel --prod

# 4. Follow prompts:
# - Link to existing project? No
# - Project name? zerodha-trading-platform
# - Directory? . (current directory)
# - Override settings? No
```

### **Method 2: Vercel Dashboard**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js
5. Configure environment variables
6. Deploy

### **Method 3: GitHub Integration**
1. Connect GitHub to Vercel
2. Push to your main branch
3. Vercel will auto-deploy
4. Configure environment variables in dashboard

---

## 🗄️ Database Setup

### **Supabase Setup (Recommended)**
```bash
# 1. Create Supabase project
# 2. Go to Settings > Database
# 3. Copy Connection string
# 4. Add to Vercel environment variables

# 5. Run migrations (if needed)
# Generate Prisma client
bun run db:generate

# Push schema to Supabase
bun run db:push
```

### **Railway Setup**
```bash
# 1. Create Railway account
# 2. Create PostgreSQL service
# 3. Get connection string
# 4. Add to Vercel environment variables
```

---

## 🔧 Configuration Files

### **vercel.json** (Already created)
```json
{
  "buildCommand": "bun run build",
  "outputDirectory": ".next",
  "installCommand": "bun install",
  "framework": "nextjs",
  "regions": ["hkg1", "sin1"],
  "functions": {
    "src/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### **next.config.ts** (Already updated)
- ✅ Prisma client optimization
- ✅ CORS headers for API routes
- ✅ Image domains for Zerodha
- ✅ Environment variable support

---

## 🧪 Testing Your Deployment

### **1. Check Build Logs**
```bash
# Vercel dashboard > Your Project > Functions > Logs
# Look for any build errors
```

### **2. Test API Endpoints**
```bash
# Test baskets API
curl https://your-app-name.vercel.app/api/baskets?userId=demo-user-1

# Test strategies API
curl https://your-app-name.vercel.app/api/strategies?userId=demo-user-1
```

### **3. Test Database Connection**
- Check if database is accessible
- Verify Prisma client generation
- Test seeded data appears

---

## 🔄 Auto-Deploy Setup

### **GitHub Integration**
1. Connect your GitHub repository to Vercel
2. Vercel will auto-deploy on push to main
3. Configure preview deployments for PRs
4. Set up custom domains if needed

### **Environment-Specific Config**
```bash
# Production builds will use production env vars
# Preview builds will use preview env vars
# Development remains local
```

---

## 📊 Monitoring & Analytics

### **Vercel Analytics**
- Go to Vercel dashboard
- View usage metrics
- Monitor function performance
- Check error rates

### **Database Monitoring**
- Supabase: Built-in monitoring
- Railway: Usage metrics
- Check connection limits

---

## 🚨 Common Issues & Solutions

### **Issue: Database Connection Error**
```bash
# Solution: Check DATABASE_URL format
# Should be: postgresql://user:pass@host:port/db
# Verify database is accessible
```

### **Issue: Prisma Client Error**
```bash
# Solution: Regenerate client
bun run db:generate

# Check schema matches database
bun run db:push
```

### **Issue: API Timeouts**
```bash
# Solution: Optimize database queries
# Add indexes to schema
# Use connection pooling
```

### **Issue: Build Failures**
```bash
# Solution: Check build logs
# Verify all dependencies installed
# Check TypeScript errors
```

---

## 🎯 Production Checklist

### **Before Going Live:**
- [ ] PostgreSQL database configured
- [ ] Environment variables set
- [ ] NextAuth secret generated
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled (automatic)
- [ ] Database migrations run
- [ ] API endpoints tested
- [ ] Error monitoring set up

### **After Deployment:**
- [ ] Test all user flows
- [ ] Verify database operations
- [ ] Check mobile responsiveness
- [ ] Test Zerodha integration
- [ ] Monitor performance metrics

---

## 🌐 Custom Domain Setup

### **Configure Custom Domain**
1. Go to Vercel dashboard
2. Your Project > Settings > Domains
3. Add your custom domain
4. Update DNS records
5. Update NEXTAUTH_URL

### **SSL Certificate**
- ✅ Automatic SSL from Vercel
- ✅ Free SSL renewal
- ✅ HTTP to HTTPS redirect

---

## 📈 Scaling Considerations

### **When to Upgrade:**
- **Vercel Pro**: More bandwidth, functions
- **Supabase Pro**: More database connections
- **Monitoring**: Add error tracking

### **Performance Optimization:**
- Enable Edge Functions where possible
- Use database connection pooling
- Implement API response caching
- Optimize database queries

---

## 🎉 Success!

Your Zerodha Trading Platform is now live on Vercel! 🚀

**Your app is available at:** `https://your-app-name.vercel.app`

**Next steps:**
1. Configure your Zerodha API credentials
2. Test all trading features
3. Monitor performance and usage
4. Set up custom domain (optional)
5. Scale as needed

Happy trading! 📈