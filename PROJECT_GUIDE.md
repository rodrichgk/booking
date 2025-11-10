# Barbershop Booking Platform - Complete Project Guide

**Full-stack booking platform for barbershops with multi-language support (French/English)**

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Environment Setup](#environment-setup)
5. [Database Setup](#database-setup)
6. [Email Configuration](#email-configuration)
7. [Image Upload Configuration](#image-upload-configuration)
8. [User Management](#user-management)
9. [Deployment to Vercel](#deployment-to-vercel)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Push database schema
npm run db:push

# Seed database (optional)
npm run db:seed

# Run development server
npm run dev
```

Visit: **http://localhost:3000**

---

## ✨ Features

### **Customer Features**
- 🔍 Browse barbershops by city, rating, services
- 📅 Book appointments with specific barbers
- ✉️ Email confirmations for bookings
- 🌐 French & English language support
- 📱 Fully responsive design

### **Barber/Shop Owner Features**
- 🏪 Manage barbershop profile & photos
- 👥 Manage team of barbers
- 💈 Create & manage services
- 📊 View bookings dashboard
- ✅ Confirm/Cancel bookings
- 💳 Subscription management (€29.90/month)

### **Admin/Dev Features**
- 👤 User management (Add/Edit/Delete users)
- 🏢 Barbershop management
- 📈 System analytics & reports
- 📊 Revenue tracking
- 🔐 Role-based access control (dev, admin, barber, customer)

---

## 🛠 Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Lucide Icons
- next-intl (i18n)

**Backend:**
- Next.js API Routes
- NextAuth.js (Authentication)
- Drizzle ORM
- PostgreSQL
- Resend (Email)
- UploadThing (Image uploads)

**Deployment:**
- Vercel (Hosting)
- Neon/Vercel Postgres (Database)

---

## 🔧 Environment Setup

Create `.env.local` with these variables:

```bash
# Database (Required)
POSTGRES_URL=postgresql://user:password@host:5432/database

# NextAuth (Required)
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Email - Resend (Required for bookings)
RESEND_API_KEY=re_your_key_here

# Image Upload - UploadThing (Optional)
UPLOADTHING_SECRET=sk_live_your_secret
UPLOADTHING_APP_ID=your_app_id

# Admin Setup (Optional)
ADMIN_EMAIL=admin@yourdomain.com
```

### **Get API Keys:**

1. **Database**: [Neon.tech](https://neon.tech) (free tier) or [Vercel Postgres](https://vercel.com/storage/postgres)
2. **Email**: [Resend.com](https://resend.com) (free tier: 100 emails/day)
3. **Images**: [UploadThing.com](https://uploadthing.com) (optional, free tier available)

---

## 💾 Database Setup

### **1. Push Schema**
```bash
npm run db:push
```

### **2. Seed Initial Data**

Create admin user manually:
```sql
-- Via psql or database GUI
INSERT INTO users (name, email, password, role, email_verified)
VALUES (
  'Admin User',
  'admin@example.com',
  '$2a$10$...',  -- Use bcrypt to hash your password
  'dev',
  NOW()
);
```

Or create a seed script (`/src/lib/db/seed-admin.ts`):
```typescript
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';

async function main() {
  const password = await bcrypt.hash('your-password', 10);
  await db.insert(users).values({
    name: 'Admin',
    email: 'admin@example.com',
    password,
    role: 'dev',
    emailVerified: new Date(),
  });
}

main();
```

Run: `npx tsx src/lib/db/seed-admin.ts`

### **3. Seed Barbershops (Optional)**
```bash
npm run db:seed-barbershops  # If script exists
npm run db:seed-barbers
npm run db:seed-services
```

---

## 📧 Email Configuration (Resend)

### **Setup:**
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain OR use `onboarding@resend.dev` for testing
3. Create API key
4. Add to `.env.local`: `RESEND_API_KEY=re_...`

### **Email Templates Used:**
- **Customer**: Booking confirmation with details
- **Barbershop**: New booking notification

### **Test Email:**
```bash
# Create a test booking via the UI
# Check email inbox
# Check Resend dashboard for delivery status
```

### **Production Setup:**
1. Add your domain to Resend
2. Verify DNS records (SPF, DKIM, DMARC)
3. Update `from` addresses in email templates (`/src/app/api/bookings/route.ts`)

---

## 🖼 Image Upload (UploadThing)

### **Setup:**
1. Sign up at [uploadthing.com](https://uploadthing.com)
2. Create app → Get keys
3. Add to `.env.local`:
   ```
   UPLOADTHING_SECRET=sk_live_...
   UPLOADTHING_APP_ID=...
   ```

### **Already Configured:**
- ✅ API routes: `/src/app/api/uploadthing/route.ts`
- ✅ File router: `/src/app/api/uploadthing/core.ts`
- ✅ Client helpers: `/src/lib/uploadthing.ts`

### **Upload Shop Images:**
1. Login as shop owner
2. Go to `/my-space/[shop-id]`
3. Click "Paramètres" (Settings) tab
4. Use "Photos du Salon" uploader
5. Images saved to `barbershops.images` field

### **Images Display:**
- Hero image on shop detail page
- Photo gallery section
- Responsive grid layout

---

## 👥 User Management

### **Roles:**
- **Dev**: Full system access, can create other devs
- **Admin**: Manage users, shops, view analytics
- **Barber**: Manage assigned shop, view bookings
- **Customer**: Book appointments, view history

### **Admin Features:**
Visit `/fr/admin/users` to:
- ✅ **Add User**: Create new users with any role
- ✅ **Edit User**: Update name, email, phone
- ✅ **Delete User**: Remove users (can't delete yourself)
- ✅ **Change Roles**: Dev can change any role

### **API Endpoints:**
```typescript
POST   /api/admin/users       // Create user
PATCH  /api/admin/users/[id]  // Update user
DELETE /api/admin/users/[id]  // Delete user
```

---

## 🚀 Deployment to Vercel

### **Pre-Deployment Checklist:**

1. **Update `.gitignore`:**
```gitignore
node_modules
.next
.env
.env.local
.vercel
/drizzle
*.log
.DS_Store
```

2. **Create `.env.example`:**
```bash
# Copy your .env.local but remove actual values
POSTGRES_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=re_...
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
```

3. **Update `package.json`** (should already be set):
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

### **Deploy Steps:**

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/booking.git
git push -u origin main
```

2. **Connect to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Framework: **Next.js** (auto-detected)
   - Root Directory: `./`

3. **Add Environment Variables:**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   POSTGRES_URL=postgresql://your-production-db-url
   NEXTAUTH_SECRET=your-new-production-secret
   NEXTAUTH_URL=https://your-app.vercel.app
   RESEND_API_KEY=re_your_key
   UPLOADTHING_SECRET=sk_live_...
   UPLOADTHING_APP_ID=...
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

5. **Post-Deployment:**
   - Update `NEXTAUTH_URL` to your actual domain
   - Run database migrations (should auto-run via `db:push` in build)
   - Create first admin user via SQL
   - Test all features

### **Database for Production:**

**Option A: Neon (Recommended)**
1. Create project at [neon.tech](https://neon.tech)
2. Copy connection string
3. Add to Vercel env vars

**Option B: Vercel Postgres**
1. Vercel Dashboard → Storage → Create Postgres
2. Automatically adds `POSTGRES_URL` to your project

### **Custom Domain:**
1. Vercel → Domains → Add Domain
2. Update DNS records
3. Update `NEXTAUTH_URL` environment variable
4. Redeploy

---

## 🎯 Key URLs

### **Public Pages:**
- `/` - Homepage
- `/fr/barbershops` - Browse barbershops
- `/fr/barbershops/[id]` - Shop details & booking
- `/fr/barbers` - Browse barbers

### **Authentication:**
- `/fr/auth/signin` - Sign in
- `/fr/auth/signup` - Sign up
- `/fr/auth/signout` - Sign out

### **User Dashboards:**
- `/fr/profile` - User profile (role-based dashboard)
- `/fr/my-space` - Shop owner dashboard
- `/fr/my-space/[id]` - Manage specific shop
- `/fr/my-space/[id]/bookings` - Shop bookings

### **Admin Pages:**
- `/fr/admin/barbershops` - Manage all shops
- `/fr/admin/users` - User management
- `/fr/admin/analytics` - System analytics

---

## 🐛 Troubleshooting

### **Build Errors:**

**"Cannot find module"**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**TypeScript errors**
```bash
# Check tsconfig.json is correct
npm run type-check
```

### **Database Issues:**

**Connection refused**
- Check `POSTGRES_URL` is correct
- Ensure database accepts external connections
- Add `?sslmode=require` to connection string

**Schema mismatch**
```bash
# Push schema again
npm run db:push
```

### **Authentication Issues:**

**"No secret provided"**
- Ensure `NEXTAUTH_SECRET` is set
- Generate new: `openssl rand -base64 32`

**Redirect loops**
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies

### **Email Not Sending:**

**Resend API error**
- Verify API key is correct
- Check domain is verified (or use `onboarding@resend.dev` for testing)
- View logs at resend.com dashboard

### **Images Not Uploading:**

**UploadThing error**
- Check API keys are set
- Verify `next.config.js` has correct image domains
- Check file size limits

---

## 📊 Database Schema Overview

**Main Tables:**
- `users` - All users (customers, barbers, admins, devs)
- `barbershops` - Shop listings
- `barbers` - Barber profiles (linked to users)
- `services` - Services offered by shops
- `bookings` - Customer appointments
- `reviews` - Shop/barber reviews

**Key Relationships:**
- User → owns → Barbershop
- User → is → Barber → works at → Barbershop
- Booking → references → User, Barbershop, Barber, Service

---

## 🔐 Security Best Practices

✅ **Implemented:**
- Password hashing (bcrypt)
- Role-based access control
- Protected API routes
- SQL injection prevention (Drizzle ORM)
- CSRF protection (NextAuth)
- Environment variable separation

⚠️ **Recommendations:**
- Use strong `NEXTAUTH_SECRET` in production
- Enable rate limiting on API routes
- Set up monitoring (Vercel Analytics/Sentry)
- Regular database backups
- Keep dependencies updated

---

## 📝 Development Notes

### **Adding New Languages:**
1. Create `/messages/[locale].json`
2. Add locale to `routing.ts`
3. Update middleware

### **Adding New User Roles:**
1. Update database schema
2. Update auth middleware
3. Add role checks in components

### **Extending Bookings:**
1. Update `bookings` table schema
2. Modify API routes
3. Update email templates

---

## 🎉 You're All Set!

**Local Development:** http://localhost:3000
**Production:** https://your-app.vercel.app

**Test Credentials:**
- Admin: Check your seeded user
- Test booking flow as customer
- Test shop management as owner

For questions or issues, check the troubleshooting section above.

---

**Built with ❤️ using Next.js, TypeScript, and TailwindCSS**
