# 🚀 GitHub & Vercel Deployment Checklist

## ✅ Pre-Deployment Preparation

### 1. **Environment Variables** 
Check that your `.env.local` has all required values:

```bash
# Required
✅ POSTGRES_URL
✅ NEXTAUTH_SECRET
✅ NEXTAUTH_URL
✅ RESEND_API_KEY

# Optional (but recommended)
⬜ UPLOADTHING_SECRET
⬜ UPLOADTHING_APP_ID
```

### 2. **Generate Production Secrets**

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or visit: https://generate-secret.vercel.app/32
```

### 3. **Database Setup**

**Production Database (Choose one):**
- [ ] **Neon** (Free): https://neon.tech
- [ ] **Vercel Postgres**: https://vercel.com/storage/postgres  
- [ ] **Supabase**: https://supabase.com

**Get Connection String:**
```
postgresql://user:password@host.region.neon.tech/dbname?sslmode=require
```

### 4. **API Keys**

- [ ] **Resend API Key**: https://resend.com/api-keys
- [ ] **UploadThing Keys** (optional): https://uploadthing.com/dashboard

---

## 📦 Files to Check

### **Required Files:**
- [x] `.gitignore` ✅ Already updated
- [x] `.env.example` ✅ Already created
- [x] `package.json` ✅ Has build scripts
- [x] `next.config.mjs` ✅ Exists
- [x] `PROJECT_GUIDE.md` ✅ Complete documentation

### **Verify These Files:**

```bash
# Check gitignore
cat .gitignore

# Check env example
cat .env.example

# Test build locally
npm run build
```

---

## 🔨 Build Test (Critical!)

**Test your build BEFORE pushing:**

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Start production server
npm start

# 4. Visit http://localhost:3000
# 5. Test: Login, Browse shops, Create booking
```

**If build fails:**
- Check TypeScript errors: `npm run lint`
- Fix any errors before deploying
- Clear cache: `rm -rf .next node_modules && npm install`

---

## 📤 Push to GitHub

### **First Time Setup:**

```bash
# 1. Initialize git (if not done)
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit - Barbershop booking platform"

# 4. Create GitHub repo
# Go to: https://github.com/new
# Name: booking (or your preferred name)
# Don't initialize with README

# 5. Add remote
git remote add origin https://github.com/YOUR_USERNAME/booking.git

# 6. Push
git branch -M main
git push -u origin main
```

### **Subsequent Pushes:**

```bash
git add .
git commit -m "Your commit message"
git push
```

---

## 🌐 Deploy to Vercel

### **Step 1: Connect Repository**

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `booking` repository
4. Click "Import"

### **Step 2: Configure Project**

```
Framework Preset: Next.js (auto-detected)
Root Directory: ./ (default)
Build Command: npm run build (auto)
Output Directory: .next (auto)
```

### **Step 3: Add Environment Variables**

Click "Environment Variables" and add:

```bash
# Production Database
POSTGRES_URL=postgresql://your-production-db-url

# NextAuth (Generate NEW secret for production!)
NEXTAUTH_SECRET=your-new-production-secret-here
NEXTAUTH_URL=https://your-app.vercel.app

# Email
RESEND_API_KEY=re_your_key_here

# Images (Optional)
UPLOADTHING_SECRET=sk_live_your_secret
UPLOADTHING_APP_ID=your_app_id
```

**⚠️ IMPORTANT:**
- Use DIFFERENT `NEXTAUTH_SECRET` than local
- Set `NEXTAUTH_URL` to your Vercel URL
- Use PRODUCTION database URL

### **Step 4: Deploy**

Click **"Deploy"** button

---

## 📊 Post-Deployment Tasks

### **1. Wait for Deployment**
- First build takes 2-5 minutes
- Watch build logs for errors
- Note your deployment URL: `https://your-app-xxxxx.vercel.app`

### **2. Update NEXTAUTH_URL**
After first deployment:
1. Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Edit `NEXTAUTH_URL` to your actual URL
4. Deployments → Latest → Redeploy

### **3. Database Migrations**
Your database should be ready (schema was pushed locally).

**Verify:**
```bash
# Connect to production DB
export POSTGRES_URL="your-production-url"
npm run db:push
```

### **4. Create Admin User**

**Option A: SQL Query**
```sql
-- Run in your database dashboard
INSERT INTO users (name, email, password, role, email_verified, created_at, updated_at)
VALUES (
  'Admin',
  'admin@yourdomain.com',
  '$2a$10$YourBcryptHashHere',
  'dev',
  NOW(),
  NOW(),
  NOW()
);
```

**Option B: Create Seed Script**
```bash
# Create src/lib/db/seed-admin.ts
npx tsx src/lib/db/seed-admin.ts
```

### **5. Test Production Site**

Visit your deployment URL and test:
- [ ] Homepage loads
- [ ] Sign in works (use admin credentials)
- [ ] Browse barbershops
- [ ] Admin dashboard accessible
- [ ] User management works
- [ ] Create test booking
- [ ] Email received (check inbox)
- [ ] Language switcher works (FR/EN)

---

## 🔍 Troubleshooting

### **Build Fails**

**"Cannot find module"**
```bash
# Locally:
rm -rf .next node_modules
npm install
npm run build
```

**TypeScript errors**
```bash
npm run lint
# Fix errors, then push again
```

### **Database Connection Issues**

**"Connection refused"**
- Check `POSTGRES_URL` is correct
- Ensure SSL mode: `?sslmode=require`
- Verify database accepts external connections

### **Authentication Not Working**

**"No secret" error**
- Verify `NEXTAUTH_SECRET` is set in Vercel
- Must be at least 32 characters

**Redirect loops**
- Ensure `NEXTAUTH_URL` matches your domain
- Clear browser cookies
- Check middleware configuration

### **Environment Variables Not Loading**

1. Vercel Dashboard → Settings → Environment Variables
2. Click each variable → "Edit"
3. Save (triggers redeploy)

### **Email Not Sending**

- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for errors
- For testing: Use `onboarding@resend.dev` as sender
- For production: Verify your domain in Resend

---

## 🎯 Final Checklist

Before going live:

- [ ] Local build succeeds (`npm run build`)
- [ ] Code pushed to GitHub
- [ ] Vercel deployment successful
- [ ] All environment variables set
- [ ] Database connected and migrated
- [ ] Admin user created
- [ ] Test authentication works
- [ ] Test booking flow works
- [ ] Email notifications work
- [ ] Language switching works
- [ ] Mobile responsive tested
- [ ] No console errors in browser

---

## 🚦 You're Ready!

Your app should be live at:
```
https://your-app-name.vercel.app
```

**Next Steps:**
1. Add custom domain (optional)
2. Set up monitoring
3. Configure analytics
4. Add more barbershops
5. Invite users

---

## 📞 Quick Commands Reference

```bash
# Local development
npm run dev

# Build test
npm run build

# Database
npm run db:push
npm run db:studio

# Git
git add .
git commit -m "message"
git push

# Check deployment
vercel --prod
```

---

## 🆘 Need Help?

Check **PROJECT_GUIDE.md** for:
- Complete feature documentation
- API endpoints
- Database schema
- Troubleshooting guide

**Vercel Support:**
- https://vercel.com/docs
- https://vercel.com/support

Good luck! 🎉
