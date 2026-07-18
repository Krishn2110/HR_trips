"use client";

import { useEffect, useState } from "react";
import { 
  Building2, MapPin, Star, Image as ImageIcon, 
  Loader2, CheckCircle2, XCircle, Mail, Phone, Calendar, Users, IndianRupee, Eye, X, DoorOpen, ShieldCheck, UserCheck 
} from "lucide-react";

interface RoomType {
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  count: number;
  image: string;
}

interface Hotel {
  id: string | number;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  location: string;
  starRating: number;
  startingPrice: number;
  image: string;
  overview: string;
  amenities: string[];
  roomTypes: RoomType[];
  roomPics: string[];
  receptionPics: string[];
  bathroomPics: string[];
  interiorExteriorPics: string[];
  createdAt: string;
}

interface HotelBooking {
  id: string | number;
  hotel_id: string | number;
  hotel_name: string;
  city: string;
  hotel_owner_name: string;
  hotel_owner_contact: string;
  hotel_manager_name: string;
  hotel_manager_phone: string;
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

// Helper to construct the full image URL safely
const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path; 
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  if (path.startsWith('/api/')) return apiUrl.replace(/\/api\/?$/, "") + path;
  return `${apiUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
};

export default function AdminHotelsPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "bookings">("catalog");
  
  // Hotel Catalog State
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingHotel, setViewingHotel] = useState<Hotel | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Bookings State
  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);
  const [bookingsSearchQuery, setBookingsSearchQuery] = useState("");

  // --- API: FETCH APPROVED HOTELS ---
  const loadHotels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/list_approved.php`, {
        cache: "no-store"
      });
      const rawText = await response.text();
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("No JSON object found in response");
      }
      const jsonText = rawText.substring(firstBrace, lastBrace + 1);
      const result = JSON.parse(jsonText);
      if (response.ok && result.status === "success") {
        setHotels(result.data);
      }
    } catch (e) {
      console.error("Failed to load hotels:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- API: FETCH ALL HOTEL BOOKINGS (BULLETPROOF) ---
  const loadBookings = async () => {
    setIsBookingsLoading(true);
    try {
      // FIX: Changed folder to /hotel-bookings/
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotel-bookings/list.php`, {
        cache: "no-store"
      });
      const rawText = await response.text();
      let result;
      try {
        result = JSON.parse(rawText);
      } catch (e) {
        console.error("API returned invalid JSON:", rawText);
        setBookings([]);
        return;
      }
      
      if (response.ok && result.status === "success") {
        setBookings(Array.isArray(result.data) ? result.data : []);
      } else {
        setBookings([]);
      }
    } catch (e) {
      console.error("Error loading hotel bookings:", e);
    } finally {
      setIsBookingsLoading(false);
    }
  };

  // --- API: UPDATE BOOKING STATUS (Check-in/Check-out) ---
  const updateBookingStatus = async (id: string | number, newStatus: string) => {
    if (!confirm(`Mark this booking as ${newStatus.replace('_', ' ')}?`)) return;
    
    try {
      // FIX: Changed folder to /hotel-bookings/
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

  // --- API: CANCEL & REFUND BOOKING ---
  const cancelAndRefundBooking = async (booking: HotelBooking) => {
    if (!confirm(`Are you sure you want to cancel this booking for ${booking.customer_name}? If payment was successful, a refund of ₹${booking.total_amount} will be initiated.`)) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotel-bookings/cancel.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: booking.id })
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        setBookings(prev => prev.map(b => b.id === booking.id ? { 
          ...b, 
          booking_status: "cancelled", 
          payment_status: b.payment_status === "successful" ? "refunded" : b.payment_status 
        } : b));
        alert("Booking cancelled successfully! Email sent to the customer.");
      } else {
        alert(result.message || "Failed to cancel and refund booking");
      }
    } catch (e) {
      alert("Error contacting the cancellation API.");
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  useEffect(() => {
    if (activeTab === "bookings") {
      loadBookings();
    }
  }, [activeTab]);

  // Filter Bookings
  const filteredBookings = bookings.filter((booking) => {
    const q = bookingsSearchQuery.toLowerCase();
    return (
      (booking.customer_name || "").toLowerCase().includes(q) ||
      (booking.customer_email || "").toLowerCase().includes(q) ||
      (booking.hotel_name || "").toLowerCase().includes(q) ||
      (booking.hotel_owner_name || "").toLowerCase().includes(q) ||
      (booking.hotel_manager_name || "").toLowerCase().includes(q) ||
      String(booking.id).includes(q)
    );
  });

  const totalRevenue = filteredBookings
    .filter((b) => b.booking_status === "confirmed" || b.booking_status === "checked_in" || b.booking_status === "checked_out")
    .reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink">
            Hotel Management
          </h1>
          <p className="text-muted text-xs mt-1">
            View active approved hotels and manage guest room bookings.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/40 gap-4 mb-6">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "catalog"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Approved Hotels Inventory
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "bookings"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Guest Bookings
        </button>
      </div>

      {activeTab === "bookings" ? (
        <div className="space-y-6">
          {/* Revenue Summary Card */}
          {!isBookingsLoading && bookings.length > 0 && (
             <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
               <div>
                 <h3 className="text-primary-dark font-bold text-sm">Total Confirmed Revenue</h3>
                 <p className="text-muted text-xs mt-1">From all successful hotel bookings.</p>
               </div>
               <div className="text-3xl font-heading font-black text-primary flex items-center">
                 <IndianRupee className="w-6 h-6 mr-1" />
                 {totalRevenue.toLocaleString("en-IN")}
               </div>
             </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by guest name, email, or hotel name..."
                value={bookingsSearchQuery}
                onChange={(e) => setBookingsSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-ink focus:border-primary outline-none shadow-sm transition-all"
              />
            </div>
          </div>

          {isBookingsLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-muted text-xs">Loading hotel bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <Calendar className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No bookings yet</h3>
              <p className="text-muted text-xs">When customers book hotel rooms, they will appear here.</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-white p-8 text-muted text-xs">
              No matching bookings found.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface border-b border-border/50 text-muted uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">ID & Date</th>
                    <th className="px-6 py-4">Guest Details</th>
                    <th className="px-6 py-4">Hotel Contacts</th>
                    <th className="px-6 py-4">Room & Stay</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-ink block">#{booking.id}</span>
                        <span className="text-[10px] text-muted">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-ink block">{booking.customer_name}</span>
                        <span className="text-xs text-muted flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3"/> {booking.customer_email}
                        </span>
                        <span className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3"/> {booking.customer_phone}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-primary block">{booking.hotel_name || "Unknown Hotel"}</span>
                        <span className="text-[10px] text-muted flex items-center gap-1 mt-1">
                          <UserCheck className="w-3 h-3 shrink-0" />
                          Owner: {booking.hotel_owner_name || "N/A"} ({booking.hotel_owner_contact || "N/A"})
                        </span>
                        <span className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                          <UserCheck className="w-3 h-3 shrink-0" />
                          Mgr: {booking.hotel_manager_name || "N/A"} ({booking.hotel_manager_phone || "N/A"})
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-ink block">
                          {booking.rooms_booked}x {booking.room_category}
                        </span>
                        <span className="text-xs text-muted flex items-center gap-1 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-primary"/> 
                          {booking.checkin_date} to {booking.checkout_date}
                        </span>
                        <span className="text-[10px] text-muted block mt-0.5">
                          {booking.adults} Adults {booking.children > 0 && `| ${booking.children} Kids`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-ink block">
                          ₹{Number(booking.total_amount || 0).toLocaleString("en-IN")}
                        </span>
                        <span className={`text-[9px] uppercase font-bold tracking-wider mt-1 block ${booking.payment_status === 'successful' ? 'text-green-600' : booking.payment_status === 'refunded' ? 'text-gray-500' : 'text-amber-600'}`}>
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          booking.booking_status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.booking_status === 'checked_in' ? 'bg-blue-100 text-blue-700' :
                          booking.booking_status === 'checked_out' ? 'bg-gray-100 text-gray-700' :
                          booking.booking_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {booking.booking_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {booking.booking_status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')} 
                              className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors cursor-pointer" 
                              title="Confirm Booking"
                            >
                              <CheckCircle2 className="w-4 h-4"/>
                            </button>
                            <button 
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')} 
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer" 
                              title="Cancel Booking"
                            >
                              <XCircle className="w-4 h-4"/>
                            </button>
                          </div>
                        )}
                        {booking.booking_status === 'confirmed' && (
                          <div className="flex flex-col items-end gap-2">
                            <button 
                              onClick={() => updateBookingStatus(booking.id, 'checked_in')} 
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer w-full text-center" 
                            >
                              Check-In
                            </button>
                            <button 
                              onClick={() => cancelAndRefundBooking(booking)} 
                              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer w-full text-center" 
                            >
                              Cancel & Refund
                            </button>
                          </div>
                        )}
                        {booking.booking_status === 'checked_in' && (
                          <button 
                            onClick={() => updateBookingStatus(booking.id, 'checked_out')} 
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer" 
                          >
                            Check-Out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
              <p className="text-muted text-xs">Loading approved hotels...</p>
            </div>
          ) : hotels.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <Building2 className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No active hotels</h3>
              <p className="text-muted text-xs max-w-xs mx-auto mt-1 mb-6">
                When a hotel partner registers and you approve them, they will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                  <div className="relative h-48 bg-surface">
                    {hotel.image ? (
                      <img src={getImageUrl(hotel.image)} alt={hotel.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted"><ImageIcon className="w-8 h-8" /></div>
                    )}
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {hotel.starRating} Star
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-muted text-[10px] uppercase font-bold tracking-wider mb-1 block">{hotel.city}, {hotel.state}</span>
                    <h3 className="font-heading font-semibold text-ink text-base mb-2 group-hover:text-primary transition-colors">{hotel.name}</h3>
                    
                    <span className="text-muted text-xs flex items-center gap-1 mb-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" /> {hotel.location}
                    </span>
                    <span className="text-muted text-xs flex items-center gap-1 mb-4">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-primary" /> {hotel.phone}
                    </span>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                      <div>
                        <span className="text-[10px] text-muted block">Starts At</span>
                        <span className="font-heading font-black text-lg text-primary">₹{hotel.startingPrice.toLocaleString("en-IN")}</span>
                      </div>
                      
                      <button 
                        onClick={() => setViewingHotel(hotel)} 
                        className="p-2 bg-surface hover:bg-blue-50 text-muted hover:text-blue-600 rounded-xl border border-border/50 transition-all cursor-pointer"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* --- HOTEL DETAIL MODAL --- */}
      {viewingHotel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-6 border-b border-border/50 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-heading font-bold text-xl text-ink">{viewingHotel.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" /> {viewingHotel.city}, {viewingHotel.state}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border"></span>
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                    {viewingHotel.starRating} <Star className="w-3 h-3 fill-amber-500" />
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingHotel(null)}
                className="p-2 hover:bg-surface rounded-xl text-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8 flex-1 overflow-y-auto">
              
              {/* Profile & Amenities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold uppercase text-muted tracking-wider mb-2">Overview</h4>
                  <p className="text-sm text-ink leading-relaxed bg-surface/50 p-4 rounded-xl border border-border/50">
                    {viewingHotel.overview || "No description provided."}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-muted tracking-wider mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingHotel.amenities?.length > 0 ? viewingHotel.amenities.map((a, i) => (
                      <span key={i} className="px-2.5 py-1 bg-surface border border-border/50 rounded-lg text-[11px] font-medium text-ink">
                        {a}
                      </span>
                    )) : <span className="text-xs text-muted">No amenities listed.</span>}
                  </div>
                </div>
              </div>

              {/* Room Categories List */}
              <div>
                <h4 className="text-xs font-bold uppercase text-muted tracking-wider mb-3 flex items-center gap-1.5">
                  <DoorOpen className="w-4 h-4 text-primary" /> Room Categories & Inventory
                </h4>
                {viewingHotel.roomTypes?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {viewingHotel.roomTypes.map((room, idx) => (
                      <div key={idx} className="border border-border/50 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col">
                        <div className="relative h-32 bg-surface">
                          {room.image ? (
                            <img src={getImageUrl(room.image)} alt={room.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted"><ImageIcon className="w-6 h-6"/></div>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h5 className="font-heading font-bold text-ink text-sm">{room.name}</h5>
                            <p className="text-[10px] text-muted line-clamp-2 mt-1">{room.description}</p>
                          </div>
                          <div className="mt-3 pt-3 border-t border-border/40 grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-muted block">Rooms</span>
                              <span className="font-bold text-ink">{room.count}</span>
                            </div>
                            <div>
                              <span className="text-muted block">Price/Night</span>
                              <span className="font-bold text-primary">₹{room.pricePerNight}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted italic bg-surface p-4 rounded-xl border border-border/50">No room categories have been configured by the owner yet.</p>
                )}
              </div>

              {/* Full Photo Gallery */}
              <div>
                <h4 className="text-xs font-bold uppercase text-muted tracking-wider mb-3 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-primary" /> Complete Photo Gallery
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {[
                    ...(viewingHotel.roomPics || []).map(url => ({ label: "Room", url })),
                    ...(viewingHotel.receptionPics || []).map(url => ({ label: "Reception", url })),
                    ...(viewingHotel.bathroomPics || []).map(url => ({ label: "Bathroom", url })),
                    ...(viewingHotel.interiorExteriorPics || []).map(url => ({ label: "Exterior", url }))
                  ].map((img, i) => (
                    <div 
                      key={i} 
                      className="relative h-24 border border-border/40 rounded-xl overflow-hidden bg-surface group cursor-pointer"
                      onClick={() => setLightboxImage(img.url)}
                    >
                      {img.url ? (
                        <img src={getImageUrl(img.url)} alt={img.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted"><ImageIcon className="w-5 h-5" /></div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-center font-semibold text-[9px] text-white uppercase tracking-wider backdrop-blur-sm">
                        {img.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- Image Lightbox --- */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={getImageUrl(lightboxImage)} 
            alt="Fullscreen Preview" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}