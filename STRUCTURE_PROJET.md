# AfroBook - Structure du Projet / Project Structure

**Plateforme de réservation pour salons de coiffure spécialisés en cheveux afro**  
**Barbershop booking platform specialized in afro hair care**

---

## 📊 Vue d'ensemble / Overview

**Nom du projet:** AfroBook (afro-booking-app)  
**Version:** 0.1.0  
**Framework:** Next.js 15.5.6 (App Router)  
**Langage:** TypeScript  
**Base de données:** PostgreSQL (Vercel Postgres / Neon)  
**ORM:** Drizzle ORM  
**Authentification:** NextAuth.js v4  
**Internationalisation:** next-intl (Français/English)  
**Paiements:** Stripe  
**Upload d'images:** UploadThing  
**Email:** Resend  
**Déploiement:** Vercel

---

## 🗂️ Structure des Répertoires / Directory Structure

```
booking/
├── .git/                           # Git repository
├── .next/                          # Next.js build output (gitignored)
├── node_modules/                   # Dependencies (gitignored)
├── drizzle/                        # Database migrations (gitignored)
│
├── messages/                       # Internationalization files
│   ├── fr.json                    # French translations (15.7 KB)
│   └── en.json                    # English translations (13.7 KB)
│
├── scripts/                        # Database & utility scripts
│   ├── init-db.ts                 # Initialize database schema
│   ├── seed-database.ts           # Seed initial data
│   ├── seed-barbers.ts            # Seed barber profiles
│   ├── seed-services.ts           # Seed services
│   ├── seed-barbershops.sql       # SQL seed file
│   ├── create-guest-user.ts       # Create guest user
│   ├── create-guest-references.ts # Guest booking references
│   ├── migrate-bookings.ts        # Booking migration script
│   ├── check-bookings-schema.ts   # Validate bookings schema
│   └── check-services-schema.ts   # Validate services schema
│
├── src/                           # Source code
│   ├── app/                       # Next.js App Router
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Root redirect page
│   │   │
│   │   ├── [locale]/             # Internationalized routes
│   │   │   ├── layout.tsx        # Locale layout
│   │   │   ├── page.tsx          # Homepage
│   │   │   │
│   │   │   ├── about/            # About page
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── auth/             # Authentication pages
│   │   │   │   ├── signin/
│   │   │   │   │   └── page.tsx  # Sign in page
│   │   │   │   └── signup/
│   │   │   │       └── page.tsx  # Sign up page
│   │   │   │
│   │   │   ├── barbershops/      # Barbershop browsing
│   │   │   │   ├── page.tsx      # List all barbershops
│   │   │   │   ├── client.tsx    # Client component
│   │   │   │   └── [id]/         # Barbershop details
│   │   │   │       ├── page.tsx  # Shop detail page
│   │   │   │       └── booking/
│   │   │   │           └── page.tsx # Booking page
│   │   │   │
│   │   │   ├── barbers/          # Barber browsing
│   │   │   │   ├── page.tsx      # List all barbers
│   │   │   │   ├── client.tsx    # Client component
│   │   │   │   └── [id]/         # Barber details
│   │   │   │       ├── page.tsx  # Barber profile
│   │   │   │       └── booking/
│   │   │   │           └── page.tsx # Book with barber
│   │   │   │
│   │   │   ├── services/         # Services browsing
│   │   │   │   ├── page.tsx      # List services
│   │   │   │   ├── client-booking.tsx
│   │   │   │   └── [serviceId]/
│   │   │   │       └── book/
│   │   │   │           └── page.tsx # Book service
│   │   │   │
│   │   │   ├── bookings/         # User bookings
│   │   │   │   └── page.tsx      # Booking history
│   │   │   │
│   │   │   ├── favorites/        # Favorite shops
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── profile/          # User profile
│   │   │   │   └── page.tsx      # Profile & dashboard
│   │   │   │
│   │   │   ├── my-space/         # Shop owner dashboard
│   │   │   │   ├── page.tsx      # Owner dashboard
│   │   │   │   ├── client.tsx
│   │   │   │   └── [id]/         # Manage specific shop
│   │   │   │       ├── page.tsx  # Shop management
│   │   │   │       └── bookings/
│   │   │   │           └── page.tsx # Shop bookings
│   │   │   │
│   │   │   ├── my-barbershops/   # Alternative shop management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── client.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── bookings/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── subscription/     # Subscription management
│   │   │   │   ├── page.tsx      # Subscription page
│   │   │   │   ├── client.tsx
│   │   │   │   └── success/
│   │   │   │       └── page.tsx  # Payment success + DB activation
│   │   │   │
│   │   │   └── admin/            # Admin panel
│   │   │       ├── users/
│   │   │       │   └── page.tsx  # User management
│   │   │       ├── barbershops/
│   │   │       │   ├── page.tsx  # Manage all shops
│   │   │       │   └── new/
│   │   │       │       └── page.tsx # Create shop
│   │   │       ├── analytics/
│   │   │       │   └── page.tsx  # Analytics dashboard
│   │   │       ├── database/
│   │   │       │   └── page.tsx  # Database management
│   │   │       ├── security/
│   │   │       │   └── page.tsx  # Security settings
│   │   │       └── settings/
│   │   │           └── page.tsx  # System settings
│   │   │
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/
│   │   │   │   │   └── route.ts  # NextAuth handler
│   │   │   │   └── signup/
│   │   │   │       └── route.ts  # User registration
│   │   │   │
│   │   │   ├── bookings/
│   │   │   │   ├── route.ts      # Create/list bookings
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts  # Update/delete booking
│   │   │   │
│   │   │   ├── barbershops/
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts  # Get/update shop
│   │   │   │       ├── delete/
│   │   │   │       │   └── route.ts
│   │   │   │       └── toggle-status/
│   │   │   │           └── route.ts
│   │   │   │
│   │   │   ├── barbershop/
│   │   │   │   └── barbers/
│   │   │   │       ├── add/
│   │   │   │       │   └── route.ts # Add barber
│   │   │   │       └── [barberId]/
│   │   │   │           └── route.ts # Manage barber
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── route.ts          # Create service
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts      # Update service
│   │   │   │       └── toggle-status/
│   │   │   │           └── route.ts  # Toggle service status
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── users/
│   │   │   │   │   ├── route.ts  # Create user
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── route.ts # Update/delete user
│   │   │   │   ├── barbershops/
│   │   │   │   │   ├── create/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── [barbershopId]/
│   │   │   │   │       └── route.ts
│   │   │   │   └── database/
│   │   │   │       └── backup/
│   │   │   │           └── route.ts
│   │   │   │
│   │   │   ├── subscription/
│   │   │   │   ├── create-checkout/
│   │   │   │   │   └── route.ts  # Stripe checkout
│   │   │   │   └── activate/
│   │   │   │       └── route.ts  # Activate subscription in DB
│   │   │   │
│   │   │   └── uploadthing/
│   │   │       ├── core.ts       # Upload config
│   │   │       └── route.ts      # Upload handler
│   │   │
│   │   └── auth/                 # Auth utilities (legacy?)
│   │
│   ├── components/               # React components
│   │   ├── providers.tsx         # Context providers
│   │   │
│   │   ├── ui/                   # Base UI components
│   │   │   ├── header.tsx        # Site header
│   │   │   ├── footer.tsx        # Site footer
│   │   │   ├── button.tsx        # Button component
│   │   │   ├── input.tsx         # Input component
│   │   │   ├── toast.tsx         # Toast notification component
│   │   │   ├── toaster.tsx       # Toast container
│   │   │   └── language-switcher.tsx # Language toggle
│   │   │
│   │   └── sections/             # Page sections
│   │       ├── hero.tsx          # Homepage hero
│   │       ├── how-it-works.tsx  # How it works section
│   │       ├── popular-services.tsx # Popular services
│   │       ├── featured-barbershops.tsx # Featured shops
│   │       ├── barbershop-grid.tsx # Shop grid display
│   │       ├── barbershop-search.tsx # Search component
│   │       └── services-grid.tsx # Services grid
│   │
│   ├── lib/                      # Utilities & configs
│   │   ├── db/
│   │   │   ├── index.ts          # Database connection
│   │   │   └── schema.ts         # Drizzle schema (215 lines)
│   │   ├── auth.ts               # NextAuth config (124 lines)
│   │   ├── utils.ts              # Helper functions
│   │   └── uploadthing.ts        # UploadThing client
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-safe-translations.ts # i18n hook
│   │   └── use-toast.ts          # Toast notifications hook
│   │
│   ├── types/                    # TypeScript types
│   │   └── next-auth.d.ts        # NextAuth type extensions
│   │
│   ├── i18n.ts                   # i18n configuration
│   ├── routing.ts                # Routing config (next-intl)
│   └── middleware.ts             # Next.js middleware (i18n)
│
├── .env.example                  # Environment variables template
├── .env.local.example            # Local env template
├── .gitignore                    # Git ignore rules
├── drizzle.config.ts             # Drizzle ORM config
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config
├── postcss.config.js             # PostCSS config
├── package.json                  # Dependencies & scripts
├── package-lock.json             # Locked dependencies
│
├── README.md                     # Project overview
├── PROJECT_GUIDE.md              # Complete setup guide (508 lines)
├── DEPLOYMENT_CHECKLIST.md       # Deployment checklist
└── READY_TO_DEPLOY.md            # Deployment readiness
```

