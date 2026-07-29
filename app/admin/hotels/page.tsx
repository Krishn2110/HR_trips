"use client";

import { useEffect, useState } from "react";
import { 
  Building2, MapPin, Star, Image as ImageIcon, 
  Loader2, CheckCircle2, XCircle, Mail, Phone, Calendar, Users, IndianRupee, Eye, X, DoorOpen, ShieldCheck, UserCheck, Trash2, RefreshCw, FileText, Search, CreditCard
} from "lucide-react";
import { getHotelRegistrations, updateHotelRegistrationStatus as updateLocalHotelRegStatus, deleteHotelRegistration as deleteLocalHotelReg } from "@/lib/api";
import { Hotel, HotelRegistration } from "@/lib/types";

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

// Helper to construct full image URL
const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path; 
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  if (path.startsWith('/api/')) return apiUrl.replace(/\/api\/?$/, "") + path;
  return `${apiUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
};

export default function AdminHotelsPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "registrations" | "bookings">("catalog");
  
  // Hotel Catalog State
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingHotel, setViewingHotel] = useState<Hotel | null>(null);

  // Hotel Owner Registrations State
  const [registrations, setRegistrations] = useState<HotelRegistration[]>([]);
  const [isLoadingRegs, setIsLoadingRegs] = useState(false);
  const [viewingReg, setViewingReg] = useState<HotelRegistration | null>(null);
  const [regSearchQuery, setRegSearchQuery] = useState("");

  // Lightbox
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
      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonText = rawText.substring(firstBrace, lastBrace + 1);
        const result = JSON.parse(jsonText);
        if (response.ok && result.status === "success") {
          setHotels(result.data || []);
        }
      }
    } catch (e) {
      console.error("Failed to load hotels:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- API: FETCH HOTEL OWNER REGISTRATIONS ---
  const loadRegistrations = async () => {
    setIsLoadingRegs(true);
    try {
      let remoteSuccess = false;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/list.php`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store"
        });
        const rawText = await response.text();
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          const jsonText = rawText.substring(firstBrace, lastBrace + 1);
          const result = JSON.parse(jsonText);
          if (response.ok && result.status === "success") {
            setRegistrations(result.data || []);
            remoteSuccess = true;
          }
        }
      } catch {
        // ignore
      }

      if (!remoteSuccess) {
        const localData = await getHotelRegistrations();
        setRegistrations(localData || []);
      }
    } catch (e) {
      console.error("Error loading hotel registrations", e);
    } finally {
      setIsLoadingRegs(false);
    }
  };

  // --- API: UPDATE REGISTRATION STATUS ---
  const updateRegistrationStatus = async (
    id: string,
    newStatus: "Pending" | "Approved" | "Rejected"
  ) => {
    if (!confirm(`Are you sure you want to mark this hotel registration as ${newStatus.toUpperCase()}?`)) return;

    try {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/update_status.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: newStatus })
        });
      } catch {
        // ignore
      }

      await updateLocalHotelRegStatus(id, newStatus);

      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );

      if (viewingReg && viewingReg.id === id) {
        setViewingReg({ ...viewingReg, status: newStatus });
      }
    } catch {
      alert("Failed to update status");
    }
  };

  // --- API: DELETE REGISTRATION ---
  const deleteRegistration = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hotel registration request?")) return;

    try {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/delete.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
        });
      } catch {
        // ignore
      }

      await deleteLocalHotelReg(id);
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      if (viewingReg?.id === id) setViewingReg(null);
    } catch {
      alert("Failed to delete registration");
    }
  };

  // --- API: FETCH ALL HOTEL BOOKINGS ---
  const loadBookings = async () => {
    setIsBookingsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotel-bookings/list.php`, {
        cache: "no-store"
      });
      const rawText = await response.text();
      let result;
      try {
        result = JSON.parse(rawText);
      } catch (e) {
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

  // --- API: UPDATE BOOKING STATUS ---
  const updateBookingStatus = async (id: string | number, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) return;
    
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
        alert("Booking cancelled successfully!");
      } else {
        alert(result.message || "Failed to cancel booking");
      }
    } catch (e) {
      alert("Error contacting cancellation API.");
    }
  };

  useEffect(() => {
    loadHotels();
    loadRegistrations();
  }, []);

  useEffect(() => {
    if (activeTab === "bookings") {
      loadBookings();
    } else if (activeTab === "registrations") {
      loadRegistrations();
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

  // Filter Registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const q = regSearchQuery.toLowerCase();
    return (
      (reg.hotelName || "").toLowerCase().includes(q) ||
      (reg.ownerName || "").toLowerCase().includes(q) ||
      (reg.email || "").toLowerCase().includes(q) ||
      (reg.city || "").toLowerCase().includes(q) ||
      (reg.ownerContact || "").includes(q)
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
            Manage hotel partner registration requests, approved catalog, and guest bookings.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/40 gap-6 mb-6">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "catalog"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Approved Hotels Inventory ({hotels.length})
        </button>
        <button
          onClick={() => setActiveTab("registrations")}
          className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "registrations"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Owner Registration Requests ({registrations.length})
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "bookings"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Guest Bookings ({bookings.length})
        </button>
      </div>

      {/* TAB 1: OWNER REGISTRATION REQUESTS */}
      {activeTab === "registrations" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border/50 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search by hotel, owner, email, city..."
                value={regSearchQuery}
                onChange={(e) => setRegSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
              />
            </div>
            <button
              onClick={loadRegistrations}
              disabled={isLoadingRegs}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-border/40 border border-border text-ink font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRegs ? "animate-spin" : ""}`} /> Refresh Registrations
            </button>
          </div>

          {isLoadingRegs ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-muted text-xs">Loading hotel owner registration requests...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <Building2 className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No Registration Requests</h3>
              <p className="text-muted text-xs mt-1">When hotel owners submit registration forms, they will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface border-b border-border/50 text-muted uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Hotel Name</th>
                    <th className="px-6 py-4">Owner & Contact</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">GST / Reg No</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-ink block">{reg.hotelName}</span>
                        <span className="text-[10px] text-muted block mt-0.5">
                          Submitted: {new Date(reg.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-ink block">{reg.ownerName}</span>
                        <span className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-primary" /> {reg.ownerContact}
                        </span>
                        <span className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-primary" /> {reg.email}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-ink block">{reg.city}, {reg.state}</span>
                        <span className="text-xs text-muted block truncate max-w-[200px]">{reg.hotelAddress}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-semibold text-ink block">GST: {reg.gst}</span>
                        <span className="text-[11px] font-mono text-muted block">Reg: {reg.hotelRegistrationNumber}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          reg.status?.toLowerCase() === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          reg.status?.toLowerCase() === 'rejected' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {reg.status?.toLowerCase() !== 'approved' && (
                            <button
                              onClick={() => updateRegistrationStatus(reg.id, "Approved")}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              title="Accept & Approve Hotel"
                            >
                              Accept
                            </button>
                          )}
                          {reg.status?.toLowerCase() !== 'rejected' && (
                            <button
                              onClick={() => updateRegistrationStatus(reg.id, "Rejected")}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              title="Reject Registration"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => setViewingReg(reg)}
                            className="px-2.5 py-1 bg-surface hover:bg-blue-50 text-ink hover:text-blue-600 border border-border rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                          <button
                            onClick={() => deleteRegistration(reg.id)}
                            className="p-1 text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GUEST BOOKINGS */}
      {activeTab === "bookings" && (
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
                className="w-full px-4 py-2.5 bg-white rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
              />
            </div>
            <button
              onClick={loadBookings}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-border/40 border border-border text-ink font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBookingsLoading ? "animate-spin" : ""}`} /> Refresh Bookings
            </button>
          </div>

          {isBookingsLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-muted text-xs">Loading guest bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <Building2 className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No Guest Bookings Found</h3>
              <p className="text-muted text-xs mt-1">When users book hotel stays, their reservations will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface border-b border-border/50 text-muted uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Booking ID & Customer</th>
                    <th className="px-6 py-4">Hotel Details</th>
                    <th className="px-6 py-4">Dates & Category</th>
                    <th className="px-6 py-4">Amount & Payment</th>
                    <th className="px-6 py-4 text-center">Booking Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-ink block">#{b.id} - {b.customer_name}</span>
                        <span className="text-xs text-muted flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3 text-primary" /> {b.customer_email}</span>
                        <span className="text-xs text-muted flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3 text-primary" /> {b.customer_phone}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-primary block">{b.hotel_name}</span>
                        <span className="text-xs text-muted block mt-0.5">{b.city}</span>
                        <span className="text-[11px] text-muted block mt-0.5">Owner: {b.hotel_owner_name} ({b.hotel_owner_contact})</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-ink block">{b.room_category} ({b.rooms_booked} room)</span>
                        <span className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-primary" /> {b.checkin_date} to {b.checkout_date}
                        </span>
                        <span className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3 text-primary" /> {b.adults} Adults, {b.children} Children
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-heading font-bold text-ink block text-base">₹{Number(b.total_amount).toLocaleString("en-IN")}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded inline-block mt-1 ${
                          b.payment_status === 'successful' ? 'bg-emerald-100 text-emerald-800' :
                          b.payment_status === 'refunded' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {b.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={b.booking_status}
                          onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
                            b.booking_status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            b.booking_status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            b.booking_status === 'checked_in' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            b.booking_status === 'checked_out' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="checked_in">Checked In</option>
                          <option value="checked_out">Checked Out</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {b.booking_status !== "cancelled" && (
                          <button
                            onClick={() => cancelAndRefundBooking(b)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Cancel & Refund
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
      )}

      {/* TAB 3: APPROVED HOTELS INVENTORY */}
      {activeTab === "catalog" && (
        <>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-muted text-xs">Loading approved hotels...</p>
            </div>
          ) : hotels.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <Building2 className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No Approved Hotels Yet</h3>
              <p className="text-muted text-xs mt-1">Once hotel registrations are approved, they will appear here in the inventory.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="relative h-44 bg-surface">
                    <img 
                      src={getImageUrl(hotel.image) || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"} 
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-ink flex items-center gap-1 shadow-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {hotel.starRating} Star
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-heading font-bold text-ink text-lg">{hotel.name}</h3>
                      <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        {hotel.city}, {hotel.state}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/40 space-y-1.5 text-xs text-muted">
                      <p className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-ink font-medium">Owner:</span> {hotel.ownerName}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                        {hotel.phone}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted uppercase font-bold block">Room Categories</span>
                        <span className="text-xs font-bold text-ink">{hotel.roomTypes?.length || 0} Categories Added</span>
                      </div>
                      <button
                        onClick={() => setViewingHotel(hotel)}
                        className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Full Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* REGISTRATION DETAILS MODAL DRAWER */}
      {viewingReg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 relative">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-heading font-bold text-xl text-ink">{viewingReg.hotelName}</h2>
                <p className="text-muted text-xs mt-1">Submitted on {new Date(viewingReg.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setViewingReg(null)} className="p-2 hover:bg-surface rounded-xl text-muted hover:text-ink cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted">Status:</span>
                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                  viewingReg.status?.toLowerCase() === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  viewingReg.status?.toLowerCase() === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {viewingReg.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateRegistrationStatus(viewingReg.id, "Approved")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve Hotel
                </button>
                <button
                  onClick={() => updateRegistrationStatus(viewingReg.id, "Rejected")}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" /> Reject Request
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="bg-surface/50 border border-border/60 rounded-2xl p-5 space-y-2">
                <h3 className="font-bold text-ink text-sm border-b border-border/40 pb-2 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-primary" /> Owner & Management
                </h3>
                <p><strong className="text-ink">Owner:</strong> {viewingReg.ownerName} ({viewingReg.ownerContact})</p>
                <p><strong className="text-ink">Property Manager:</strong> {viewingReg.propertyManagerName} ({viewingReg.propertyManagerPhone})</p>
                <p><strong className="text-ink">Email ID:</strong> {viewingReg.email}</p>
              </div>

              <div className="bg-surface/50 border border-border/60 rounded-2xl p-5 space-y-2">
                <h3 className="font-bold text-ink text-sm border-b border-border/40 pb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Registration & Compliance
                </h3>
                <p><strong className="text-ink">GST Number:</strong> {viewingReg.gst}</p>
                <p><strong className="text-ink">Registration No:</strong> {viewingReg.hotelRegistrationNumber}</p>
                <p><strong className="text-ink">Fire Safety NOC:</strong> {viewingReg.fireSafetyNoc}</p>
                <p><strong className="text-ink">CCTV Camera Config:</strong> {viewingReg.cctvCamera}</p>
              </div>

              <div className="bg-surface/50 border border-border/60 rounded-2xl p-5 space-y-2 col-span-1 md:col-span-2">
                <h3 className="font-bold text-ink text-sm border-b border-border/40 pb-2 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-primary" /> Settlement Bank Details
                </h3>
                <pre className="font-sans text-xs text-ink whitespace-pre-wrap leading-relaxed">{viewingReg.bankDetails}</pre>
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="font-bold text-ink text-sm">Property Inspection Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { title: "Room Photo", pics: viewingReg.roomPics || (viewingReg.roomPic ? [viewingReg.roomPic] : []) },
                  { title: "Reception Photo", pics: viewingReg.receptionPics || (viewingReg.receptionPic ? [viewingReg.receptionPic] : []) },
                  { title: "Bathroom Photo", pics: viewingReg.bathroomPics || (viewingReg.bathroomPic ? [viewingReg.bathroomPic] : []) },
                  { title: "Interior/Exterior", pics: viewingReg.interiorExteriorPics || (viewingReg.interiorExteriorPic ? [viewingReg.interiorExteriorPic] : []) },
                ].map((cat, idx) => (
                  <div key={idx} className="border border-border/60 rounded-xl p-3 bg-surface/40 space-y-2">
                    <span className="text-[11px] font-bold text-ink block">{cat.title}</span>
                    {cat.pics && cat.pics.length > 0 ? (
                      <div
                        onClick={() => setLightboxImage(getImageUrl(cat.pics[0]))}
                        className="relative group h-28 rounded-lg overflow-hidden border border-border bg-black/5 cursor-pointer"
                      >
                        <img src={getImageUrl(cat.pics[0])} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </div>
                      </div>
                    ) : (
                      <div className="h-28 rounded-lg border border-dashed border-border flex items-center justify-center text-muted text-[11px]">
                        No photo
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPROVED HOTEL FULL DETAILS MODAL */}
      {viewingHotel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 relative">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-heading font-bold text-2xl text-ink">{viewingHotel.name}</h2>
                <p className="text-muted text-xs flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {viewingHotel.city}, {viewingHotel.state}
                </p>
              </div>
              <button onClick={() => setViewingHotel(null)} className="p-2 hover:bg-surface rounded-xl text-muted hover:text-ink cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <div className="h-52 rounded-2xl overflow-hidden border border-border">
                  <img src={getImageUrl(viewingHotel.image)} alt={viewingHotel.name} className="w-full h-full object-cover" />
                </div>
                <div className="bg-surface/50 p-4 rounded-xl space-y-1.5 border border-border/40">
                  <p><strong className="text-ink">Owner:</strong> {viewingHotel.ownerName}</p>
                  <p><strong className="text-ink">Email:</strong> {viewingHotel.email}</p>
                  <p><strong className="text-ink">Phone:</strong> {viewingHotel.phone}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-ink text-sm mb-1">Overview</h3>
                  <p className="text-muted leading-relaxed">{viewingHotel.overview || "No overview specified."}</p>
                </div>

                <div>
                  <h3 className="font-bold text-ink text-sm mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingHotel.amenities?.map((amenity, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-surface border border-border rounded-lg text-[11px] font-semibold text-ink">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-ink text-sm mb-2">Room Categories ({viewingHotel.roomTypes?.length || 0})</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {viewingHotel.roomTypes?.map((room, idx) => (
                      <div key={idx} className="p-3 bg-surface border border-border/60 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-ink text-xs">{room.name}</p>
                          <p className="text-[11px] text-muted">{room.count} Rooms • Max {room.maxGuests} Guests</p>
                        </div>
                        <span className="font-bold text-primary text-xs">₹{room.pricePerNight} / night</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <div onClick={() => setLightboxImage(null)} className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-3xl w-full p-4 space-y-3 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-bold text-xs text-ink">Inspection Photo Preview</span>
              <button onClick={() => setLightboxImage(null)} className="p-1 hover:bg-surface rounded-lg text-muted hover:text-ink cursor-pointer">
                ✕
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-black/5 rounded-xl">
              <img src={lightboxImage} alt="Inspection Photo" className="max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}