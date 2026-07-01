import type {
  Package,
  Hotel,
  HotelSearchParams,
  EnquiryPayload,
  BookingPayload,
  ContactPayload,
  PackageBookingPayload,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// ── Generic fetch wrapper ───────────────────────────────────
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch {
    // In development, fall back to mock data
    console.warn(`API call to ${url} failed, using mock data`);
    throw new Error(`Failed to fetch from ${endpoint}`);
  }
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
const INITIAL_BOOKINGS: any[] = [];

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
    return await apiFetch<Package[]>("/api/packages");
  } catch {
    return getLocalPackages();
  }
}

export async function getPackageBySlug(
  slug: string
): Promise<Package | undefined> {
  try {
    return await apiFetch<Package>(`/api/packages/${slug}`);
  } catch {
    return getLocalPackages().find((p) => p.slug === slug);
  }
}

// Admin CRUD functions
export async function createOrUpdatePackage(pkg: Omit<Package, "id" | "slug"> & { id?: string }): Promise<Package> {
  try {
    if (pkg.id) {
      return await apiFetch<Package>(`/api/admin/packages/${pkg.id}`, {
        method: "PUT",
        body: JSON.stringify(pkg),
      });
    } else {
      return await apiFetch<Package>("/api/admin/packages", {
        method: "POST",
        body: JSON.stringify(pkg),
      });
    }
  } catch {
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
    const res = await apiFetch<{ success: boolean }>(`/api/admin/packages/${id}`, {
      method: "DELETE",
    });
    return res.success;
  } catch {
    const packages = getLocalPackages();
    const filtered = packages.filter(p => p.id !== id);
    if (packages.length === filtered.length) return false;
    saveLocalPackages(filtered);
    return true;
  }
}

// ── Hotels ──────────────────────────────────────────────────
export async function getHotels(
  params?: HotelSearchParams
): Promise<Hotel[]> {
  try {
    const query = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    return await apiFetch<Hotel[]>(`/api/hotels${query}`);
  } catch {
    return MOCK_HOTELS;
  }
}

export async function getHotelBySlug(
  slug: string
): Promise<Hotel | undefined> {
  try {
    return await apiFetch<Hotel>(`/api/hotels/${slug}`);
  } catch {
    return MOCK_HOTELS.find((h) => h.slug === slug);
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
  try {
    return await apiFetch<any[]>("/api/admin/bookings");
  } catch {
    return getLocalBookings();
  }
}

export async function createAdminBooking(booking: any): Promise<any> {
  try {
    return await apiFetch<any>("/api/admin/bookings", {
      method: "POST",
      body: JSON.stringify(booking),
    });
  } catch {
    const bookings = getLocalBookings();
    bookings.push(booking);
    saveLocalBookings(bookings);
    return booking;
  }
}

export async function deleteAdminBooking(id: string): Promise<boolean> {
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/admin/bookings/${id}`, {
      method: "DELETE",
    });
    return res.success;
  } catch {
    const bookings = getLocalBookings();
    const filtered = bookings.filter((b) => b.id !== id);
    if (bookings.length === filtered.length) return false;
    saveLocalBookings(filtered);
    return true;
  }
}

export async function updateBookingStatus(id: string, status: string): Promise<boolean> {
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/admin/bookings/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
    return res.success;
  } catch {
    const bookings = getLocalBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) return false;
    bookings[index].status = status;
    saveLocalBookings(bookings);
    return true;
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
