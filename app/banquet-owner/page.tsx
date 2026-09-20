"use client";

import { useEffect, useState, useRef } from "react";
import {
  GlassWater,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building2,
  FileText,
  AlertTriangle,
  IndianRupee,
  Calendar,
  Eye,
  LogOut,
  RefreshCw,
  X,
  Users,
  TrendingUp,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  Check,
  UploadCloud,
  Image as ImageIcon,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BANQUET_AMENITIES_OPTIONS = [
  "Air Conditioned Hall",
  "Stage Decoration",
  "Parking Space",
  "Valet Parking",
  "DJ Sound System",
  "Power Backup / Generator",
  "CCTV Security",
  "Fire Safety Compliance",
  "In-House Catering",
  "Bridal Dressing Room",
  "Elevator / Lift",
  "Rooms for Stay",
  "Mandap Setup",
  "Wi-Fi",
  "Bar Setup"
];

const HALL_CATEGORIES = [
  "Main AC Celebration Hall",
  "Open Marriage Lawn / Garden",
  "Dining & Buffet Area",
  "Corporate Conference Hall",
  "Rooftop Party Space"
];

interface BanquetBooking {
  id: string | number;
  banquet_id: string | number;
  banquet_name: string;
  city?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_type: string;
  event_date: string;
  guest_count: number;
  food_preference: string;
  special_requests?: string;
  total_amount: number | string;
  payment_status: string;
  booking_status: "pending" | "confirmed" | "cancelled";
  created_at: string;
}

// Image URL helper
const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost/hr/api";
  apiUrl = apiUrl.replace(/\/$/, "");
  if (path.startsWith('/api') && apiUrl.endsWith('/api')) {
    apiUrl = apiUrl.substring(0, apiUrl.length - 4);
  }
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${apiUrl}${safePath}`;
};

export default function BanquetOwnerDashboardPage() {
  const router = useRouter();

  const [banquet, setBanquet] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "halls">("overview");

  // Bookings State
  const [bookings, setBookings] = useState<BanquetBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Edit Profile State
  const [capacity, setCapacity] = useState(500);
  const [pricePerPlateVeg, setPricePerPlateVeg] = useState(800);
  const [pricePerPlateNonVeg, setPricePerPlateNonVeg] = useState(1000);
  const [description, setDescription] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Halls / Event Spaces Form State
  const [halls, setHalls] = useState<any[]>([]);
  const [isHallModalOpen, setIsHallModalOpen] = useState(false);
  const [isSavingHall, setIsSavingHall] = useState(false);
  const [editingHallIndex, setEditingHallIndex] = useState<number | null>(null);
  const [hallName, setHallName] = useState(HALL_CATEGORIES[0]);
  const [hallCapacity, setHallCapacity] = useState(300);
  const [hallPrice, setHallPrice] = useState(50000);
  const [hallDesc, setHallDesc] = useState("");
  const [hallImage, setHallImage] = useState("");
  const [hallImageFile, setHallImageFile] = useState<File | null>(null);
  const [hallImagePreview, setHallImagePreview] = useState<string | null>(null);

  // Lightbox
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // --- API: FETCH BANQUET PROFILE ---
  const loadProfile = async () => {
    setIsLoading(true);
    const email = sessionStorage.getItem("banquetOwnerEmail");
    if (!email) {
      router.push("/banquet-owner/login");
      return;
    }

    let foundBanquet: any = null;

    // 1. Try dedicated profile endpoint
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}banquets/get_profile.php?email=${encodeURIComponent(email)}`,
        { cache: "no-store" }
      );
      const rawText = await res.text();
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        const json = JSON.parse(match[0]);
        if (res.ok && json.status === "success" && json.data) {
          foundBanquet = json.data;
        }
      }
    } catch {
      // fallback
    }

    // 2. If not found, fetch from catalog
    if (!foundBanquet) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}banquets/get_catalog.php`, {
          cache: "no-store",
        });
        const rawText = await res.text();
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          const json = JSON.parse(match[0]);
          if (res.ok && json.status === "success" && Array.isArray(json.data)) {
            const matchBq = json.data.find(
              (b: any) => (b.email || "").toLowerCase() === email.toLowerCase()
            );
            if (matchBq) foundBanquet = matchBq;
          }
        }
      } catch {
        // fallback
      }
    }

    // 3. Fallback to local storage
    if (!foundBanquet) {
      const localData = localStorage.getItem("hr_trips_banquet_registrations");
      if (localData) {
        const regs = JSON.parse(localData);
        const match = regs.find((r: any) => r.email === email);
        if (match) foundBanquet = match;
      }
    }

    if (foundBanquet) {
      setBanquet(foundBanquet);
      setCapacity(Number(foundBanquet.capacity || 500));
      setPricePerPlateVeg(Number(foundBanquet.price_per_plate_veg ?? foundBanquet.pricePerPlateVeg ?? 800));
      setPricePerPlateNonVeg(Number(foundBanquet.price_per_plate_non_veg ?? foundBanquet.pricePerPlateNonVeg ?? 1000));
      setDescription(foundBanquet.description || "");

      let parsedAmenities: string[] = [];
      if (Array.isArray(foundBanquet.amenities)) {
        parsedAmenities = foundBanquet.amenities;
      } else if (typeof foundBanquet.amenities === "string") {
        try {
          parsedAmenities = JSON.parse(foundBanquet.amenities);
        } catch {
          parsedAmenities = foundBanquet.amenities.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
      }
      setSelectedAmenities(parsedAmenities);

      if (foundBanquet.halls && Array.isArray(foundBanquet.halls)) {
        setHalls(foundBanquet.halls);
      }

      loadBookings(foundBanquet.id, foundBanquet.name);
    }

    setIsLoading(false);
  };

  // --- API: FETCH BOOKINGS ---
  const loadBookings = async (banquetId?: string | number, banquetName?: string) => {
    setIsLoadingBookings(true);
    const email = sessionStorage.getItem("banquetOwnerEmail") || "";

    let foundBookings: BanquetBooking[] = [];
    try {
      const url = banquetId
        ? `${process.env.NEXT_PUBLIC_API_URL}banquet-bookings/owner_list.php?banquet_id=${banquetId}`
        : `${process.env.NEXT_PUBLIC_API_URL}banquet-bookings/list.php`;

      const res = await fetch(url, { cache: "no-store" });
      const rawText = await res.text();
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        const json = JSON.parse(match[0]);
        if (res.ok && json.status === "success" && Array.isArray(json.data)) {
          // If fetched from list.php, filter for this banquet
          if (banquetId || banquetName) {
            foundBookings = json.data.filter(
              (b: any) =>
                (banquetId && String(b.banquet_id) === String(banquetId)) ||
                (banquetName && (b.banquet_name || "").toLowerCase() === banquetName.toLowerCase())
            );
          } else {
            foundBookings = json.data;
          }
        }
      }
    } catch {
      // fallback
    }

    // Local fallback
    if (foundBookings.length === 0) {
      const localData = localStorage.getItem("hr_trips_banquet_bookings");
      if (localData) {
        const allLocal: BanquetBooking[] = JSON.parse(localData);
        if (banquetId || banquetName) {
          foundBookings = allLocal.filter(
            (b) =>
              (banquetId && String(b.banquet_id) === String(banquetId)) ||
              (banquetName && (b.banquet_name || "").toLowerCase() === banquetName.toLowerCase())
          );
        } else {
          foundBookings = allLocal;
        }
      }
    }

    setBookings(foundBookings);
    setIsLoadingBookings(false);
  };

  // --- API: UPDATE BOOKING STATUS ---
  const updateBookingStatus = async (id: string | number, newStatus: "pending" | "confirmed" | "cancelled") => {
    if (!confirm(`Are you sure you want to mark this booking as ${newStatus.toUpperCase()}?`)) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}banquet-bookings/update_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      setBookings((prev) =>
        prev.map((b) => (String(b.id) === String(id) ? { ...b, booking_status: newStatus } : b))
      );
    } catch {
      alert("Failed to update booking status");
    }
  };

  // --- API: SAVE PROFILE ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banquet) return;
    setSaveStatus("saving");

    try {
      const formData = new FormData();
      if (banquet.id) formData.append("id", String(banquet.id));
      formData.append("email", banquet.email);
      formData.append("capacity", String(capacity));
      formData.append("price_per_plate_veg", String(pricePerPlateVeg));
      formData.append("price_per_plate_non_veg", String(pricePerPlateNonVeg));
      formData.append("description", description);
      formData.append("amenities", JSON.stringify(selectedAmenities));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}banquets/save.php`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setBanquet({
          ...banquet,
          capacity,
          price_per_plate_veg: pricePerPlateVeg,
          price_per_plate_non_veg: pricePerPlateNonVeg,
          description,
          amenities: selectedAmenities,
        });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        throw new Error("Failed to save profile");
      }
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  // --- HALLS / SPACES HANDLERS ---
  const handleOpenAddHallModal = () => {
    setEditingHallIndex(null);
    setHallName(HALL_CATEGORIES[0]);
    setHallCapacity(300);
    setHallPrice(50000);
    setHallDesc("");
    setHallImage("");
    setHallImageFile(null);
    setHallImagePreview(null);
    setIsHallModalOpen(true);
  };

  const handleOpenEditHallModal = (idx: number) => {
    const item = halls[idx];
    setEditingHallIndex(idx);
    setHallName(item.name || HALL_CATEGORIES[0]);
    setHallCapacity(item.capacity || 300);
    setHallPrice(item.price || 50000);
    setHallDesc(item.description || "");
    setHallImage(item.image || "");
    setHallImageFile(null);
    setHallImagePreview(item.image ? getImageUrl(item.image) : null);
    setIsHallModalOpen(true);
  };

  const handleSaveHall = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHall(true);

    const newHall = {
      name: hallName,
      capacity: Number(hallCapacity),
      price: Number(hallPrice),
      description: hallDesc,
      image: hallImage || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
    };

    let updatedHalls = [...halls];
    if (editingHallIndex !== null) {
      updatedHalls[editingHallIndex] = newHall;
    } else {
      updatedHalls.push(newHall);
    }

    setHalls(updatedHalls);
    setIsHallModalOpen(false);
    setIsSavingHall(false);
  };

  const handleDeleteHall = (idx: number) => {
    if (!confirm("Remove this event space/hall?")) return;
    setHalls(halls.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-3" />
        <p className="text-muted text-xs font-medium">Loading Banquet Owner Dashboard...</p>
      </div>
    );
  }

  if (!banquet) {
    return (
      <div className="bg-white rounded-3xl border border-border/50 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="font-heading font-bold text-xl text-ink">No Registered Banquet Found</h2>
        <p className="text-muted text-xs leading-relaxed">
          We couldn't find a banquet venue associated with your email credentials. Please register your banquet hall with HR Trips.
        </p>
        <Link
          href="/banquet-registration"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs transition-colors"
        >
          Register Banquet Venue Now
        </Link>
      </div>
    );
  }

  const isApproved =
    banquet.status?.toLowerCase() === "approved" || Number(banquet.is_approved) === 1;
  const isRejected = banquet.status?.toLowerCase() === "rejected";

  const totalConfirmedRevenue = bookings
    .filter((b) => b.booking_status === "confirmed")
    .reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);

  const activeBookingsCount = bookings.filter((b) => b.booking_status === "confirmed").length;

  return (
    <div className="space-y-8">
      {/* STATUS BANNER */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border shadow-sm relative overflow-hidden ${
          isApproved
            ? "bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white border-emerald-500/20"
            : isRejected
            ? "bg-gradient-to-br from-rose-950 via-slate-900 to-rose-950 text-white border-rose-500/20"
            : "bg-gradient-to-br from-amber-950 via-slate-900 to-amber-950 text-white border-amber-500/20"
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-xs border border-white/10">
              {isApproved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Verified & Approved Partner</span>
                </>
              ) : isRejected ? (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span className="text-rose-400">Registration Declined</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400">Under Admin Verification Review</span>
                </>
              )}
            </div>

            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
              {banquet.name || banquet.banquetName}
            </h1>
            <p className="text-white/75 text-xs sm:text-sm leading-relaxed">
              {isApproved
                ? "Your banquet hall is live on HR Trips. You can manage guest event bookings, adjust per-plate menu pricing, and configure celebration spaces."
                : isRejected
                ? "Your banquet registration was declined during admin compliance verification. Please check your GST, NOC documents or reach out to support."
                : "Your registration documents, GST, Fire Safety NOC, and inspection photos are being reviewed by HR Trips Admin. You will receive customer event reservations once approved."}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-right shrink-0">
            <span className="text-[10px] text-white/60 uppercase font-bold block">Location</span>
            <span className="text-sm font-bold text-white block mt-0.5">
              {banquet.city}, {banquet.state}
            </span>
            <span className="text-[11px] text-white/70 block mt-0.5">PIN: {banquet.pincode}</span>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-border/40 gap-6">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Overview & Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "profile"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <Settings className="w-4 h-4" /> Venue Profile & Amenities
        </button>
        <button
          onClick={() => setActiveTab("halls")}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "halls"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <Building2 className="w-4 h-4" /> Halls & Event Spaces ({halls.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & BOOKINGS */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* STATS METRIC CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm">
              <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">
                Total Bookings
              </span>
              <div className="font-heading font-black text-2xl text-ink mt-1">
                {bookings.length}
              </div>
              <span className="text-[11px] text-muted mt-0.5 block">Lifetime event requests</span>
            </div>

            <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm">
              <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">
                Confirmed Revenue
              </span>
              <div className="font-heading font-black text-2xl text-primary mt-1 flex items-center">
                <IndianRupee className="w-5 h-5" />
                {totalConfirmedRevenue.toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-emerald-600 mt-0.5 font-semibold block">
                From confirmed events
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm">
              <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">
                Active Bookings
              </span>
              <div className="font-heading font-black text-2xl text-emerald-700 mt-1">
                {activeBookingsCount}
              </div>
              <span className="text-[11px] text-muted mt-0.5 block">Upcoming celebrations</span>
            </div>

            <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm">
              <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">
                Max Capacity
              </span>
              <div className="font-heading font-black text-2xl text-ink mt-1 flex items-center gap-1">
                <Users className="w-5 h-5 text-primary" />
                {capacity}
              </div>
              <span className="text-[11px] text-muted mt-0.5 block">Guest seating capacity</span>
            </div>
          </div>

          {/* VENUE SUMMARY & INSPECTION PHOTOS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-border/50 p-6 shadow-sm space-y-4">
              <h3 className="font-heading font-bold text-ink text-base border-b border-border/40 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Registered Details & Compliance
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-surface rounded-xl">
                  <span className="text-muted block text-[10px] uppercase font-bold">Owner Name</span>
                  <span className="font-bold text-ink mt-0.5 block">{banquet.owner_name || banquet.ownerName}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl">
                  <span className="text-muted block text-[10px] uppercase font-bold">Owner Phone</span>
                  <span className="font-bold text-ink mt-0.5 block">{banquet.owner_phone || banquet.ownerContact}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl">
                  <span className="text-muted block text-[10px] uppercase font-bold">Manager</span>
                  <span className="font-bold text-ink mt-0.5 block">{banquet.property_manager_name || banquet.propertyManagerName || "N/A"}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl">
                  <span className="text-muted block text-[10px] uppercase font-bold">GST Number</span>
                  <span className="font-mono font-bold text-ink mt-0.5 block">{banquet.gst || "N/A"}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl">
                  <span className="text-muted block text-[10px] uppercase font-bold">Fire Safety NOC</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">{banquet.fire_safety_noc || banquet.fireSafetyNoc || "Yes"}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl">
                  <span className="text-muted block text-[10px] uppercase font-bold">CCTV Setup</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">{banquet.cctv_camera || banquet.cctvCamera || "Available"}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border/50 p-6 shadow-sm space-y-3">
              <h3 className="font-heading font-bold text-ink text-base border-b border-border/40 pb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" /> Settlement Bank
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-surface rounded-xl">
                  <span className="text-muted text-[10px] uppercase font-bold block">Bank Name</span>
                  <span className="font-bold text-ink">{banquet.bank_name || banquet.bankName || "State Bank of India"}</span>
                </div>
                <div className="p-2.5 bg-surface rounded-xl">
                  <span className="text-muted text-[10px] uppercase font-bold block">Account Number</span>
                  <span className="font-mono font-bold text-ink">{banquet.account_number || banquet.accountNo || "••••••••"}</span>
                </div>
                <div className="p-2.5 bg-surface rounded-xl">
                  <span className="text-muted text-[10px] uppercase font-bold block">IFSC Code</span>
                  <span className="font-mono font-bold text-ink">{banquet.ifsc_code || banquet.ifscCode || "••••"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* LIVE BOOKINGS TABLE */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-ink text-base">Guest Event Bookings</h3>
                <p className="text-muted text-xs mt-0.5">Manage customer wedding and reception reservations.</p>
              </div>
              <button
                onClick={() => loadBookings(banquet.id, banquet.name)}
                disabled={isLoadingBookings}
                className="px-3.5 py-1.5 bg-surface hover:bg-border/40 border border-border rounded-xl text-xs font-semibold text-ink flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBookings ? "animate-spin" : ""}`} /> Refresh
              </button>
            </div>

            {isLoadingBookings ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                <p className="text-muted text-xs">Loading event reservations...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-20 text-center p-8 space-y-2">
                <Calendar className="w-10 h-10 text-muted/50 mx-auto" />
                <h4 className="font-heading font-bold text-ink text-base">No Event Bookings Yet</h4>
                <p className="text-muted text-xs max-w-sm mx-auto">
                  When customers reserve {banquet.name} from the public booking page, their requests will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-surface border-b border-border/50 text-muted uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Booking ID & Client</th>
                      <th className="px-6 py-4">Event Details</th>
                      <th className="px-6 py-4">Event Date</th>
                      <th className="px-6 py-4">Est. Amount</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-surface/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-ink block">#{b.id} — {b.customer_name}</span>
                          <span className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-primary" /> {b.customer_phone}
                          </span>
                          <span className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-primary" /> {b.customer_email}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-primary block">{b.event_type}</span>
                          <span className="text-[11px] text-muted block mt-0.5">
                            {b.guest_count} Guests • {b.food_preference}
                          </span>
                          {b.special_requests && (
                            <span className="text-[10px] text-muted italic block truncate max-w-[200px]">
                              Req: {b.special_requests}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-ink flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-primary" /> {b.event_date}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-ink">
                            ₹{Number(b.total_amount).toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <select
                            value={b.booking_status}
                            onChange={(e) => updateBookingStatus(b.id, e.target.value as any)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
                              b.booking_status === "confirmed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : b.booking_status === "cancelled"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PROFILE & AMENITIES SETTINGS */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-3xl border border-border/50 p-6 sm:p-8 shadow-sm space-y-6 max-w-4xl">
          <div className="border-b border-border/40 pb-4">
            <h3 className="font-heading font-bold text-xl text-ink">Edit Venue Profile & Pricing</h3>
            <p className="text-muted text-xs mt-1">
              Update seating capacity, catering plate rates, overview description, and available amenities.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-muted mb-1.5">
                  Guest Seating Capacity *
                </label>
                <input
                  type="number"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted mb-1.5">
                  Veg Catering Rate (₹ / plate) *
                </label>
                <input
                  type="number"
                  required
                  value={pricePerPlateVeg}
                  onChange={(e) => setPricePerPlateVeg(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted mb-1.5">
                  Non-Veg Catering Rate (₹ / plate) *
                </label>
                <input
                  type="number"
                  required
                  value={pricePerPlateNonVeg}
                  onChange={(e) => setPricePerPlateNonVeg(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-muted mb-1.5">
                Venue Description & Highlights *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your banquet halls, stage lighting, mandap, catering options..."
                className="w-full px-4 py-3 bg-surface rounded-xl border border-border focus:border-primary outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Amenities Checklist */}
            <div>
              <label className="block font-semibold text-muted mb-2">
                Venue Amenities & Facilities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {BANQUET_AMENITIES_OPTIONS.map((item) => {
                  const checked = selectedAmenities.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAmenity(item)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        checked
                          ? "bg-primary/5 border-primary text-primary font-bold"
                          : "bg-surface border-border/50 text-muted hover:text-ink"
                      }`}
                    >
                      <span className="text-xs">{item}</span>
                      {checked && <Check className="w-4 h-4 text-primary shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 flex items-center justify-between">
              {saveStatus === "saved" && (
                <span className="text-emerald-600 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-rose-600 font-bold text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Failed to save profile updates.
                </span>
              )}
              {saveStatus === "idle" && <div />}

              <button
                type="submit"
                disabled={saveStatus === "saving"}
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-primary/20 transition-all disabled:opacity-70"
              >
                {saveStatus === "saving" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Save Profile Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: HALLS & CELEBRATION SPACES */}
      {activeTab === "halls" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-xl text-ink">Celebration Spaces & Halls</h3>
              <p className="text-muted text-xs mt-0.5">
                Configure your individual banquet halls, lawns, and dining zones.
              </p>
            </div>
            <button
              onClick={handleOpenAddHallModal}
              className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-primary/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Event Space
            </button>
          </div>

          {halls.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-border p-8 space-y-3">
              <Building2 className="w-12 h-12 text-muted/50 mx-auto" />
              <h4 className="font-heading font-bold text-ink text-base">No Specific Halls Configured</h4>
              <p className="text-muted text-xs max-w-sm mx-auto">
                Add celebration zones like Main AC Hall, Marriage Lawn, or Dining Area with capacity and starting rental rates.
              </p>
              <button
                onClick={handleOpenAddHallModal}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add First Hall
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {halls.map((h, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="h-44 bg-surface relative">
                    <img
                      src={getImageUrl(h.image)}
                      alt={h.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-full text-xs font-bold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-primary" /> {h.capacity} Guests
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-ink text-base mb-1">{h.name}</h4>
                      {h.description && (
                        <p className="text-muted text-xs line-clamp-2 mb-3">{h.description}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border/40 flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[10px] text-muted uppercase font-bold block">Rate</span>
                        <span className="font-heading font-bold text-ink text-base flex items-center">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {Number(h.price).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditHallModal(i)}
                          className="p-2 hover:bg-surface text-ink rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteHall(i)}
                          className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT HALL MODAL */}
      {isHallModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-heading font-bold text-lg text-ink">
                {editingHallIndex !== null ? "Edit Celebration Space" : "Add Celebration Space"}
              </h3>
              <button
                onClick={() => setIsHallModalOpen(false)}
                className="p-1.5 hover:bg-surface rounded-xl text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHall} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-muted mb-1.5">Space Name *</label>
                <input
                  type="text"
                  required
                  value={hallName}
                  onChange={(e) => setHallName(e.target.value)}
                  placeholder="e.g. Grand AC Hall"
                  className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-muted mb-1.5">Guest Capacity *</label>
                  <input
                    type="number"
                    required
                    value={hallCapacity}
                    onChange={(e) => setHallCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-muted mb-1.5">Starting Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    value={hallPrice}
                    onChange={(e) => setHallPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-muted mb-1.5">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={hallDesc}
                  onChange={(e) => setHallDesc(e.target.value)}
                  placeholder="Hall dimensions, AC facilities, stage setup..."
                  className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted mb-1.5">Image URL</label>
                <input
                  type="text"
                  value={hallImage}
                  onChange={(e) => setHallImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none"
                />
              </div>

              <div className="pt-3 border-t border-border/40 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsHallModalOpen(false)}
                  className="px-4 py-2 border border-border text-ink rounded-xl font-semibold hover:bg-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingHall}
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-md shadow-primary/20 cursor-pointer"
                >
                  Save Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-3xl w-full p-4 space-y-3 relative shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-bold text-xs text-ink">Inspection Photo Preview</span>
              <button
                onClick={() => setLightboxImg(null)}
                className="p-1 hover:bg-surface rounded-lg text-muted hover:text-ink cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-black/5 rounded-xl">
              <img
                src={lightboxImg}
                alt="Preview"
                className="max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