---

## 🗄️ Schéma de Base de Données / Database Schema

### **Tables Principales / Main Tables**

#### **1. users** (Utilisateurs)
- **Rôles:** `customer`, `barber`, `admin`, `dev`
- **Authentification:** Email/Password + Google OAuth
- **Champs:** id, email, name, password, phone, image, role, emailVerified, createdAt, updatedAt

#### **2. barbershops** (Salons de coiffure)
- **Propriétaire:** Lié à `users.id`
- **Champs:** id, name, description, address, city, state, zipCode, phone, email, website, images[], rating, reviewCount, isActive, ownerId, openingHours{}, specialties[], createdAt, updatedAt

#### **3. barbers** (Coiffeurs)
- **Relations:** userId → users, barbershopId → barbershops
- **Champs:** id, userId, barbershopId, profileImage, galleryImages[], youtubeLinks[], bio, specialties[], experience, rating, isActive, createdAt, updatedAt

#### **4. services** (Services)
- **Relation:** barbershopId → barbershops
- **Champs:** id, barbershopId, name, description, price, duration (minutes), category, isActive, createdAt, updatedAt

#### **5. bookings** (Réservations)
- **Relations:** userId → users, barbershopId → barbershops, barberId → barbers, serviceId → services
- **Statuts:** pending, confirmed, cancelled, completed
- **Champs:** id, userId, barbershopId, barberId, serviceId, startTime, endTime, status, notes, totalPrice, customerName, customerEmail, customerPhone, createdAt, updatedAt

