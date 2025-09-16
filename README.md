# AfroBook - Premium Barbershop Booking Platform

A modern booking platform specifically designed for barbershops specializing in afro and black hair care. Built with Next.js 14, TypeScript, and Vercel.

## Features

- **Barbershop Discovery**: Search and filter barbershops by location, specialties, and services
- **Expert Focus**: Specialized in natural hair, protective styles, locs, braids, and treatments
- **Real-time Booking**: Calendar integration with instant appointment confirmation
- **User Authentication**: Secure login with NextAuth.js supporting Google OAuth and credentials
- **Review System**: Customer reviews and ratings for barbershops and barbers
- **Payment Integration**: Stripe integration for secure payment processing
- **Responsive Design**: Modern, mobile-first UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Headless UI components
- **Database**: Vercel Postgres with Drizzle ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Deployment**: Vercel

## Database Schema

The app includes comprehensive schemas for:
- Users (customers, barbers, shop owners)
- Barbershops with location and specialty data
- Services with pricing and duration
- Bookings with status tracking
- Reviews and ratings
- Barber profiles with specialties

## Hair Specialties Supported

- Natural Hair (Types 3A-4C)
- Protective Styles (braids, twists, bantu knots)
- Loc Maintenance and Installation
- Silk Press and Heat Styling
- Color Services for Textured Hair
- Scalp Treatments
- Beard Care and Styling

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Copy `.env.local` and fill in your environment variables:
   - Vercel Postgres credentials
   - NextAuth secret and URLs
   - Stripe API keys
   - Google OAuth credentials (optional)

3. **Database Setup**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── app/                 # Next.js 14 app directory
├── components/          # Reusable UI components
│   ├── sections/       # Page sections
│   └── ui/             # Base UI components
├── lib/                # Utilities and configurations
│   ├── db/             # Database schema and connection
│   ├── auth.ts         # NextAuth configuration
│   └── utils.ts        # Helper functions
└── types/              # TypeScript type definitions
```

## Key Pages

- **Homepage**: Hero section with search and featured barbershops
- **Barbershop Listing**: Advanced search and filtering
- **Barbershop Details**: Services, barbers, reviews, and booking
- **Booking Flow**: Calendar selection and payment
- **User Dashboard**: Booking history and profile management

## Deployment

The app is designed for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Contributing

This is a specialized platform for the black hair care community. When contributing:
- Understand the unique needs of textured and natural hair
- Respect cultural aspects of black hair care
- Ensure inclusive and accessible design
- Test with diverse hair types and styling needs

## License

MIT License - see LICENSE file for details
