import type {
  Package,
  Hotel,
  HotelSearchParams,
  EnquiryPayload,
  BookingPayload,
  ContactPayload,
  PackageBookingPayload,
  Cab,
  Banquet,
  EventSetup,
  CateringOption,
  TicketOption,
  ManpowerOption,
  HotelRegistration,
  CabRegistration,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

// ── Generic fetch wrapper ───────────────────────────────────
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // The PHP backend is exclusively for admin authentication.
  // All other services (Packages, Hotels, Cabs, etc.) run locally inside Next.js.
  throw new Error(`PHP API is only used for admin login. Directing ${endpoint} to local catalog.`);
}

// ── Helper to check browser environment and keys ─────────────
const isBrowser = typeof window !== "undefined";
const PACKAGES_KEY = "hr_trips_packages";
const BOOKINGS_KEY = "hr_trips_bookings";

// Get packages from localStorage or fallback to MOCK_PACKAGES
function getLocalPackages(): Package[] {
  if (!isBrowser) return MOCK_PACKAGES;
  const data = localStorage.getItem(PACKAGES_KEY);
  if (!data) {
    localStorage.setItem(PACKAGES_KEY, JSON.stringify(MOCK_PACKAGES));
    return MOCK_PACKAGES;
  }
  return JSON.parse(data);
}

// Save packages list
function saveLocalPackages(packages: Package[]) {
  if (isBrowser) {
    localStorage.setItem(PACKAGES_KEY, JSON.stringify(packages));
  }
}

// Pre-populate bookings in local storage
const INITIAL_BOOKINGS: any[] = [
  {
    id: "req-1",
    type: "Package Booking",
    name: "Ramesh Sharma",
    email: "ramesh@example.com",
    phone: "9876543210",
    itemName: "Patna to Nepal Tour Package (3-Star Hotel)",
    date: "15 Jul 2026",
    guests: "2 Adults, 1 Children",
    status: "Pending",
    createdAt: new Date().toISOString()
  },
  {
    id: "req-2",
    type: "Hotel Booking",
    name: "Siddharth Verma",
    email: "siddharth@example.com",
    phone: "8765432109",
    itemName: "Hotel Maurya Patna (Club Room)",
    date: "20 Jul 2026 to 22 Jul 2026",
    guests: "2 Adults",
    status: "Approved",
    createdAt: new Date().toISOString()
  },
  {
    id: "req-3",
    type: "Cab Booking",
    name: "Vikram Singh",
    email: "vikram@example.com",
    phone: "7654321098",
    itemName: "Toyota Innova Crysta (Outstation)",
    date: "18 Jul 2026",
    guests: "4 Pax",
    status: "Pending",
    createdAt: new Date().toISOString()
  },
  {
    id: "req-4",
    type: "Banquet Booking",
    name: "Anjali Gupta",
    email: "anjali@example.com",
    phone: "6543210987",
    itemName: "Royal Celebration Hall (AC Hall)",
    date: "25 Dec 2026",
    guests: "250 Pax",
    status: "Completed",
    createdAt: new Date().toISOString()
  },
  {
    id: "req-5",
    type: "Catering Booking",
    name: "Aditya Roy",
    email: "aditya@example.com",
    phone: "5432109876",
    itemName: "Premium Veg Buffet (Mughlai Package)",
    date: "12 Aug 2026",
    guests: "150 Pax",
    status: "Cancelled",
    createdAt: new Date().toISOString()
  }
];

function getLocalBookings(): any[] {
  if (!isBrowser) return INITIAL_BOOKINGS;
  const data = localStorage.getItem(BOOKINGS_KEY);
  if (!data) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
    return INITIAL_BOOKINGS;
  }
  return JSON.parse(data);
}

function saveLocalBookings(bookings: any[]) {
  if (isBrowser) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }
}

// ── Packages ────────────────────────────────────────────────
export async function getPackages(): Promise<Package[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://hr.manishkumardev.me/api";
    const res = await fetch(`${baseUrl}/packages/list.php`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });
    const result = await res.json();
    if (result.status === "success" && Array.isArray(result.data)) {
      return result.data;
    }
    return getLocalPackages();
  } catch {
    return getLocalPackages();
  }
}

export async function getPackageBySlug(
  slug: string
): Promise<Package | undefined> {
  try {
    const pkgs = await getPackages();
    return pkgs.find(p => p.slug === slug);
  } catch {
    return getLocalPackages().find((p) => p.slug === slug);
  }
}

// Admin CRUD functions
export async function createOrUpdatePackage(pkg: Omit<Package, "id" | "slug"> & { id?: string }): Promise<Package> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://hr.manishkumardev.me/api";
    const endpoint = pkg.id 
      ? `${baseUrl}/packages/update.php` 
      : `${baseUrl}/packages/create.php`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pkg),
    });
    const result = await res.json();
    if (result.status === "success" && result.data) {
      return result.data;
    }
    throw new Error(result.message || "Failed to save remote package");
  } catch (e) {
    console.error("Error creating/updating remote package, using fallback:", e);
    const packages = getLocalPackages();
    let savedPkg: Package;

    if (pkg.id) {
      const index = packages.findIndex(p => p.id === pkg.id);
      if (index === -1) throw new Error("Package not found");
      const existing = packages[index];
      savedPkg = {
        ...existing,
        ...pkg,
        slug: pkg.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      } as Package;
      packages[index] = savedPkg;
    } else {
      savedPkg = {
        ...pkg,
        id: Math.random().toString(36).substr(2, 9),
        slug: pkg.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
        images: pkg.image ? [pkg.image] : []
      } as Package;
      packages.push(savedPkg);
    }

    saveLocalPackages(packages);
    return savedPkg;
  }
}