#### **6. reviews** (Avis)
- **Relations:** customerId → users, barbershopId → barbershops, barberId → barbers, bookingId → bookings
- **Champs:** id, customerId, barbershopId, barberId, bookingId, rating (1-5), comment, images[], createdAt, updatedAt

### **Tables NextAuth**
- **accounts** - OAuth accounts
- **sessions** - User sessions
- **verificationTokens** - Email verification

---

## 🎨 Stack Technique / Tech Stack

### **Frontend**
- **Framework:** Next.js 15.5.6 (App Router, React Server Components)
- **UI Library:** React 18.3.1
- **Langage:** TypeScript 5
- **Styling:** TailwindCSS 3.3.0
- **Composants UI:** Radix UI (@radix-ui/react-*)
- **Icônes:** Lucide React 0.400.0
- **Calendrier:** react-calendar 4.8.0
- **Formulaires:** react-hook-form 7.48.2 + @hookform/resolvers 3.3.2
- **Validation:** Zod 3.22.4
- **Utilitaires:** clsx 2.0.0, tailwind-merge 2.2.0

### **Backend**
- **Runtime:** Node.js 20+
- **API:** Next.js API Routes
- **Base de données:** PostgreSQL (Vercel Postgres / Neon)
- **ORM:** Drizzle ORM 0.29.1 + drizzle-kit 0.20.17
- **Authentification:** NextAuth.js 4.24.5 + @auth/drizzle-adapter 0.7.0
- **Hashing:** bcryptjs 2.4.3
- **Email:** Resend 6.4.2
- **Paiements:** Stripe 14.9.0 + @stripe/stripe-js 2.2.2
- **Upload:** UploadThing 7.7.4 + @uploadthing/react 7.3.3

