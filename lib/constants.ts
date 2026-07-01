import { Service, NavLink, Testimonial } from "./types";

// ── Contact Information ─────────────────────────────────────
export const CONTACT = {
  phone: "7992481351",
  phoneFormatted: "+91 79924 81351",
  email: "hrhospitality.admin@gmail.com",
  address:
    "Sainik Colony, Near Lotus Apartment, Smart Bazar, Gola Road, Patna, Bihar – 801503",
  whatsapp: "https://wa.me/917992481351",
  businessHours: "Mon – Sat: 9:00 AM – 7:00 PM",
} as const;

// ── Social Links ────────────────────────────────────────────
export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/hrtrips",
  instagram: "https://instagram.com/hrtrips",
  twitter: "https://twitter.com/hrtrips",
  youtube: "https://youtube.com/hrtrips",
} as const;

// ── Services (all 8) ───────────────────────────────────────
export const SERVICES: Service[] = [
  {
    name: "Holiday Packages",
    slug: "holiday-packages",
    description:
      "Curated domestic & international tour packages with hotels, transport, and meals included.",
    icon: "Palmtree",
    href: "/holiday-packages",
    active: true,
  },
  {
    name: "Hotel Booking",
    slug: "hotel-booking",
    description:
      "Book premium hotels across India at the best rates with flexible cancellation.",
    icon: "Hotel",
    href: "/hotel-booking",
    active: true,
  },
  {
    name: "Banquet Booking",
    slug: "banquet-booking",
    description:
      "Find and book the perfect banquet hall for weddings, parties, and corporate events.",
    icon: "PartyPopper",
    href: "/banquet-booking",
    active: true,
  },
  {
    name: "Event Booking",
    slug: "event-booking",
    description:
      "End-to-end event planning and management for memorable occasions.",
    icon: "CalendarHeart",
    href: "/event-booking",
    active: true,
  },
  {
    name: "Catering Services",
    slug: "catering-booking",
    description:
      "Professional catering for events of all sizes with customizable menus.",
    icon: "UtensilsCrossed",
    href: "/catering-booking",
    active: true,
  },
  {
    name: "Cab Services",
    slug: "cab-services",
    description:
      "Reliable airport transfers, city tours, and outstation cab bookings.",
    icon: "Car",
    href: "/cab-services",
    active: true,
  },
  {
    name: "Ticketing",
    slug: "ticketing",
    description:
      "Flight, train, and bus ticket booking at competitive prices.",
    icon: "Ticket",
    href: "/ticketing",
    active: true,
  },
  {
    name: "Manpower Services",
    slug: "manpower-services",
    description:
      "Staffing solutions for hospitality, events, and corporate requirements.",
    icon: "Users",
    href: "/manpower-services",
    active: true,
  },
];

// ── Navigation Links ────────────────────────────────────────
export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Holiday Packages", href: "/holiday-packages" },
  { label: "Hotel Booking", href: "/hotel-booking" },
  {
    label: "Services",
    href: "/services",
    children: SERVICES.map((s) => ({
      label: s.name,
      href: s.href,
    })),
  },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// ── Mock Testimonials ───────────────────────────────────────
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    location: "Patna, Bihar",
    rating: 5,
    text: "HR Trips organized our family trip to Nepal and it was absolutely wonderful. Every hotel, every transfer was taken care of. Highly recommended!",
  },
  {
    id: "2",
    name: "Priya Sharma",
    location: "Ranchi, Jharkhand",
    rating: 5,
    text: "Booked our Goa honeymoon package through HR Trips. The pricing was transparent and the experience was premium. Will definitely use again.",
  },
  {
    id: "3",
    name: "Amit Verma",
    location: "Patna, Bihar",
    rating: 4,
    text: "Very professional service. They helped us plan a corporate retreat in Shimla. The hotels were excellent and the itinerary was perfectly paced.",
  },
  {
    id: "4",
    name: "Sneha Gupta",
    location: "Lucknow, UP",
    rating: 5,
    text: "From the initial call to the end of our Kashmir trip, the HR Trips team was incredibly responsive and supportive. Best travel agency!",
  },
];

// ── Why Choose Us Items ─────────────────────────────────────
export const WHY_CHOOSE_US = [
  {
    icon: "Award",
    title: "Best Service",
    subtitle: "Quality & Trust",
    description:
      "We deliver premium travel experiences backed by years of expertise and thousands of happy travelers.",
  },
  {
    icon: "Headphones",
    title: "24/7 Support",
    subtitle: "We are here",
    description:
      "Our dedicated support team is available round the clock to assist you before, during, and after your trip.",
  },
  {
    icon: "BadgeDollarSign",
    title: "Affordable Price",
    subtitle: "Best for you",
    description:
      "Get the best deals without compromising on quality. We negotiate directly with hotels and operators.",
  },
  {
    icon: "ShieldCheck",
    title: "Safe & Secure",
    subtitle: "Travel with us",
    description:
      "Your safety is our priority. All our partners are verified and trips are insured for your peace of mind.",
  },
];
