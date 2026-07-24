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
  guests: number | string;
  adults?: number;
  children?: number;
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

export interface Cab {
  id: string;
  vehicleName: string;
  vehicleType: string;
  pricePerKm: number;
  capacity: number;
  image: string;
  description: string;
  featured: boolean;
}

export interface Banquet {
  id: string;
  name: string;
  location: string;
  capacity: number;
  pricePerPlateVeg: number;
  pricePerPlateNonVeg: number;
  image: string;
  description: string;
  amenities: string[];
  featured: boolean;
}

export interface EventSetup {
  id: string;
  title: string;
  eventType: string;
  startingPrice: number;
  image: string;
  description: string;
  themes: string[];
  featured: boolean;
}

export interface CateringOption {
  id: string;
  packageName: string;
  cuisineType: string;
  pricePerPlate: number;
  minimumGuests: number;
  menuItems: string[];
  image: string;
  description: string;
}

export interface TicketOption {
  id: string;
  category: string;
  provider: string;
  priceRange: string;
  supportLevel: string;
  description: string;
  features: string[];
}

export interface ManpowerOption {
  id: string;
  title: string;
  category: string;
  pricePerHour: number;
  description: string;
  qualifications: string[];
}

export interface HotelRegistration {
  id: string;
  ownerName: string;
  ownerContact: string;
  propertyManagerName: string;
  propertyManagerPhone: string;
  email: string;
  password: string;
  phone: string;
  hotelName: string;
  gst: string;
  hotelRegistrationNumber: string;
  fireSafetyNoc: string;
  cctvCamera: string;
  bankDetails: string;
  roomPic: string;
  receptionPic: string;
  bathroomPic: string;
  interiorExteriorPic: string;
  location: string;
  hotelAddress: string;
  city: string;
  state: string;
  pincode: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;

  // Post-approval detail fields (configured from owner dashboard)
  starRating?: number;
  totalRooms?: number;
  description?: string;
  amenities?: string[];
  roomTypes?: RoomType[];
}

export interface CabRegistration {
  id: string;
  // Cab Details
  cabName: string;
  cabNo: string;
  engineNo: string;
  chassisNo: string;
  insurance: string;
  fitness: string;
  permit: string;
  drivingLicenceNo: string;
  fireSafety: string;
  cabType: "Commercial" | "Private";
  // Photos / Uploads
  cabPic: string;
  interiorPic: string;
  rcPic: string;
  dlPic: string;
  insurancePic: string;
  permitPic: string;
  pucPic: string;
  // Owner Details
  ownerName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactNo: string;
  email: string;
  password: string;
  // Bank Details
  accountNo: string;
  ifscCode: string;
  bankName: string;
  // Driver Details
  driverName: string;
  driverContactNo: string;
  driverDlNo: string;
  // Status
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