### **Internationalisation**
- **Library:** next-intl 3.26.5
- **Langues:** Français (fr), English (en)
- **Locale par défaut:** Français

### **DevOps**
- **Déploiement:** Vercel
- **CI/CD:** Git + Vercel auto-deploy
- **Environnement:** .env.local (dev), Vercel env vars (prod)

---

## 🔑 Fonctionnalités Principales / Key Features

### **Pour les Clients / For Customers**
✅ Recherche de salons par ville, services, spécialités  
✅ Consultation des profils de coiffeurs (bio, galerie, vidéos YouTube)  
✅ Réservation en ligne avec sélection de créneau horaire  
✅ Historique des réservations  
✅ Système d'avis et notes (1-5 étoiles)  
✅ Favoris (barbershops préférés)  
✅ Notifications email (confirmation, rappel)  
✅ Interface bilingue (FR/EN)

### **Pour les Propriétaires de Salons / For Shop Owners**
✅ Tableau de bord de gestion (`/my-space`)  
✅ Gestion du profil du salon (infos, photos, horaires)  
✅ Ajout/modification de coiffeurs  
✅ Création de services (nom, prix, durée)  
✅ Gestion des réservations (confirmation, annulation)  
✅ Upload de photos (UploadThing)  
✅ Abonnement mensuel (€29.90/mois via Stripe)

### **Pour les Administrateurs / For Admins**
✅ Gestion des utilisateurs (CRUD) - `/admin/users`  
✅ Gestion des salons - `/admin/barbershops`  
✅ Analytics et statistiques - `/admin/analytics`  
✅ Gestion de la base de données - `/admin/database`  
✅ Paramètres de sécurité - `/admin/security`  
✅ Contrôle d'accès basé sur les rôles (RBAC)

### **Pour les Développeurs / For Developers**
✅ Accès complet au système  
✅ Peut créer d'autres comptes `dev`  
✅ Scripts de seed et migration  
✅ Outils de debugging

---

## 🌐 Routes Principales / Main Routes

### **Pages Publiques / Public Pages**
- `/` → Redirection vers `/fr` ou `/en`
- `/[locale]` → Homepage (hero, featured shops, how it works)
- `/[locale]/barbershops` → Liste des salons
- `/[locale]/barbershops/[id]` → Détails du salon + réservation
- `/[locale]/barbers` → Liste des coiffeurs
- `/[locale]/barbers/[id]` → Profil du coiffeur
- `/[locale]/services` → Liste des services
- `/[locale]/about` → À propos

### **Authentification / Authentication**
- `/[locale]/auth/signin` → Connexion (email/phone + password, Google OAuth)
- `/[locale]/auth/signup` → Inscription
- `/api/auth/[...nextauth]` → NextAuth handler

### **Espace Client / Customer Area**
- `/[locale]/profile` → Profil utilisateur (dashboard selon rôle)
- `/[locale]/bookings` → Historique des réservations
- `/[locale]/favorites` → Salons favoris