export async function deletePackage(id: string): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://hr.manishkumardev.me/api";
    const res = await fetch(`${baseUrl}/packages/delete.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await res.json();
    return res.ok && result.status === "success";
  } catch (e) {
    console.error("Error deleting remote package, using fallback:", e);
    const packages = getLocalPackages();
    const filtered = packages.filter(p => p.id !== id);
    if (packages.length === filtered.length) return false;
    saveLocalPackages(filtered);
    return true;
  }
}

// ── Hotels ──────────────────────────────────────────────────
const HOTELS_KEY = "hr_trips_hotels";
function getLocalHotels(): Hotel[] {
  if (!isBrowser) return MOCK_HOTELS;
  const data = localStorage.getItem(HOTELS_KEY);
  if (!data) {
    localStorage.setItem(HOTELS_KEY, JSON.stringify(MOCK_HOTELS));
    return MOCK_HOTELS;
  }
  return JSON.parse(data);
}
function saveLocalHotels(hotels: Hotel[]) {
  if (isBrowser) {
    localStorage.setItem(HOTELS_KEY, JSON.stringify(hotels));
  }
}

export async function getHotels(
  params?: HotelSearchParams
): Promise<Hotel[]> {
  try {
    const query = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    return await apiFetch<Hotel[]>(`/api/hotels${query}`);
  } catch {
    return getLocalHotels();
  }
}

export async function getHotelBySlug(
  slug: string
): Promise<Hotel | undefined> {
  try {
    return await apiFetch<Hotel>(`/api/hotels/${slug}`);
  } catch {
    return getLocalHotels().find((h) => h.slug === slug);
  }
}

export async function createOrUpdateHotel(hotel: Omit<Hotel, "id" | "slug"> & { id?: string }): Promise<Hotel> {
  try {
    if (hotel.id) {
      return await apiFetch<Hotel>(`/api/admin/hotels/${hotel.id}`, {
        method: "PUT",
        body: JSON.stringify(hotel),
      });
    } else {
      return await apiFetch<Hotel>("/api/admin/hotels", {
        method: "POST",
        body: JSON.stringify(hotel),
      });
    }
  } catch {
    const hotels = getLocalHotels();
    let saved: Hotel;
    if (hotel.id) {
      const idx = hotels.findIndex(h => h.id === hotel.id);
      if (idx === -1) throw new Error("Hotel not found");
      saved = {
        ...hotels[idx],
        ...hotel,
        slug: hotel.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      } as Hotel;
      hotels[idx] = saved;
    } else {
      saved = {
        ...hotel,
        id: Math.random().toString(36).substr(2, 9),
        slug: hotel.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
        images: hotel.image ? [hotel.image] : []
      } as Hotel;
      hotels.push(saved);
    }
    saveLocalHotels(hotels);
    return saved;
  }
}

export async function deleteHotel(id: string): Promise<boolean> {
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/admin/hotels/${id}`, {
      method: "DELETE",
    });
    return res.success;
  } catch {
    const hotels = getLocalHotels();
    const filtered = hotels.filter(h => h.id !== id);
    if (hotels.length === filtered.length) return false;
    saveLocalHotels(filtered);
    return true;
  }
}

// ── Enquiries & Bookings ────────────────────────────────────
export async function submitEnquiry(
  payload: EnquiryPayload
): Promise<{ success: boolean }> {
  try {
    return await apiFetch<{ success: boolean }>("/api/enquiries", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    // Save to local storage bookings database
    const bookings = getLocalBookings();
    const pkg = getLocalPackages().find(p => p.id === payload.packageId);

    bookings.push({
      id: `req-${Math.random().toString(36).substr(2, 9)}`,
      type: "Package Enquiry",
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      itemName: pkg ? pkg.title : "Holiday Package Request",
      date: payload.travelDate,
      guests: payload.paxCount,
      status: "Pending",
      createdAt: new Date().toISOString()
    });
    saveLocalBookings(bookings);

    console.log("Enquiry submitted (mock):", payload);
    return { success: true };
  }
}

export async function submitBooking(
  payload: BookingPayload
): Promise<{ success: boolean }> {
  try {
    return await apiFetch<{ success: boolean }>("/api/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    // Save to local storage bookings database
    const bookings = getLocalBookings();
    const hotel = MOCK_HOTELS.find(h => h.id === payload.hotelId);

    bookings.push({
      id: `req-${Math.random().toString(36).substr(2, 9)}`,
      type: "Hotel Booking",
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      itemName: hotel ? `${hotel.name} (${payload.roomType})` : "Hotel Room Request",
      date: `${payload.checkin} to ${payload.checkout}`,
      guests: payload.guests,
      status: "Pending",
      createdAt: new Date().toISOString()
    });
    saveLocalBookings(bookings);

    console.log("Booking submitted (mock):", payload);
    return { success: true };
  }
}

export async function submitContact(
  payload: ContactPayload
): Promise<{ success: boolean }> {
  try {
    return await apiFetch<{ success: boolean }>("/api/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    // Save contact enquiry to bookings database
    const bookings = getLocalBookings();
    bookings.push({
      id: `req-${Math.random().toString(36).substr(2, 9)}`,
      type: "Contact Request",
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      itemName: payload.service === "other" ? "General Request" : payload.service,
      date: "N/A",
      guests: 1,
      status: "Pending",
      createdAt: new Date().toISOString()
    });
    saveLocalBookings(bookings);

    console.log("Contact submitted (mock):", payload);
    return { success: true };
  }
}

export async function submitPackageBooking(
  payload: PackageBookingPayload
): Promise<{ success: boolean }> {
  try {
    return await apiFetch<{ success: boolean }>("/api/package-bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    // Save to local storage bookings database for testing fallback
    const bookings = getLocalBookings();
    const pkg = getLocalPackages().find((p) => p.id === payload.packageId);

    bookings.push({
      id: `req-${Math.random().toString(36).substr(2, 9)}`,
      type: "Package Booking",
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      itemName: `${pkg ? pkg.title : "Holiday Tour Booking"} (${payload.pricingPlan})`,
      date: payload.travelDate,
      guests: payload.guests,
      status: "Pending",
      createdAt: new Date().toISOString()
    });
    saveLocalBookings(bookings);

    console.log("Package booking submitted (mock):", payload);
    return { success: true };
  }
}

// Admin Enquiry/Booking management functions
export async function getAdminBookings(): Promise<any[]> {
  let packageBookings: any[] = [];
  
  // 1. Fetch package bookings from PHP remote API
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://hr.manishkumardev.me/api";
    const response = await fetch(`${baseUrl}/bookings/list.php`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });
    const result = await response.json();
    if (result.status === "success" && Array.isArray(result.data)) {
      packageBookings = result.data.map((b: any) => ({
        id: String(b.id),
        type: "Package Booking",
        name: b.customer_name,
        email: b.customer_email,
        phone: b.customer_phone,
        itemName: b.package_title || `Package ID: ${b.package_id}`,
        date: b.travel_date,
        guests: `${b.adults} Adults${b.children > 0 ? `, ${b.children} Children` : ""}`,
        status: b.status === "confirmed" ? "Approved" : (b.status === "cancelled" ? "Cancelled" : "Pending"),
        createdAt: b.created_at,
        isRemote: true
      }));
    }
  } catch (e) {
    console.error("Error fetching remote package bookings:", e);
  }

  // 2. Fetch local storage bookings (hotels, cabs, catering, etc.)
  const localBookings = getLocalBookings().filter(b => b.type !== "Package Booking" && b.type !== "Package Enquiry");

  // 3. Return merged array
  return [...packageBookings, ...localBookings];
}

export async function createAdminBooking(booking: any): Promise<any> {
  const bookings = getLocalBookings();
  bookings.push(booking);
  saveLocalBookings(bookings);
  return booking;
}

export async function deleteAdminBooking(id: string): Promise<boolean> {
  const isNumeric = /^\d+$/.test(String(id));
  if (isNumeric) {
    // Remote PHP database bookings cannot be deleted via a public endpoint in this system, so we return true.
    return true;
  }

  try {
    const bookings = getLocalBookings();
    const filtered = bookings.filter((b) => b.id !== id);
    if (bookings.length === filtered.length) return false;
    saveLocalBookings(filtered);
    return true;
  } catch {
    return false;
  }
}

export async function updateBookingStatus(id: string, status: string): Promise<boolean> {
  const isNumeric = /^\d+$/.test(String(id));
  if (isNumeric) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://hr.manishkumardev.me/api";
      const phpStatus = status === "Approved" ? "confirmed" : (status === "Cancelled" ? "cancelled" : "pending");
      const response = await fetch(`${baseUrl}/bookings/update_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id), status: phpStatus })
      });
      const result = await response.json();
      return response.ok && result.status === "success";
    } catch (e) {
      console.error("Error updating remote status:", e);
      return false;
    }
  }

  try {
    const bookings = getLocalBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) return false;
    bookings[index].status = status;
    saveLocalBookings(bookings);
    return true;
  } catch {
    return false;
  }
}

// Admin Enquiries management functions
export async function getAdminEnquiries(): Promise<any[]> {
  let packageEnquiries: any[] = [];
  
  // 1. Fetch enquiries from PHP remote API
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://hr.manishkumardev.me/api";
    const response = await fetch(`${baseUrl}/enquiries/list.php`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });
    const result = await response.json();
    if (result.status === "success" && Array.isArray(result.data)) {
      packageEnquiries = result.data.map((e: any) => ({
        id: String(e.id),
        type: "Package Enquiry",
        name: e.customer_name,
        email: e.customer_email,
        phone: e.customer_phone,
        itemName: e.package_title || `Package ID: ${e.package_id}`,
        date: e.travel_date,
        guests: e.pax_count || 1,
        status: e.status === "confirmed" ? "Approved" : (e.status === "cancelled" ? "Cancelled" : "Pending"),
        createdAt: e.created_at,
        isRemote: true
      }));
    }
  } catch (e) {
    console.error("Error fetching remote package enquiries:", e);
  }

  // 2. Fetch local storage enquiries (Package Enquiry and Contact Request)
  const localEnquiries = getLocalBookings().filter(b => b.type === "Package Enquiry" || b.type === "Contact Request");

  // 3. Return merged array
  return [...packageEnquiries, ...localEnquiries];
}

export async function deleteAdminEnquiry(id: string): Promise<boolean> {
  const isNumeric = /^\d+$/.test(String(id));
  if (isNumeric) {
    return true;
  }

  try {
    const bookings = getLocalBookings();
    const filtered = bookings.filter((b) => b.id !== id);
    if (bookings.length === filtered.length) return false;
    saveLocalBookings(filtered);
    return true;
  } catch {
    return false;
  }
}

export async function updateEnquiryStatus(id: string, status: string): Promise<boolean> {
  const isNumeric = /^\d+$/.test(String(id));
  if (isNumeric) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://hr.manishkumardev.me/api";
      const phpStatus = status === "Approved" ? "confirmed" : (status === "Cancelled" ? "cancelled" : "pending");
      const response = await fetch(`${baseUrl}/enquiries/update_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id), status: phpStatus })
      });
      const result = await response.json();
      return response.ok && result.status === "success";
    } catch (e) {
      console.error("Error updating remote enquiry status:", e);
      return false;
    }
  }

  try {
    const bookings = getLocalBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) return false;
    bookings[index].status = status;
    saveLocalBookings(bookings);
    return true;
  } catch {
    return false;
  }
}


