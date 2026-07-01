// ── Type Definitions for HR Trips ───────────────────────────

export interface Package {
  id: string;
  slug: string;
  title: string;
  destination: string;
  duration: string;
  nights: number;
  days: number;
  startingPrice: number;
  image: string;
  images: string[];
  overview: string;
  highlights: string[];
  placesCovered: string[];
  pricing: PricingTier[];
  itinerary: ItineraryDay[];
  category: string;
  featured: boolean;
}

export interface PricingTier {
  hotelCategory: string;
  plan: string;
  pricePerPerson: number;
  recommended?: boolean;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface Hotel {
  id: string;
  slug: string;
  name: string;
  city: string;
  location: string;
  starRating: number;
  startingPrice: number;
  image: string;
  images: string[];
  overview: string;
  amenities: string[];
  roomTypes: RoomType[];
  cancellationPolicy: string;
  featured: boolean;
}

export interface RoomType {
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  image: string;
}

export interface HotelSearchParams {
  city?: string;
  checkin?: string;
  checkout?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  starRating?: number;
}

export interface EnquiryPayload {
  name: string;
  phone: string;
  email: string;
  travelDate: string;
  paxCount: number;
  message: string;
  packageId?: string;
}

export interface BookingPayload {
  name: string;
  phone: string;
  email: string;
  checkin: string;
  checkout: string;
  rooms: number;
  guests: number;
  roomType: string;
  hotelId: string;
  specialRequests?: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

export interface Service {
  name: string;
  slug: string;
  description: string;
  icon: string;
  href: string;
  active: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar?: string;
}

export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PackageBookingPayload {
  name: string;
  phone: string;
  email: string;
  travelDate: string;
  guests: number;
  packageId: string;
  pricingPlan: string;
  specialRequests?: string;
  totalPrice: number;
}