### **Espace Propriétaire / Owner Area**
- `/[locale]/my-space` → Dashboard propriétaire
- `/[locale]/my-space/[id]` → Gestion du salon (tabs: Aperçu, Coiffeurs, Services, Réservations, Paramètres)
- `/[locale]/my-space/[id]/bookings` → Réservations du salon
- `/[locale]/subscription` → Gestion de l'abonnement Stripe

### **Espace Admin / Admin Area**
- `/[locale]/admin/users` → Gestion des utilisateurs
- `/[locale]/admin/barbershops` → Gestion des salons
- `/[locale]/admin/analytics` → Statistiques
- `/[locale]/admin/database` → Base de données
- `/[locale]/admin/security` → Sécurité
- `/[locale]/admin/settings` → Paramètres

### **API Routes**
- `POST /api/auth/signup` → Créer un compte
- `GET/POST /api/bookings` → Lister/créer réservations
- `PATCH/DELETE /api/bookings/[id]` → Modifier/annuler réservation
- `GET/PATCH /api/barbershops/[id]` → Détails/modifier salon
- `POST /api/admin/users` → Créer utilisateur (admin)
- `PATCH/DELETE /api/admin/users/[id]` → Modifier/supprimer utilisateur
- `POST /api/services` → Créer un service
- `PATCH /api/services/[id]` → Modifier un service
- `POST /api/services/[id]/toggle-status` → Activer/désactiver un service
- `POST /api/subscription/create-checkout` → Créer session Stripe
- `POST /api/subscription/activate` → Activer abonnement dans la DB
- `POST /api/uploadthing` → Upload d'images

---

## 🔐 Système d'Authentification / Authentication System

### **Providers**
1. **Credentials** (Email/Phone + Password)
   - Hashing avec bcryptjs (10 rounds)
   - Login avec email OU téléphone
   
2. **Google OAuth** (optionnel)
   - Requiert `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`

### **Session Management**
- **Stratégie:** JWT (JSON Web Tokens)
- **Durée:** 24 heures
- **Refresh:** Automatique à chaque requête (role sync)

### **Rôles & Permissions / Roles & Permissions**

| Rôle | Accès | Permissions |
|------|-------|-------------|
| **customer** | Pages publiques, profil, réservations | Réserver, laisser des avis |
| **barber** | + Dashboard salon assigné | Gérer réservations du salon |
| **admin** | + Panel admin | CRUD users, shops, analytics |
| **dev** | Accès complet | Tout + créer d'autres devs |

### **Protection des Routes**
- Middleware `next-intl` pour i18n
- Vérification de session dans les pages protégées
- API routes protégées par vérification de rôle

---

## 📧 Système d'Email / Email System

### **Provider:** Resend
- **API Key:** `RESEND_API_KEY`
- **Free tier:** 100 emails/jour
- **Domaine de test:** `onboarding@resend.dev`

### **Templates d'Email / Email Templates**
1. **Confirmation de réservation** (client)
   - Détails de la réservation
   - Informations du salon et coiffeur
   - Date et heure
   
2. **Notification de nouvelle réservation** (salon)
   - Détails du client
   - Service réservé
   - Lien vers le dashboard

### **Configuration Production**
- Ajouter et vérifier votre domaine sur Resend
- Configurer SPF, DKIM, DMARC
- Mettre à jour les adresses `from` dans `/api/bookings/route.ts`

---

## 🖼️ Gestion des Images / Image Management

### **Provider:** UploadThing
- **API Keys:** `UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID`
- **Configuration:** `/src/app/api/uploadthing/core.ts`
- **Client:** `/src/lib/uploadthing.ts`

### **Domaines Autorisés / Allowed Domains**
- `images.unsplash.com` (placeholder)
- `lh3.googleusercontent.com` (Google avatars)
- `utfs.io` (UploadThing)
- `uploadthing.com`
- `**.vercel.app`

### **Utilisation**
- Upload de photos de salon (galerie)
- Photos de profil des coiffeurs
- Images dans les avis clients
- Stockage: JSONB array dans PostgreSQL