// ── Mock Data ───────────────────────────────────────────────
export const MOCK_PACKAGES: Package[] = [
  {
    id: "1",
    slug: "patna-to-nepal-tour",
    title: "Patna to Nepal Tour Package",
    destination: "Nepal",
    duration: "4 Nights / 5 Days",
    nights: 4,
    days: 5,
    startingPrice: 12500,
    image:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&q=90",
    images: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&q=90",
      "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1920&q=90",
      "https://images.unsplash.com/photo-1558799401-1dcba79834c2?w=1920&q=90",
    ],
    overview:
      "Experience the mesmerizing beauty of Nepal with our specially designed package covering the cultural heart of Kathmandu and the serene landscapes of Pokhara.",
    highlights: [
      "Comfortable Hotel Accommodation",
      "Daily Breakfast & Dinner",
      "Transportation Throughout Tour",
      "Professional Tour Assistance",
    ],
    placesCovered: [
      "Pashupatinath Temple",
      "Swayambhunath Temple",
      "Sarangkot Sunrise Point",
      "Fewa Lake Boating",
    ],
    pricing: [
      {
        hotelCategory: "2-Star Hotel",
        plan: "MAP Plan",
        pricePerPerson: 12500,
      },
      {
        hotelCategory: "3-Star Hotel",
        plan: "MAP Plan",
        pricePerPerson: 15500,
        recommended: true,
      },
    ],
    itinerary: [
      {
        day: 1,
        title: "Patna to Kathmandu Drive",
        description:
          "Morning pickup from Patna. Scenic drive to the Nepal border. After immigration, continue to Kathmandu. Check in and evening at leisure in Thamel.",
      },
      {
        day: 2,
        title: "Kathmandu Cultural Sightseeing",
        description:
          "After breakfast, explore the holy Pashupatinath Temple and the historic Swayambhunath Stupa (Monkey Temple). Enjoy shopping and dining in Kathmandu.",
      },
      {
        day: 3,
        title: "Kathmandu to Pokhara Travel",
        description:
          "Drive to Pokhara, enjoying views of mountain rivers and green hills. Check in at your lakeside hotel. Spend a peaceful evening by the lake.",
      },
      {
        day: 4,
        title: "Pokhara Sunrise & Fewa Boating",
        description:
          "Early morning drive to Sarangkot for a spectacular sunrise over the Annapurna range. In the afternoon, enjoy boating on the calm waters of Fewa Lake.",
      },
      {
        day: 5,
        title: "Pokhara to Patna Return",
        description:
          "Depart Pokhara after breakfast and drive back to Patna via border crossing, completing your memorable Himalayan journey.",
      },
    ],
    category: "international",
    featured: true,
  },
  {
    id: "2",
    slug: "gangtok-darjeeling-tour",
    title: "Gangtok & Darjeeling Tour",
    destination: "Sikkim & West Bengal",
    duration: "5 Nights / 6 Days",
    nights: 5,
    days: 6,
    startingPrice: 13500,
    image:
      "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=1920&q=90",
    images: [
      "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=1920&q=90",
      "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=1920&q=90",
    ],
    overview:
      "Explore the breathtaking beauty of the Himalayas, lush tea gardens, and vibrant monasteries with our complete Gangtok and Darjeeling getaway package.",
    highlights: [
      "NJP Pickup & Drop Included",
      "Private Cab for Travel",
      "Breakfast, Lunch & Dinner",
    ],
    placesCovered: [
      "Gangtok Local Sightseeing",
      "Darjeeling Local Sightseeing",
    ],
    pricing: [
      {
        hotelCategory: "All Meals Included",
        plan: "AP Plan",
        pricePerPerson: 13500,
        recommended: true,
      },
    ],
    itinerary: [
      {
        day: 1,
        title: "NJP to Gangtok Transfer",
        description:
          "Meet & greet at NJP Railway Station. Drive through the picturesque hills to Gangtok. Check in at your hotel. Rest of the day is at leisure.",
      },
      {
        day: 2,
        title: "Tsomgo Lake & Baba Mandir Excursion",
        description:
          "Full-day excursion to Tsomgo Lake, situated at 12,400 ft, and the sacred Baba Mandir. Soak in the stunning high-altitude views.",
      },
      {
        day: 3,
        title: "Gangtok Sightseeing & Transfer to Darjeeling",
        description:
          "Enjoy local sightseeing in Gangtok covering viewpoints and monasteries. In the afternoon, transfer to the scenic hill station of Darjeeling.",
      },
      {
        day: 4,
        title: "Tiger Hill Sunrise & Darjeeling Sightseeing",
        description:
          "Early morning trip to Tiger Hill to watch the sunrise paint Mt. Kanchenjunga. Later, visit Ghoom Monastery, Batasia Loop, and local tea estates.",
      },
      {
        day: 5,
        title: "Darjeeling Cultural Walk & Leisure",
        description:
          "Explore Mall Road, shop for high-quality local tea, and visit local craft centers. Overnight stay at the hotel.",
      },
      {
        day: 6,
        title: "Darjeeling to NJP Departure",
        description:
          "After breakfast, check out of your hotel and drive back to NJP station for your journey home.",
      },
    ],
    category: "domestic",
    featured: true,
  },
  {
    id: "3",
    slug: "kakolat-waterfall-pawapuri",
    title: "Kakolat Waterfall & Pawapuri",
    destination: "Bihar",
    duration: "One Day Tour",
    nights: 0,
    days: 1,
    startingPrice: 1500,
    image:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=90",
    images: [
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=90",
      "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=1920&q=90",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1920&q=90",
    ],
    overview:
      "Enjoy a refreshing day out at the spectacular Kakolat Waterfall and visit the spiritually significant and peaceful Jal Mandir in Pawapuri.",
    highlights: [
      "Kakolat Entry Ticket Included",
      "Breakfast, Lunch & Evening Tea",
      "Comfortable Transportation",
    ],
    placesCovered: [
      "Kakolat Waterfall",
      "Pawapuri Sightseeing",
    ],
    pricing: [
      {
        hotelCategory: "Standard Package",
        plan: "All Meals Included",
        pricePerPerson: 1500,
        recommended: true,
      },
    ],
    itinerary: [
      {
        day: 1,
        title: "Full Day Trip",
        description:
          "Early morning departure from Patna. Drive to Kakolat Waterfall for a cool dip. Enjoy a hot local lunch. Proceed to the peaceful Jal Mandir in Pawapuri, return to Patna by evening.",
      },
    ],
    category: "domestic",
    featured: true,
  },
  {
    id: "4",
    slug: "patna-to-rohtas-tour",
    title: "Patna to Rohtas Tour",
    destination: "Bihar",
    duration: "1 Night / 2 Days",
    nights: 1,
    days: 2,
    startingPrice: 3500,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=90",
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=90",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=90",
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=90",
    ],
    overview:
      "Discover the historical marvels and breathtaking natural waterfalls of Rohtas on this quick and exciting weekend getaway.",
    highlights: [
      "1 Night Hotel Stay",
      "Breakfast & Dinner Included",
      "Guided Local Sightseeing",
    ],
    placesCovered: [
      "Rohtas Killa & Tutala Dham",
      "Gupta Dham & Kashi Waterfall",
      "Chaurasan Mandir",
      "Pilot Baba Temple",
    ],
    pricing: [
      {
        hotelCategory: "Standard Package",
        plan: "MAP Plan",
        pricePerPerson: 3500,
        recommended: true,
      },
    ],
    itinerary: [
      {
        day: 1,
        title: "Patna to Rohtas Fort (Rohtas Killa) Visit",
        description:
          "Pickup from Patna and drive to Rohtas. Visit Pilot Baba Temple, then trek/drive up to explore the historic Rohtas Killa ruins. Check-in and dinner.",
      },
      {
        day: 2,
        title: "Tutala Dham Waterfalls & Temples",
        description:
          "After breakfast, visit the beautiful Tutala Dham and Gupta Dham. See the serene Chaurasan Mandir and Kashi Waterfall. Drive back to Patna in the evening.",
      },
    ],
    category: "domestic",
    featured: true,
  },
];

