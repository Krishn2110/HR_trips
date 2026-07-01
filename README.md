# HR Trips — Travel & Hospitality Frontend

Professional, conversion-focused travel booking frontend built with **Next.js 16** (App Router, TypeScript, Tailwind CSS).

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy env file and configure
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📁 Folder Structure

```
hr-trips/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (TopBar + Navbar + Footer)
│   ├── page.tsx                  # Home page
│   ├── holiday-packages/         # Package listing + [slug] detail
│   ├── hotel-booking/            # Hotel listing + [slug] detail
│   ├── services/                 # Services overview
│   ├── about/                    # About page
│   ├── contact/                  # Contact page
│   ├── banquet-booking/          # Phase 2 — Coming Soon
│   ├── event-booking/            # Phase 2 — Coming Soon
│   ├── catering-booking/         # Phase 2 — Coming Soon
│   ├── cab-services/             # Phase 2 — Coming Soon
│   ├── ticketing/                # Phase 2 — Coming Soon
│   └── manpower-services/        # Phase 2 — Coming Soon
│
├── components/
│   ├── layout/                   # Navbar, Footer, TopBar, MobileMenu
│   ├── home/                     # Hero, WhyChooseUs, ServicesGrid, etc.
│   ├── packages/                 # PackageCard, Filters, PriceTable, etc.
│   ├── hotels/                   # HotelCard, SearchBar, Amenities, etc.
│   └── shared/                   # SectionHeading, Breadcrumbs, WhatsApp, etc.
│
├── lib/
│   ├── api.ts                    # Typed fetch wrapper + mock data
│   ├── types.ts                  # TypeScript interfaces
│   ├── validators.ts             # Zod schemas for forms
│   └── constants.ts              # Nav links, services, contact info
│
└── public/                       # Static assets
```

## 🔗 Connecting the PHP Backend

1. Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to your PHP API URL
2. The API layer (`lib/api.ts`) expects these REST endpoints:

| Method | Endpoint              | Description             |
|--------|----------------------|-------------------------|
| GET    | /api/packages         | List all packages        |
| GET    | /api/packages/{slug}  | Package detail           |
| GET    | /api/hotels           | List/search hotels       |
| GET    | /api/hotels/{slug}    | Hotel detail             |
| POST   | /api/enquiries        | Submit package enquiry   |
| POST   | /api/bookings         | Submit hotel booking     |
| POST   | /api/contact          | Submit contact form      |

3. All responses should be JSON. The frontend gracefully falls back to mock data if the API is unavailable.

## 🎨 Design System

- **Brand Orange:** `#F26622` (CTAs, highlights, active states)
- **Fonts:** Poppins (headings), Inter (body) via Google Fonts / next/font
- **Visual:** Rounded corners, soft shadows, card-based layouts, micro-animations via Framer Motion

## 📦 Key Dependencies

- **Next.js 16** — React framework with App Router
- **Tailwind CSS 4** — Utility-first CSS
- **Framer Motion** — Animations
- **React Hook Form + Zod** — Form validation
- **lucide-react** — Icon library

## 🏗️ Phase 2 Services (Scaffolded)

The following pages exist with "Coming Soon" placeholders:
- Banquet Booking, Event Booking, Catering Services
- Cab Services, Ticketing, Manpower Services

## 📝 Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```