---

## 💳 Système de Paiement / Payment System

### **Provider:** Stripe
- **Mode:** Subscription (abonnement récurrent)
- **Prix:** €29.90/mois pour les propriétaires de salon
- **Checkout:** `/api/subscription/create-checkout`
- **Success:** `/[locale]/subscription/success`

### **Configuration**
- `STRIPE_SECRET_KEY` (backend)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (frontend)
- Webhooks pour gérer les événements (à configurer)

---

## 🛠️ Scripts Disponibles / Available Scripts

```bash
# Développement / Development
npm run dev              # Démarrer le serveur de dev (localhost:3000)
npm run build            # Build de production
npm run start            # Démarrer le serveur de production
npm run lint             # Linter ESLint

# Base de données / Database
npm run db:init          # Initialiser le schéma (scripts/init-db.ts)
npm run db:seed          # Seed data (scripts/seed-database.ts)
npm run db:seed-barbers  # Seed barbers (scripts/seed-barbers.ts)
npm run db:generate      # Générer migrations Drizzle
npm run db:push          # Push schema vers DB (sans migration)
npm run db:migrate       # Exécuter migrations
npm run db:studio        # Ouvrir Drizzle Studio (GUI)
```

---

## 🌍 Internationalisation (i18n)

### **Configuration**
- **Library:** next-intl 3.26.5
- **Middleware:** `/src/middleware.ts`
- **Routing:** `/src/routing.ts`
- **i18n config:** `/src/i18n.ts`

### **Langues Supportées**
- **Français (fr)** - Langue par défaut
- **English (en)**

### **Fichiers de Traduction**
- `/messages/fr.json` (15.7 KB)
- `/messages/en.json` (13.7 KB)

### **URL Structure**
- Toujours préfixé: `/fr/...` ou `/en/...`
- Redirection automatique de `/` vers `/fr`

### **Utilisation dans le Code**
```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('namespace');
t('key'); // Traduction
```

---

## 🎨 Design System