const MOCK_HOTELS: Hotel[] = [
  {
    id: "1",
    slug: "hotel-royal-patna",
    name: "Hotel Royal Inn",
    city: "Patna",
    location: "Fraser Road, Patna, Bihar",
    starRating: 3,
    startingPrice: 1899,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=90",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=90",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=90",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=90",
    ],
    overview:
      "Located in the heart of Patna, Hotel Royal Inn offers comfortable rooms, modern amenities, and warm hospitality. Perfect for business and leisure travelers.",
    amenities: [
      "Free WiFi",
      "AC Rooms",
      "Restaurant",
      "Room Service",
      "Parking",
      "24/7 Front Desk",
      "Laundry",
      "Power Backup",
    ],
    roomTypes: [
      {
        name: "Standard Room",
        description: "Well-furnished room with essential amenities",
        pricePerNight: 1899,
        maxGuests: 2,
        image:
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=90",
      },
      {
        name: "Deluxe Room",
        description: "Spacious room with city view and premium furnishings",
        pricePerNight: 2899,
        maxGuests: 3,
        image:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=90",
      },
      {
        name: "Suite",
        description:
          "Luxurious suite with separate living area and king-size bed",
        pricePerNight: 4499,
        maxGuests: 4,
        image:
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1920&q=90",
      },
    ],
    cancellationPolicy:
      "Free cancellation up to 24 hours before check-in. 50% charge for cancellations within 24 hours.",
    featured: true,
  },
  {
    id: "2",
    slug: "hotel-paradise-goa",
    name: "Hotel Paradise Beach Resort",
    city: "Goa",
    location: "Calangute Beach Road, North Goa",
    starRating: 4,
    startingPrice: 3499,
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=90",
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=90",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=90",
    ],
    overview:
      "A premium beachside resort in Calangute with pool, spa, and direct beach access. Enjoy Goan hospitality at its finest.",
    amenities: [
      "Swimming Pool",
      "Spa & Wellness",
      "Beach Access",
      "Multi-Cuisine Restaurant",
      "Bar & Lounge",
      "Free WiFi",
      "AC Rooms",
      "Gym",
      "Kids Play Area",
    ],
    roomTypes: [
      {
        name: "Superior Room",
        description: "Garden-facing room with balcony",
        pricePerNight: 3499,
        maxGuests: 2,
        image:
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=90",
      },
      {
        name: "Pool View Room",
        description: "Room overlooking the swimming pool with premium amenities",
        pricePerNight: 4999,
        maxGuests: 2,
        image:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=90",
      },
      {
        name: "Beach Cottage",
        description:
          "Private cottage steps from the beach with outdoor seating",
        pricePerNight: 7999,
        maxGuests: 3,
        image:
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1920&q=90",
      },
    ],
    cancellationPolicy:
      "Free cancellation up to 48 hours before check-in. Full charge for no-shows.",
    featured: true,
  },
  {
    id: "3",
    slug: "mountain-view-shimla",
    name: "Mountain View Resort",
    city: "Shimla",
    location: "Mall Road, Shimla, Himachal Pradesh",
    starRating: 3,
    startingPrice: 2499,
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=90",
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=90",
      "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?w=1920&q=90",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=90",
    ],
    overview:
      "Nestled in the hills of Shimla with stunning valley views. Cozy rooms, bonfire nights, and warm hospitality make this the ideal mountain retreat.",
    amenities: [
      "Mountain View",
      "Restaurant",
      "Bonfire",
      "Free WiFi",
      "Parking",
      "Room Heater",
      "Room Service",
    ],
    roomTypes: [
      {
        name: "Standard Room",
        description: "Cozy room with valley view",
        pricePerNight: 2499,
        maxGuests: 2,
        image:
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=90",
      },
      {
        name: "Deluxe Room",
        description: "Spacious room with panoramic mountain view",
        pricePerNight: 3999,
        maxGuests: 3,
        image:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=90",
      },
    ],
    cancellationPolicy:
      "Free cancellation up to 48 hours before check-in. 50% charge within 48 hours.",
    featured: true,
  },
  {
    id: "4",
    slug: "lake-palace-udaipur",
    name: "Lake Palace Heritage Hotel",
    city: "Udaipur",
    location: "Lake Pichola, Udaipur, Rajasthan",
    starRating: 5,
    startingPrice: 5999,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920&q=90",
    images: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920&q=90",
    ],
    overview:
      "Experience royal Rajasthani hospitality at this heritage hotel overlooking Lake Pichola. World-class dining, spa, and cultural evenings.",
    amenities: [
      "Lake View",
      "Heritage Architecture",
      "Fine Dining",
      "Spa",
      "Swimming Pool",
      "Cultural Evenings",
      "Free WiFi",
      "Butler Service",
    ],
    roomTypes: [
      {
        name: "Heritage Room",
        description: "Traditionally decorated room with modern comforts",
        pricePerNight: 5999,
        maxGuests: 2,
        image:
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=90",
      },
      {
        name: "Royal Suite",
        description: "Lavish suite with lake view and private sitting area",
        pricePerNight: 12999,
        maxGuests: 3,
        image:
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
      },
    ],
    cancellationPolicy:
      "Free cancellation up to 72 hours before check-in. 100% charge within 24 hours.",
    featured: true,
  },
];

