"use client";

import { useEffect, useState } from "react";
import type { HotelRegistration, RoomType } from "@/lib/types";
import {
  Building2, Clock, CheckCircle, XCircle, Mail, Phone, MapPin, Star,
  DoorOpen, Users, Calendar, IndianRupee, TrendingUp, Settings, Plus,
  Trash2, Edit3, LogOut, Loader2, X, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const AMENITY_OPTIONS = [
  "Free Wi-Fi", "Swimming Pool", "Gym / Fitness Center", "Restaurant",
  "Room Service", "Parking", "Air Conditioning", "Laundry Service",
  "Conference Room", "Spa & Wellness", "Bar / Lounge", "Airport Shuttle",
  "24/7 Front Desk", "Power Backup", "CCTV Security", "Elevator",
];

const ROOM_CATEGORIES = ["Standard Room", "Superior Room", "Deluxe Room", "Executive Room"];

interface HotelBooking {
  id: string | number;
  hotel_id: string | number;
  room_category: string;
  rooms_booked: number;
  adults: number;
  children: number;
  checkin_date: string;
  checkout_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  special_requests: string;
  total_amount: number | string;
  payment_status: string;
  booking_status: "pending" | "confirmed" | "cancelled" | "checked_in" | "checked_out";
  created_at: string;
}

export default function HotelOwnerDashboard() {
  const router = useRouter();
  const [registration, setRegistration] = useState<HotelRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "rooms">("overview");

  // Bookings State
  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);

  // Edit profile form state
  const [starRating, setStarRating] = useState(3);
  const [totalRooms, setTotalRooms] = useState(10);
  const [description, setDescription] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Rooms inventory form state
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);
  const [roomName, setRoomName] = useState(ROOM_CATEGORIES[0]);
  const [roomPrice, setRoomPrice] = useState(1500);
  const [roomCount, setRoomCount] = useState(1);
  const [roomMaxGuests, setRoomMaxGuests] = useState(2);
  const [roomDesc, setRoomDesc] = useState("");
  const [roomImage, setRoomImage] = useState("");

  // --- API: FETCH PROFILE DATA ---
  const fetchReg = async () => {
    const email = sessionStorage.getItem("hotelOwnerEmail");
    if (!email) {
      setIsLoading(false);
      return;
    }

    try {
      console.log("Fetching profile for email:", email);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/get_profile.php?email=${encodeURIComponent(email)}`, {
        cache: "no-store"
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        const reg = result.data;
        setRegistration(reg);
        
        setStarRating(reg.starRating || 3);
        setTotalRooms(reg.totalRooms || 10);
        setDescription(reg.description || "");
        setSelectedAmenities(reg.amenities || []);
        setRoomTypes(reg.roomTypes || []);

        console.log("Hotel Profile Loaded. Status:", reg.status, "ID:", reg.id);

        // If approved, fetch their specific bookings
        if (reg.status?.toLowerCase() === 'approved' && reg.id) {
          console.log("Triggering fetchOwnerBookings...");
          fetchOwnerBookings(reg.id);
        } else {
          console.log("Hotel is not approved or missing ID. Skipping bookings fetch.");
        }
      }
    } catch (e) {
      console.error("Failed to load hotel owner registration", e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- API: FETCH OWNER BOOKINGS (BULLETPROOF DEBUGGING) ---
  const fetchOwnerBookings = async (hotelId: string | number) => {
    if (!hotelId) return;
    
    setIsBookingsLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/hotel-bookings/owner_list.php?hotel_id=${hotelId}`;
      console.log("Fetching bookings from URL:", url);
      
      const response = await fetch(url, { cache: "no-store" });
      
      // 1. READ AS TEXT FIRST (This catches PHP Errors breaking the JSON)
      const rawText = await response.text();
      console.log("RAW RESPONSE FROM SERVER:", rawText);
      
      let result;
      try {
        // 2. ATTEMPT TO PARSE
        result = JSON.parse(rawText);
      } catch (parseError) {
        console.error("FATAL ERROR: The server did not return valid JSON. Look at the RAW RESPONSE above to fix your PHP code.");
        setBookings([]);
        setIsBookingsLoading(false);
        return;
      }

      console.log("Successfully parsed JSON:", result);

      if (response.ok && result.status === "success") {
        setBookings(Array.isArray(result.data) ? result.data : []);
      } else {
        console.error("API returned failure status:", result);
        setBookings([]);
      }
    } catch (e) {
      console.error("Network or Fetch Error:", e);
      setBookings([]);
    } finally {
      setIsBookingsLoading(false);
    }
  };

  // --- API: UPDATE BOOKING STATUS ---
  const updateBookingStatus = async (id: string | number, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this booking as ${newStatus.replace('_', ' ')}?`)) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotel-bookings/update_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, booking_status: newStatus as any } : b));
      } else {
        alert(result.message || "Failed to update booking status");
      }
    } catch (e) {
      alert("Error updating status.");
    }
  };

  useEffect(() => {
    fetchReg();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("hotelOwnerEmail");
    sessionStorage.removeItem("hotelOwnerLoggedIn");
    sessionStorage.removeItem("hotelOwnerId");
    sessionStorage.removeItem("hotelStatus");
    router.push("/hotel-owner/login");
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  // --- API: SAVE PROFILE DATA ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration) return;
    setSaveStatus("saving");

    try {
      const payload = {
        email: registration.email,
        starRating,
        totalRooms,
        description,
        amenities: selectedAmenities,
        roomTypes: roomTypes 
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/update_profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        setRegistration({ ...registration, ...payload } as any);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setSaveStatus("error");
    }
  };

  const handleOpenAddRoomModal = () => {
    setEditingRoomIndex(null);
    setRoomName(ROOM_CATEGORIES[0]);
    setRoomPrice(1500);
    setRoomCount(1);
    setRoomMaxGuests(2);
    setRoomDesc("");
    setRoomImage("");
    setIsRoomModalOpen(true);
  };

  const handleOpenEditRoomModal = (index: number) => {
    const room = roomTypes[index];
    setEditingRoomIndex(index);
    setRoomName(room.name || ROOM_CATEGORIES[0]);
    setRoomPrice(room.pricePerNight);
    setRoomCount(room.count || 1);
    setRoomMaxGuests(room.maxGuests);
    setRoomDesc(room.description);
    setRoomImage(room.image);
    setIsRoomModalOpen(true);
  };

  const handleSaveRoomType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration) return;
    
    const duplicateIndex = roomTypes.findIndex(r => r.name === roomName);
    if (duplicateIndex !== -1 && duplicateIndex !== editingRoomIndex) {
      alert(`You have already added a ${roomName}. Please edit the existing one.`);
      return;
    }
    
    const newRoom = {
      name: roomName,
      description: roomDesc,
      pricePerNight: Number(roomPrice),
      count: Number(roomCount),
      maxGuests: Number(roomMaxGuests),
      image: roomImage || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
    };

    let updatedRooms = [...roomTypes];
    if (editingRoomIndex !== null) {
      updatedRooms[editingRoomIndex] = newRoom;
    } else {
      updatedRooms.push(newRoom);
    }

    try {
      const payload = {
        email: registration.email,
        starRating,
        totalRooms,
        description,
        amenities: selectedAmenities,
        roomTypes: updatedRooms
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/update_profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setRoomTypes(updatedRooms);
        setRegistration({ ...registration, roomTypes: updatedRooms } as any);
        setIsRoomModalOpen(false);
      } else {
        alert("Failed to save room category");
      }
    } catch (err) {
      alert("Error saving room category");
    }
  };

  const handleDeleteRoomType = async (index: number) => {
    if (!registration || !confirm("Are you sure you want to delete this room category?")) return;
    const updatedRooms = roomTypes.filter((_, idx) => idx !== index);
    
    try {
      const payload = {
        email: registration.email,
        starRating,
        totalRooms,
        description,
        amenities: selectedAmenities,
        roomTypes: updatedRooms
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/update_profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setRoomTypes(updatedRooms);
        setRegistration({ ...registration, roomTypes: updatedRooms } as any);
      } else {
        alert("Failed to delete room category");
      }
    } catch (err) {
      alert("Error deleting room category");
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
        <p className="text-muted text-xs">Loading dashboard data...</p>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-border/50 shadow-sm p-8 max-w-md mx-auto">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="font-heading font-bold text-xl text-ink mb-2">No Active Session</h2>
        <p className="text-muted text-xs mb-6">Could not retrieve your hotel registration session details.</p>
        <Link href="/hotel-owner/login" className="inline-flex px-6 py-2.5 bg-primary text-white font-semibold rounded-xl text-xs hover:shadow-lg transition-all">Go to Login</Link>
      </div>
    );
  }

  const renderPendingStatus = () => (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-8 max-w-2xl mx-auto text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto animate-pulse">
        <Clock className="w-10 h-10 text-amber-500" />
      </div>
      <div>
        <h2 className="font-heading font-bold text-2xl text-ink">Registration Under Review</h2>
        <p className="text-muted text-sm mt-2 max-w-md mx-auto leading-relaxed">Thank you for registering <strong>{registration.hotelName}</strong>! Your application is currently being verified by our administrators.</p>
      </div>
      <button onClick={handleLogout} className="px-4 py-2 border border-border rounded-xl text-xs text-muted hover:text-rose-600 transition-colors">Log Out</button>
    </div>
  );

  const renderRejectedStatus = () => (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-8 max-w-2xl mx-auto text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
        <XCircle className="w-10 h-10 text-rose-500" />
      </div>
      <div>
        <h2 className="font-heading font-bold text-2xl text-ink">Application Declined</h2>
        <p className="text-muted text-sm mt-2 max-w-md mx-auto leading-relaxed">We regret to inform you that your registration application was not approved.</p>
      </div>
      <button onClick={handleLogout} className="px-6 py-2.5 border border-border rounded-xl text-xs font-semibold text-ink hover:bg-surface transition-colors">Log Out</button>
    </div>
  );

  const renderApprovedStatus = () => {
    // Dynamically calculate statistics from the real bookings data
    const totalBookings = bookings.length;
    const activeGuests = bookings.filter(b => b.booking_status === "checked_in").reduce((acc, curr) => acc + Number(curr.adults) + Number(curr.children), 0);
    const confirmedRevenue = bookings.filter(b => ["confirmed", "checked_in", "checked_out"].includes(b.booking_status)).reduce((acc, curr) => acc + Number(curr.total_amount), 0);

    const stats = [
      { label: "Total Bookings", value: totalBookings, icon: Calendar, color: "text-blue-600 bg-blue-50" },
      { label: "Active Guests", value: activeGuests, icon: Users, color: "text-emerald-600 bg-emerald-50" },
      { label: "Confirmed Revenue", value: `₹${confirmedRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-primary bg-primary-light" },
      { label: "Total Rooms Listed", value: totalRooms, icon: DoorOpen, color: "text-amber-600 bg-amber-50" },
    ];

    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div>
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Hotel Control Center</span>
            <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink mt-0.5">{registration.hotelName}</h1>
            <p className="text-muted text-xs mt-1">Owner Portal: logged in as <span className="font-semibold">{registration.ownerName}</span></p>
          </div>
          
          <button onClick={handleLogout} className="inline-flex items-center gap-1.5 px-4 py-2 border border-border bg-white rounded-xl text-xs font-semibold text-muted hover:text-rose-600 hover:border-rose-100 cursor-pointer transition-colors self-start">
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>

        <div className="flex border-b border-border/50 gap-6">
          {[
            { id: "overview", label: "Overview & Orders", icon: TrendingUp },
            { id: "profile", label: "Hotel Profile Setup", icon: Settings },
            { id: "rooms", label: "Room Categories & Pricing", icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 font-bold text-xs flex items-center gap-2 border-b-2 cursor-pointer transition-all ${isActive ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW AND ORDERS */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">{s.label}</span>
                      <span className="font-heading font-black text-xl text-ink block">{s.value}</span>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              <h3 className="font-heading font-bold text-ink text-base">All Guest Bookings</h3>
              <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden p-5">
                {isBookingsLoading ? (
                   <div className="py-10 text-center text-muted text-xs flex flex-col items-center"><Loader2 className="w-6 h-6 animate-spin mb-2"/> Loading bookings...</div>
                ) : bookings.length === 0 ? (
                   <div className="py-10 text-center text-muted text-xs">No bookings found for your hotel yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/50 text-[10px] uppercase font-bold text-muted bg-surface/30">
                          <th className="py-3 px-4">Booking ID</th>
                          <th className="py-3 px-4">Guest Details</th>
                          <th className="py-3 px-4">Room & Dates</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 text-xs">
                        {bookings.map((b) => (
                          <tr key={b.id} className="hover:bg-surface/20 transition-colors">
                            <td className="py-4 px-4 font-bold text-ink">#{b.id}</td>
                            <td className="py-4 px-4 font-semibold text-ink">
                              {b.customer_name}
                              <span className="block text-[10px] text-muted font-normal mt-0.5">{b.customer_phone}</span>
                            </td>
                            <td className="py-4 px-4 text-ink font-medium">
                              {b.rooms_booked}x {b.room_category}
                              <span className="block text-[10px] text-muted font-normal mt-0.5">
                                {b.checkin_date} to {b.checkout_date}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-bold text-ink">₹{Number(b.total_amount).toLocaleString("en-IN")}</td>
                            <td className="py-4 px-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${
                                b.booking_status === "checked_in" ? "bg-blue-50 text-blue-700 border-blue-200/50" : 
                                b.booking_status === "confirmed" ? "bg-emerald-50 text-emerald-700 border-emerald-200/50" : 
                                b.booking_status === "cancelled" ? "bg-red-50 text-red-700 border-red-200/50" :
                                "bg-gray-50 text-gray-700 border-gray-200/50"
                              }`}>
                                {b.booking_status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              {b.booking_status === 'pending' && (
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => updateBookingStatus(b.id, 'confirmed')} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors cursor-pointer" title="Confirm Booking"><CheckCircle2 className="w-4 h-4"/></button>
                                  <button onClick={() => updateBookingStatus(b.id, 'cancelled')} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer" title="Cancel Booking"><XCircle className="w-4 h-4"/></button>
                                </div>
                              )}
                              {b.booking_status === 'confirmed' && (
                                <button onClick={() => updateBookingStatus(b.id, 'checked_in')} className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer">Check-In</button>
                              )}
                              {b.booking_status === 'checked_in' && (
                                <button onClick={() => updateBookingStatus(b.id, 'checked_out')} className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer">Check-Out</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EDIT PROFILE */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 max-w-3xl animate-fadeIn">
            <div className="border-b border-border/40 pb-4 mb-6">
              <h3 className="font-heading font-bold text-ink text-base">Configure Hotel Details</h3>
              <p className="text-muted text-xs mt-1">Set up search filters, public description, and operational features.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">Hotel Star Rating *</label>
                  <select
                    value={starRating}
                    onChange={(e) => setStarRating(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none cursor-pointer"
                  >
                    <option value={1}>1 Star Category</option>
                    <option value={2}>2 Star Category</option>
                    <option value={3}>3 Star Category</option>
                    <option value={4}>4 Star Category</option>
                    <option value={5}>5 Star Category</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">Total Rooms Available *</label>
                  <input
                    type="number"
                    min={1}
                    value={totalRooms}
                    onChange={(e) => setTotalRooms(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-muted mb-1.5">Hotel Public Description *</label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a description of your hotel, local tourist attractions, and key features..."
                    className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none resize-none"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-muted mb-2 block">Choose Offered Amenities</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {AMENITY_OPTIONS.map((amenity) => {
                      const isSelected = selectedAmenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`px-3 py-2.5 rounded-xl text-[11px] font-medium border transition-all cursor-pointer text-left ${
                            isSelected
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-surface border-border text-muted hover:border-primary/20 hover:text-ink"
                          }`}
                        >
                          {amenity}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {saveStatus === "saved" && (
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Hotel profile updated successfully!
                </div>
              )}
              {saveStatus === "error" && (
                <div className="bg-rose-50 text-rose-700 p-3 rounded-xl border border-rose-100 text-xs font-semibold">
                  Failed to update profile. Please try again.
                </div>
              )}

              <button
                type="submit"
                disabled={saveStatus === "saving"}
                className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer hover:shadow-lg transition-all"
              >
                {saveStatus === "saving" ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...</> : "Save Hotel Profile"}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: ROOM INVENTORY */}
        {activeTab === "rooms" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4 mb-6">
                <div>
                  <h3 className="font-heading font-bold text-ink text-base">Room Inventory & Rates</h3>
                  <p className="text-muted text-xs mt-1">Add deluxe rooms, suites, and define rates visible on the booking pages.</p>
                </div>
                <button onClick={handleOpenAddRoomModal} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-ink hover:bg-ink-light text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer self-start">
                  <Plus className="w-4 h-4" /> Add Room Category
                </button>
              </div>

              {roomTypes.length === 0 ? (
                <div className="py-16 text-center text-muted border border-dashed border-border rounded-2xl flex flex-col items-center justify-center">
                  <Building2 className="w-10 h-10 text-muted opacity-40 mb-3" />
                  <p className="text-xs font-semibold">No room categories listed yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roomTypes.map((room, idx) => (
                    <div key={idx} className="border border-border/50 rounded-2xl overflow-hidden shadow-sm bg-white flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-1/3 h-32 sm:h-auto bg-surface">
                        <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-heading font-bold text-ink text-sm">{room.name}</h4>
                            <div className="flex gap-1 shrink-0">
                              <button onClick={() => handleOpenEditRoomModal(idx)} className="p-1 hover:bg-surface text-muted hover:text-ink rounded transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDeleteRoomType(idx)} className="p-1 hover:bg-rose-50 text-muted hover:text-rose-600 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 mb-2">
                            <span className="text-[10px] text-muted font-medium bg-surface px-2 py-0.5 rounded-md">Total Inventory: <span className="text-ink font-bold">{room.count || 1} Rooms</span></span>
                          </div>
                          <p className="text-[10px] text-muted max-w-sm line-clamp-2">{room.description}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-border/30 pt-3 mt-4 text-[11px]">
                          <span className="text-muted font-medium">Max Guests: <span className="text-ink font-bold">{room.maxGuests} Pax</span></span>
                          <span className="font-heading font-black text-primary text-sm">₹{room.pricePerNight} <span className="text-[9px] text-muted font-normal">/ night</span></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Room Add/Edit Modal */}
            {isRoomModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
                  <div className="border-b border-border/50 px-6 py-4 flex items-center justify-between">
                    <h3 className="font-heading font-bold text-ink text-base">{editingRoomIndex !== null ? "Edit Room Category" : "Add Room Category"}</h3>
                    <button onClick={() => setIsRoomModalOpen(false)} className="p-1.5 hover:bg-surface rounded-lg cursor-pointer transition-colors"><X className="w-4 h-4" /></button>
                  </div>

                  <form onSubmit={handleSaveRoomType} className="p-6 space-y-4 text-xs">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Category Name *</label>
                      <select value={roomName} onChange={(e) => setRoomName(e.target.value)} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none cursor-pointer" required>
                        {ROOM_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1.5">Price Per Night (₹) *</label>
                        <input type="number" min={100} value={roomPrice} onChange={(e) => setRoomPrice(Number(e.target.value))} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none" required />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1.5">Number of Rooms *</label>
                        <input type="number" min={1} value={roomCount} onChange={(e) => setRoomCount(Number(e.target.value))} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1.5">Max Guests Cap *</label>
                        <input type="number" min={1} max={10} value={roomMaxGuests} onChange={(e) => setRoomMaxGuests(Number(e.target.value))} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none" required />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-muted mb-1.5">Room Category Image URL</label>
                        <input type="url" value={roomImage} onChange={(e) => setRoomImage(e.target.value)} placeholder="https://images.unsplash.com/photo-..." className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Features & Description *</label>
                      <textarea rows={3} value={roomDesc} onChange={(e) => setRoomDesc(e.target.value)} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none resize-none" required />
                    </div>

                    <div className="flex gap-3 pt-3">
                      <button type="button" onClick={() => setIsRoomModalOpen(false)} className="flex-1 py-3 border border-border rounded-xl text-xs font-bold text-ink hover:bg-surface cursor-pointer transition-colors">Cancel</button>
                      <button type="submit" className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition-colors">Save Category</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  switch (registration.status.toLowerCase()) {
    case "pending": return renderPendingStatus();
    case "rejected": return renderRejectedStatus();
    case "approved": return renderApprovedStatus();
    default: return renderPendingStatus();
  }
}