### **Couleurs / Colors**
- **Primary:** Orange (#ed7420) - Tons 50-900
- **Secondary:** Slate (#64748b) - Tons 50-900
- **Accent:** Purple (#d946ef) - Tons 50-900
- **Destructive, Muted, Card, Popover** - Variables CSS

### **Typographie / Typography**
- **Sans:** DM Sans (var(--font-dm-sans))
- **Display/Heading:** Montserrat (var(--font-montserrat))
- **Body:** DM Sans

### **Animations**
- `fade-in` - 0.5s ease-in-out
- `slide-up` - 0.3s ease-out

### **Composants UI / UI Components**
- Button (`/src/components/ui/button.tsx`)
- Input (`/src/components/ui/input.tsx`)
- Header (`/src/components/ui/header.tsx`)
- Footer (`/src/components/ui/footer.tsx`)
- Language Switcher (`/src/components/ui/language-switcher.tsx`)

---

## 📦 Dépendances Principales / Main Dependencies

### **Production**
- `next` ^15.5.6 - Framework React
- `react` ^18.3.1 - UI library
- `typescript` ^5 - Langage
- `drizzle-orm` ^0.29.1 - ORM
- `next-auth` ^4.24.5 - Authentification
- `next-intl` ^3.26.5 - i18n
- `@vercel/postgres` ^0.10.0 - Database client
- `stripe` ^14.9.0 - Paiements
- `resend` ^6.4.2 - Email
- `uploadthing` ^7.7.4 - Upload d'images
- `bcryptjs` ^2.4.3 - Hashing
- `zod` ^3.22.4 - Validation
- `date-fns` ^2.30.0 - Manipulation de dates
- `lucide-react` ^0.400.0 - Icônes

### **Development**
- `drizzle-kit` ^0.20.17 - CLI Drizzle
- `tsx` ^4.20.6 - TypeScript executor
- `tailwindcss` ^3.3.0 - CSS framework
- `eslint` ^8 - Linter
- `autoprefixer` ^10.0.1 - PostCSS

---

## 🔒 Variables d'Environnement / Environment Variables

### **Requises / Required**
```bash
POSTGRES_URL=postgresql://user:password@host:5432/database
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=re_your_key
```

### **Optionnelles / Optional**
```bash
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=your_app_id
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
ADMIN_EMAIL=admin@domain.com
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

---

## 📝 Spécialités Cheveux Afro / Afro Hair Specialties

Le projet est spécialisé dans les soins capillaires afro:

- **Types de cheveux naturels:** 3A, 3B, 3C, 4A, 4B, 4C
- **Coiffures protectrices:** Tresses (braids), Twists, Bantu knots
- **Locs:** Installation, maintenance, retwist
- **Traitements:** Silk press, défrisage, soins du cuir chevelu
- **Coloration:** Spécifique aux cheveux texturés
- **Barbe:** Taille, design, soins

---

## 🚀 Déploiement / Deployment

### **Plateforme:** Vercel

### **Checklist Pré-Déploiement**
✅ Variables d'environnement configurées  
✅ Base de données production créée (Neon/Vercel Postgres)  
✅ Domaine Resend vérifié (ou utiliser onboarding@resend.dev)  
✅ UploadThing configuré (optionnel)  
✅ Stripe configuré (optionnel)  
✅ `.gitignore` à jour  
✅ Build local réussi (`npm run build`)

### **Étapes / Steps**
1. Push code sur GitHub
2. Connecter repo à Vercel
3. Configurer les env vars dans Vercel
4. Déployer
5. Mettre à jour `NEXTAUTH_URL` avec l'URL de production
6. Créer le premier utilisateur admin via SQL

### **Post-Déploiement**
- Tester l'authentification
- Tester la création de réservation
- Vérifier l'envoi d'emails
- Configurer un domaine personnalisé (optionnel)

---

## 📚 Documentation Complémentaire / Additional Documentation

- **README.md** - Vue d'ensemble du projet
- **PROJECT_GUIDE.md** - Guide complet de setup (508 lignes)
- **DEPLOYMENT_CHECKLIST.md** - Checklist de déploiement
- **READY_TO_DEPLOY.md** - État de préparation au déploiement

---

## 🎯 Fonctionnalités Implémentées / Implemented Features

### ✅ **Complètes / Complete**
- [x] Système d'authentification multi-provider (Credentials + Google OAuth)
- [x] Gestion des rôles (customer, barber, admin, dev)
- [x] CRUD complet pour utilisateurs (admin panel)
- [x] CRUD complet pour salons de coiffure
- [x] CRUD complet pour coiffeurs
- [x] CRUD complet pour services
- [x] Système de réservation en ligne
- [x] Notifications email (Resend)
- [x] Upload d'images (UploadThing)
- [x] Internationalisation FR/EN (next-intl)
- [x] Dashboard propriétaire de salon
- [x] Dashboard admin
- [x] Recherche et filtrage de salons
- [x] Système d'avis et notes
- [x] Gestion des horaires d'ouverture
- [x] Abonnement Stripe (€29.90/mois)
- [x] Design responsive (mobile-first)
- [x] Protection des routes par rôle
- [x] Scripts de seed et migration

### 🚧 **À Implémenter / To Implement**
- [ ] Système de favoris (UI existe, logique à compléter)
- [ ] Notifications push
- [ ] Chat en temps réel (client-salon)
- [ ] Rappels automatiques par email/SMS
- [ ] Système de fidélité/points
- [ ] Export de données (analytics)
- [ ] Multi-devise (actuellement €)
- [ ] Intégration calendrier externe (Google Calendar, iCal)
- [ ] Mode sombre (dark mode)
- [ ] Tests unitaires et E2E
- [ ] Documentation API (Swagger/OpenAPI)

### 🐛 **Bugs Corrigés Récemment / Recently Fixed Bugs**
- [x] **Création de services** (Dec 2024) - L'ajout de services échouait avec "une erreur est survenue" car les endpoints API `/api/services` (POST) et `/api/services/[id]` (PATCH) n'existaient pas. Fix: Création des deux endpoints avec validation de propriété du salon. Remplacement de tous les `alert()` par des notifications toast modernes (@radix-ui/react-toast) pour une meilleure UX.
- [x] **Ajout de coiffeur avec dialogue** (Dec 2024) - Le bouton "Ajouter un Coiffeur" redirigait vers `/admin/users` au lieu d'ouvrir un dialogue. Fix: Remplacement du `<Link>` par un `<button>` qui ouvre un modal avec formulaire complet (nom, email, téléphone, mot de passe). L'API `/api/barbershop/barbers/add` crée maintenant un nouveau compte utilisateur avec rôle "barber" au lieu de chercher un utilisateur existant.
- [x] **Activation d'abonnement en base de données** (Dec 2024) - Le renouvellement d'abonnement était uniquement visuel et ne mettait pas à jour le statut dans la base de données. Fix: Création de l'endpoint `/api/subscription/activate` qui met à jour `createdAt` (pour réinitialiser la période de 30 jours) et `isActive=true`. La page de succès (`/subscription/success`) appelle maintenant cet endpoint automatiquement avec le `shopId` pour activer l'abonnement.
- [x] **Renouvellement d'abonnement** (Dec 2024) - Le bouton "Renouveler" depuis `/my-space/[id]` passait le `shopId` en paramètre URL mais la page `/subscription` ne l'utilisait pas. Fix: Extraction du `shopId` depuis `searchParams` et transmission à l'API Stripe.
- [x] **404 sur Subscribe Now** (Dec 2024) - Le bouton "Subscribe Now" redirigait vers une URL avec locale hardcodé (`/fr/`) au lieu du locale de l'utilisateur. Fix: API retourne URL relative, client utilise `router.push()` de `next-intl` pour redirection locale-aware.
- [x] **Filtrage par abonnement** (Dec 2024) - Les salons avec abonnements expirés (>30 jours) apparaissaient toujours dans la liste publique `/barbershops`. Fix: Ajout d'un filtre côté serveur pour n'afficher que les salons avec abonnements valides.
- [x] **Affichage des images** (Dec 2024) - La page `/barbershops` n'affichait pas les images des salons. Fix: Ajout du champ `images` à la requête et affichage de la première image avec fallback sur gradient.
- [x] **Intégration Stripe** (Dec 2024) - Le bouton "Subscribe Now" allait directement à la page de succès au lieu de Stripe. Fix: Implémentation complète de Stripe Checkout avec bypass admin/dev pour les tests.

---

## 🔧 Maintenance & Bonnes Pratiques / Maintenance & Best Practices

### **Sécurité / Security**
✅ Mots de passe hashés (bcrypt, 10 rounds)  
✅ Protection CSRF (NextAuth)  
✅ Prévention SQL injection (Drizzle ORM)  
✅ Variables d'environnement séparées  
✅ Validation des entrées (Zod)  
⚠️ Recommandé: Rate limiting sur API routes  
⚠️ Recommandé: Monitoring (Sentry, Vercel Analytics)

### **Performance**
- React Server Components (RSC) pour réduire le bundle JS
- Images optimisées (Next.js Image)
- Lazy loading des composants
- Caching des requêtes DB (à optimiser)

### **Code Quality**
- TypeScript strict mode
- ESLint configuré
- Structure modulaire (composants réutilisables)
- Séparation client/server components

---

## 📞 Support & Contact

Pour toute question ou problème:
1. Consulter `PROJECT_GUIDE.md` (section Troubleshooting)
2. Vérifier les logs Vercel (production)
3. Consulter la documentation Next.js, Drizzle, NextAuth

---

**Dernière mise à jour:** Décembre 2024  
**Version:** 0.1.0  
**Statut:** En développement actif

---

*Built with ❤️ using Next.js, TypeScript, and TailwindCSS*