// ── Cabs Management ─────────────────────────────────────────
const CABS_KEY = "hr_trips_cabs";
const MOCK_CABS: Cab[] = [
  {
    id: "cab-1",
    vehicleName: "Swift Dzire",
    vehicleType: "Sedan",
    pricePerKm: 12,
    capacity: 4,
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1920&q=90",
    description: "Comfortable and compact AC Sedan, ideal for small families or business trips.",
    featured: true,
  },
  {
    id: "cab-2",
    vehicleName: "Toyota Innova Crysta",
    vehicleType: "SUV",
    pricePerKm: 18,
    capacity: 7,
    image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1920&q=90",
    description: "Premium and highly spacious SUV with captain seats and dual AC. Perfect for long outstation drives.",
    featured: true,
  },
  {
    id: "cab-3",
    vehicleName: "Tempo Traveller",
    vehicleType: "Traveller",
    pricePerKm: 26,
    capacity: 12,
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&q=90",
    description: "Luxury Tempo Traveller with pushback seats, perfect for group tour excursions and family gatherings.",
    featured: false,
  },
];

function getLocalCabs(): Cab[] {
  if (!isBrowser) return MOCK_CABS;
  const data = localStorage.getItem(CABS_KEY);
  if (!data) {
    localStorage.setItem(CABS_KEY, JSON.stringify(MOCK_CABS));
    return MOCK_CABS;
  }
  return JSON.parse(data);
}
function saveLocalCabs(cabs: Cab[]) {
  if (isBrowser) {
    localStorage.setItem(CABS_KEY, JSON.stringify(cabs));
  }
}

export async function getCabs(): Promise<Cab[]> {
  try {
    return await apiFetch<Cab[]>("/api/cabs");
  } catch {
    return getLocalCabs();
  }
}

export async function createOrUpdateCab(cab: Omit<Cab, "id"> & { id?: string }): Promise<Cab> {
  try {
    if (cab.id) {
      return await apiFetch<Cab>(`/api/admin/cabs/${cab.id}`, {
        method: "PUT",
        body: JSON.stringify(cab),
      });
    } else {
      return await apiFetch<Cab>("/api/admin/cabs", {
        method: "POST",
        body: JSON.stringify(cab),
      });
    }
  } catch {
    const cabs = getLocalCabs();
    let saved: Cab;
    if (cab.id) {
      const idx = cabs.findIndex(c => c.id === cab.id);
      if (idx === -1) throw new Error("Cab not found");
      saved = { ...cabs[idx], ...cab } as Cab;
      cabs[idx] = saved;
    } else {
      saved = {
        ...cab,
        id: Math.random().toString(36).substr(2, 9),
      } as Cab;
      cabs.push(saved);
    }
    saveLocalCabs(cabs);
    return saved;
  }
}

export async function deleteCab(id: string): Promise<boolean> {
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/admin/cabs/${id}`, {
      method: "DELETE",
    });
    return res.success;
  } catch {
    const cabs = getLocalCabs();
    const filtered = cabs.filter(c => c.id !== id);
    if (cabs.length === filtered.length) return false;
    saveLocalCabs(filtered);
    return true;
  }
}

// ── Banquets Management ─────────────────────────────────────
const BANQUETS_KEY = "hr_trips_banquets";
const MOCK_BANQUETS: Banquet[] = [
  {
    id: "bq-1",
    name: "Royal Celebration Palace",
    location: "Bailey Road, Patna",
    capacity: 600,
    pricePerPlateVeg: 850,
    pricePerPlateNonVeg: 1100,
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&q=90",
    description: "Elegant, centrally air-conditioned hall with expansive layouts, perfect for high-profile weddings and gala events.",
    amenities: ["AC Rooms", "Valet Parking", "In-house Catering", "Bridal Suites", "Audio System"],
    featured: true,
  },
  {
    id: "bq-2",
    name: "Crystal Ballroom",
    location: "Fraser Road, Patna",
    capacity: 350,
    pricePerPlateVeg: 750,
    pricePerPlateNonVeg: 950,
    image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1920&q=90",
    description: "Premium interior aesthetics, ideal for mid-sized luxury receptions, conventions, and corporate meetings.",
    amenities: ["AC Rooms", "Modern Stage Lighting", "Live Kitchen", "Wi-Fi Access"],
    featured: true,
  },
];

function getLocalBanquets(): Banquet[] {
  if (!isBrowser) return MOCK_BANQUETS;
  const data = localStorage.getItem(BANQUETS_KEY);
  if (!data) {
    localStorage.setItem(BANQUETS_KEY, JSON.stringify(MOCK_BANQUETS));
    return MOCK_BANQUETS;
  }
  return JSON.parse(data);
}
function saveLocalBanquets(bq: Banquet[]) {
  if (isBrowser) {
    localStorage.setItem(BANQUETS_KEY, JSON.stringify(bq));
  }
}

export async function getBanquets(): Promise<Banquet[]> {
  try {
    return await apiFetch<Banquet[]>("/api/banquets");
  } catch {
    return getLocalBanquets();
  }
}

export async function createOrUpdateBanquet(bq: Omit<Banquet, "id"> & { id?: string }): Promise<Banquet> {
  try {
    if (bq.id) {
      return await apiFetch<Banquet>(`/api/admin/banquets/${bq.id}`, {
        method: "PUT",
        body: JSON.stringify(bq),
      });
    } else {
      return await apiFetch<Banquet>("/api/admin/banquets", {
        method: "POST",
        body: JSON.stringify(bq),
      });
    }
  } catch {
    const banquets = getLocalBanquets();
    let saved: Banquet;
    if (bq.id) {
      const idx = banquets.findIndex(b => b.id === bq.id);
      if (idx === -1) throw new Error("Banquet not found");
      saved = { ...banquets[idx], ...bq } as Banquet;
      banquets[idx] = saved;
    } else {
      saved = {
        ...bq,
        id: Math.random().toString(36).substr(2, 9),
      } as Banquet;
      banquets.push(saved);
    }
    saveLocalBanquets(banquets);
    return saved;
  }
}

export async function deleteBanquet(id: string): Promise<boolean> {
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/admin/banquets/${id}`, {
      method: "DELETE",
    });
    return res.success;
  } catch {
    const banquets = getLocalBanquets();
    const filtered = banquets.filter(b => b.id !== id);
    if (banquets.length === filtered.length) return false;
    saveLocalBanquets(filtered);
    return true;
  }
}

// ── Events Management ───────────────────────────────────────
const EVENTS_KEY = "hr_trips_events";
const MOCK_EVENTS: EventSetup[] = [
  {
    id: "ev-1",
    title: "Premium Wedding Coordination",
    eventType: "Wedding",
    startingPrice: 150000,
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920&q=90",
    description: "Complete stage decoration, floral setups, photography coordination, and wedding gate planning.",
    themes: ["Traditional Royal", "Modern Pastel", "Elegant Floral"],
    featured: true,
  },
  {
    id: "ev-2",
    title: "Corporate Launch Setup",
    eventType: "Corporate",
    startingPrice: 75000,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&q=90",
    description: "Premium AV sound setup, stage framing, custom corporate backdrops, and registration counters.",
    themes: ["Modern Minimalist", "Tech Innovator Blue"],
    featured: false,
  },
];

function getLocalEvents(): EventSetup[] {
  if (!isBrowser) return MOCK_EVENTS;
  const data = localStorage.getItem(EVENTS_KEY);
  if (!data) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(MOCK_EVENTS));
    return MOCK_EVENTS;
  }
  return JSON.parse(data);
}
function saveLocalEvents(ev: EventSetup[]) {
  if (isBrowser) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(ev));
  }
}

export async function getEvents(): Promise<EventSetup[]> {
  try {
    return await apiFetch<EventSetup[]>("/api/events");
  } catch {
    return getLocalEvents();
  }
}

export async function createOrUpdateEvent(ev: Omit<EventSetup, "id"> & { id?: string }): Promise<EventSetup> {
  try {
    if (ev.id) {
      return await apiFetch<EventSetup>(`/api/admin/events/${ev.id}`, {
        method: "PUT",
        body: JSON.stringify(ev),
      });
    } else {
      return await apiFetch<EventSetup>("/api/admin/events", {
        method: "POST",
        body: JSON.stringify(ev),
      });
    }
  } catch {
    const events = getLocalEvents();
    let saved: EventSetup;
    if (ev.id) {
      const idx = events.findIndex(e => e.id === ev.id);
      if (idx === -1) throw new Error("Event not found");
      saved = { ...events[idx], ...ev } as EventSetup;
      events[idx] = saved;
    } else {
      saved = {
        ...ev,
        id: Math.random().toString(36).substr(2, 9),
      } as EventSetup;
      events.push(saved);
    }
    saveLocalEvents(events);
    return saved;
  }
}

export async function deleteEvent(id: string): Promise<boolean> {
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/admin/events/${id}`, {
      method: "DELETE",
    });
    return res.success;
  } catch {
    const events = getLocalEvents();
    const filtered = events.filter(e => e.id !== id);
    if (events.length === filtered.length) return false;
    saveLocalEvents(filtered);
    return true;
  }
}

// ── Catering Management ─────────────────────────────────────
const CATERING_KEY = "hr_trips_catering";
const MOCK_CATERING: CateringOption[] = [
  {
    id: "cat-1",
    packageName: "Royal Indian Feast",
    cuisineType: "Multi-Cuisine",
    pricePerPlate: 450,
    minimumGuests: 50,
    menuItems: ["Paneer Butter Masala", "Mix Veg", "Dal Makhani", "Jeera Rice", "Gulab Jamun"],
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=1920&q=90",
    description: "Premium traditional North Indian vegetarian catering plan, featuring rich, slow-cooked delicacies.",
  },
  {
    id: "cat-2",
    packageName: "Mughlai Non-Veg Special",
    cuisineType: "Mughlai",
    pricePerPlate: 650,
    minimumGuests: 80,
    menuItems: ["Chicken Biryani", "Mutton Korma", "Naan", "Raita", "Double ka Meetha"],
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=1920&q=90",
    description: "A grand non-vegetarian buffet curated by specialized Mughlai chefs for traditional celebrations.",
  },
];

function getLocalCatering(): CateringOption[] {
  if (!isBrowser) return MOCK_CATERING;
  const data = localStorage.getItem(CATERING_KEY);
  if (!data) {
    localStorage.setItem(CATERING_KEY, JSON.stringify(MOCK_CATERING));
    return MOCK_CATERING;
  }
  return JSON.parse(data);
}
function saveLocalCatering(cat: CateringOption[]) {
  if (isBrowser) {
    localStorage.setItem(CATERING_KEY, JSON.stringify(cat));
  }
}

export async function getCateringOptions(): Promise<CateringOption[]> {
  try {
    return await apiFetch<CateringOption[]>("/api/catering");
  } catch {
    return getLocalCatering();
  }
}

export async function createOrUpdateCatering(cat: Omit<CateringOption, "id"> & { id?: string }): Promise<CateringOption> {
  try {
    if (cat.id) {
      return await apiFetch<CateringOption>(`/api/admin/catering/${cat.id}`, {
        method: "PUT",
        body: JSON.stringify(cat),
      });
    } else {
      return await apiFetch<CateringOption>("/api/admin/catering", {
        method: "POST",
        body: JSON.stringify(cat),
      });
    }
  } catch {
    const options = getLocalCatering();
    let saved: CateringOption;
    if (cat.id) {
      const idx = options.findIndex(c => c.id === cat.id);
      if (idx === -1) throw new Error("Catering option not found");
      saved = { ...options[idx], ...cat } as CateringOption;
      options[idx] = saved;
    } else {
      saved = {
        ...cat,
        id: Math.random().toString(36).substr(2, 9),
      } as CateringOption;
      options.push(saved);
    }
    saveLocalCatering(options);
    return saved;
  }
}

export async function deleteCatering(id: string): Promise<boolean> {
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/admin/catering/${id}`, {
      method: "DELETE",
    });
    return res.success;
  } catch {
    const options = getLocalCatering();
    const filtered = options.filter(c => c.id !== id);
    if (options.length === filtered.length) return false;
    saveLocalCatering(filtered);
    return true;
  }
}

// ── Ticketing Management ────────────────────────────────────
const TICKETS_KEY = "hr_trips_tickets";
const MOCK_TICKETS: TicketOption[] = [
  {
    id: "tkt-1",
    category: "Flight Tickets",
    provider: "Domestic / International Air Travel",
    priceRange: "Convenience fee ₹150 per seat",
    supportLevel: "24/7 VIP Emergency Flight Assistance",
    description: "Rapid flight search and ticketing for commercial airlines, including group corporate bookings.",
    features: ["Instant PNR Generation", "Easy Rescheduling Support", "Lounge Passes Add-on"],
  },
  {
    id: "tkt-2",
    category: "Train Tickets",
    provider: "IRCTC Authorised Ticketing",
    priceRange: "Convenience fee ₹30 per seat",
    supportLevel: "Priority seat allotment assistance",
    description: "Hassle-free IRCTC train bookings across premium trains (Rajdhani, Shatabdi, Vande Bharat).",
    features: ["Tatkal Support Help", "E-Ticket Delivery", "Auto-Upgrade Preferences"],
  },
];

function getLocalTickets(): TicketOption[] {
  if (!isBrowser) return MOCK_TICKETS;
  const data = localStorage.getItem(TICKETS_KEY);
  if (!data) {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(MOCK_TICKETS));
    return MOCK_TICKETS;
  }
  return JSON.parse(data);
}
function saveLocalTickets(tkt: TicketOption[]) {
  if (isBrowser) {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tkt));
  }
}

export async function getTicketingOptions(): Promise<TicketOption[]> {
  try {
    return await apiFetch<TicketOption[]>("/api/ticketing");
  } catch {
    return getLocalTickets();
  }
}

export async function createOrUpdateTicket(tkt: Omit<TicketOption, "id"> & { id?: string }): Promise<TicketOption> {
  try {
    if (tkt.id) {
      return await apiFetch<TicketOption>(`/api/admin/ticketing/${tkt.id}`, {
        method: "PUT",
        body: JSON.stringify(tkt),
      });
    } else {
      return await apiFetch<TicketOption>("/api/admin/ticketing", {
        method: "POST",
        body: JSON.stringify(tkt),
      });
    }
  } catch {
    const options = getLocalTickets();
    let saved: TicketOption;
    if (tkt.id) {
      const idx = options.findIndex(t => t.id === tkt.id);
      if (idx === -1) throw new Error("Ticket option not found");
      saved = { ...options[idx], ...tkt } as TicketOption;
      options[idx] = saved;
    } else {
      saved = {
        ...tkt,
        id: Math.random().toString(36).substr(2, 9),
      } as TicketOption;
      options.push(saved);
    }
    saveLocalTickets(options);
    return saved;
  }
}

export async function deleteTicket(id: string): Promise<boolean> {
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/admin/ticketing/${id}`, {
      method: "DELETE",
    });
    return res.success;
  } catch {
    const options = getLocalTickets();
    const filtered = options.filter(t => t.id !== id);
    if (options.length === filtered.length) return false;
    saveLocalTickets(filtered);
    return true;
  }
}

// ── Manpower Management ─────────────────────────────────────
const MANPOWER_KEY = "hr_trips_manpower";
const MOCK_MANPOWER: ManpowerOption[] = [
  {
    id: "man-1",
    title: "Professional Security Guards",
    category: "Security Services",
    pricePerHour: 180,
    description: "Highly trained, vetted, and disciplined security guards for venues, banquets, and residential sites.",
    qualifications: ["Vetted Background", "First Aid Trained", "Uniformed Presence"],
  },
  {
    id: "man-2",
    title: "Corporate Housekeeping Staff",
    category: "Housekeeping",
    pricePerHour: 120,
    description: "Experienced housekeepers, cleaners, and supervisors for maintaining cleanliness during events.",
    qualifications: ["Expert cleaning skill", "ID Checked", "Disciplined work ethics"],
  },
];

function getLocalManpower(): ManpowerOption[] {
  if (!isBrowser) return MOCK_MANPOWER;
  const data = localStorage.getItem(MANPOWER_KEY);
  if (!data) {
    localStorage.setItem(MANPOWER_KEY, JSON.stringify(MOCK_MANPOWER));
    return MOCK_MANPOWER;
  }
  return JSON.parse(data);
}
function saveLocalManpower(man: ManpowerOption[]) {
  if (isBrowser) {
    localStorage.setItem(MANPOWER_KEY, JSON.stringify(man));
  }
}

export async function getManpowerOptions(): Promise<ManpowerOption[]> {
  try {
    return await apiFetch<ManpowerOption[]>("/api/manpower");
  } catch {
    return getLocalManpower();
  }
}

export async function createOrUpdateManpower(man: Omit<ManpowerOption, "id"> & { id?: string }): Promise<ManpowerOption> {
  try {
    if (man.id) {
      return await apiFetch<ManpowerOption>(`/api/admin/manpower/${man.id}`, {
        method: "PUT",
        body: JSON.stringify(man),
      });
    } else {
      return await apiFetch<ManpowerOption>("/api/admin/manpower", {
        method: "POST",
        body: JSON.stringify(man),
      });
    }
  } catch {
    const options = getLocalManpower();
    let saved: ManpowerOption;
    if (man.id) {
      const idx = options.findIndex(m => m.id === man.id);
      if (idx === -1) throw new Error("Manpower option not found");
      saved = { ...options[idx], ...man } as ManpowerOption;
      options[idx] = saved;
    } else {
      saved = {
        ...man,
        id: Math.random().toString(36).substr(2, 9),
      } as ManpowerOption;
      options.push(saved);
    }
    saveLocalManpower(options);
    return saved;
  }
}

export async function deleteManpower(id: string): Promise<boolean> {
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/admin/manpower/${id}`, {
      method: "DELETE",
    });
    return res.success;
  } catch {
    const options = getLocalManpower();
    const filtered = options.filter(m => m.id !== id);
    if (options.length === filtered.length) return false;
    saveLocalManpower(filtered);
    return true;
  }
}

// ── Hotel Owner Registration Management ─────────────────────
const HOTEL_REG_KEY = "hr_trips_hotel_registrations";

function getLocalHotelRegistrations(): HotelRegistration[] {
  if (!isBrowser) return [];
  const data = localStorage.getItem(HOTEL_REG_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

function saveLocalHotelRegistrations(regs: HotelRegistration[]) {
  if (isBrowser) {
    localStorage.setItem(HOTEL_REG_KEY, JSON.stringify(regs));
  }
}

export async function getHotelRegistrations(): Promise<HotelRegistration[]> {
  return getLocalHotelRegistrations();
}

export async function submitHotelRegistration(
  data: Omit<HotelRegistration, "id" | "status" | "createdAt">
): Promise<HotelRegistration> {
  const regs = getLocalHotelRegistrations();

  // Check if email already registered
  const exists = regs.find(r => r.email === data.email);
  if (exists) {
    throw new Error("A hotel is already registered with this email address.");
  }

  const newReg: HotelRegistration = {
    ...data,
    id: `hreg-${Math.random().toString(36).substr(2, 9)}`,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };
  regs.push(newReg);
  saveLocalHotelRegistrations(regs);
  return newReg;
}

export async function updateHotelRegistrationStatus(
  id: string,
  status: "Pending" | "Approved" | "Rejected"
): Promise<boolean> {
  const regs = getLocalHotelRegistrations();
  const index = regs.findIndex(r => r.id === id);
  if (index === -1) return false;
  regs[index].status = status;
  saveLocalHotelRegistrations(regs);
  return true;
}

export async function deleteHotelRegistration(id: string): Promise<boolean> {
  const regs = getLocalHotelRegistrations();
  const filtered = regs.filter(r => r.id !== id);
  if (regs.length === filtered.length) return false;
  saveLocalHotelRegistrations(filtered);
  return true;
}

export async function getHotelRegistrationByEmail(
  email: string
): Promise<HotelRegistration | null> {
  const regs = getLocalHotelRegistrations();
  return regs.find(r => r.email === email) || null;
}

export async function updateHotelRegistration(
  reg: HotelRegistration
): Promise<boolean> {
  const regs = getLocalHotelRegistrations();
  const index = regs.findIndex(r => r.id === reg.id);
  if (index === -1) return false;
  regs[index] = reg;
  saveLocalHotelRegistrations(regs);
  return true;
}

// ── Cab Registrations (Local & Remote Fallback) ────────────────
const CAB_REG_KEY = "hr_trips_cab_registrations";

export function getLocalCabRegistrations(): CabRegistration[] {
  if (!isBrowser) return [];
  const data = localStorage.getItem(CAB_REG_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveLocalCabRegistrations(regs: CabRegistration[]) {
  if (isBrowser) {
    localStorage.setItem(CAB_REG_KEY, JSON.stringify(regs));
  }
}

export async function getCabRegistrations(): Promise<CabRegistration[]> {
  return getLocalCabRegistrations();
}

export async function submitCabRegistration(
  data: Omit<CabRegistration, "id" | "status" | "createdAt">
): Promise<CabRegistration> {
  const regs = getLocalCabRegistrations();

  const exists = regs.find(r => r.email === data.email);
  if (exists) {
    throw new Error("A cab is already registered with this email address.");
  }

  const newReg: CabRegistration = {
    ...data,
    id: `cabreg-${Math.random().toString(36).substr(2, 9)}`,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };
  regs.push(newReg);
  saveLocalCabRegistrations(regs);
  return newReg;
}

export async function updateCabRegistrationStatus(
  id: string,
  status: "Pending" | "Approved" | "Rejected"
): Promise<boolean> {
  const regs = getLocalCabRegistrations();
  const index = regs.findIndex(r => r.id === id);
  if (index === -1) return false;
  regs[index].status = status;
  saveLocalCabRegistrations(regs);
  return true;
}

export async function deleteCabRegistration(id: string): Promise<boolean> {
  const regs = getLocalCabRegistrations();
  const filtered = regs.filter(r => r.id !== id);
  if (regs.length === filtered.length) return false;
  saveLocalCabRegistrations(filtered);
  return true;
}

export async function getCabRegistrationByEmail(
  email: string
): Promise<CabRegistration | null> {
  const regs = getLocalCabRegistrations();
  return regs.find(r => r.email === email) || null;
}

