"use client";

import { useEffect, useState } from "react";
import {
  GlassWater,
  MapPin,
  Star,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Users,
  IndianRupee,
  Eye,
  X,
  ShieldCheck,
  UserCheck,
  Trash2,
  RefreshCw,
  FileText,
  Search,
  CreditCard,
  Plus,
  Edit2,
  Save
} from "lucide-react";
import {
  getBanquets,
  createOrUpdateBanquet,
  deleteBanquet,
  getBanquetRegistrations,
  updateBanquetRegistrationStatus as updateLocalBanquetRegStatus,
  deleteBanquetRegistration as deleteLocalBanquetReg,
  getBanquetBookings,
  updateBanquetBookingStatus as updateLocalBanquetBookingStatus
} from "@/lib/api";
import type { Banquet, BanquetRegistration, BanquetBooking } from "@/lib/types";

// Helper for image URLs
const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path; 
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  if (path.startsWith('/api/')) return apiUrl.replace(/\/api\/?$/, "") + path;
  return `${apiUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
};

export default function AdminBanquetsPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "registrations" | "bookings">("catalog");

  // Approved Banquets Catalog State
  const [banquets, setBanquets] = useState<Banquet[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentBq, setCurrentBq] = useState<Partial<Banquet> | null>(null);
  const [catalogErrors, setCatalogErrors] = useState<Record<string, string>>({});

  // Owner Registrations State
  const [registrations, setRegistrations] = useState<BanquetRegistration[]>([]);
  const [isLoadingRegs, setIsLoadingRegs] = useState(false);
  const [viewingReg, setViewingReg] = useState<BanquetRegistration | null>(null);
  const [regSearchQuery, setRegSearchQuery] = useState("");

  // Lightbox State
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Bookings State
  const [bookings, setBookings] = useState<BanquetBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingsSearchQuery, setBookingsSearchQuery] = useState("");

  // --- API: LOAD APPROVED CATALOG ---
  const loadBanquetsCatalog = async () => {
    setIsLoadingCatalog(true);
    try {
      const data = await getBanquets();
      setBanquets(data);
    } catch (e) {
      console.error("Failed to load banquets catalog", e);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  // --- API: LOAD OWNER REGISTRATIONS ---
  const loadRegistrations = async () => {
    setIsLoadingRegs(true);
    try {
      let remoteSuccess = false;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banquets/list.php`, {
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
        const localData = await getBanquetRegistrations();
        setRegistrations(localData || []);
      }
    } catch (e) {
      console.error("Error loading banquet registrations", e);
    } finally {
      setIsLoadingRegs(false);
    }
  };

  // --- API: UPDATE REGISTRATION STATUS ---
  const updateRegistrationStatus = async (
    id: string,
    newStatus: "Pending" | "Approved" | "Rejected"
  ) => {
    if (!confirm(`Are you sure you want to mark this banquet registration as ${newStatus.toUpperCase()}?`)) return;

    try {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banquets/update_status.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: newStatus })
        });
      } catch {
        // ignore
      }

      await updateLocalBanquetRegStatus(id, newStatus);

      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );

      if (viewingReg && viewingReg.id === id) {
        setViewingReg({ ...viewingReg, status: newStatus });
      }
    } catch {
      alert("Failed to update registration status");
    }
  };

  // --- API: DELETE REGISTRATION ---
  const deleteRegistration = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banquet registration request?")) return;

    try {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banquets/delete.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
        });
      } catch {
        // ignore
      }

      await deleteLocalBanquetReg(id);
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      if (viewingReg?.id === id) setViewingReg(null);
    } catch {
      alert("Failed to delete registration");
    }
  };

  // --- API: LOAD MASTER BOOKINGS ---
  const loadBookings = async () => {
    setIsLoadingBookings(true);
    try {
      let remoteSuccess = false;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banquet-bookings/list.php`, {
          cache: "no-store"
        });
        const rawText = await response.text();
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          const jsonText = rawText.substring(firstBrace, lastBrace + 1);
          const result = JSON.parse(jsonText);
          if (response.ok && result.status === "success") {
            setBookings(result.data || []);
            remoteSuccess = true;
          }
        }
      } catch {
        // ignore
      }

      if (!remoteSuccess) {
        const localData = await getBanquetBookings();
        setBookings(localData || []);
      }
    } catch (e) {
      console.error("Error loading banquet bookings", e);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // --- API: UPDATE BOOKING STATUS ---
  const updateBookingStatus = async (id: string | number, newStatus: "pending" | "confirmed" | "cancelled") => {
    if (!confirm(`Are you sure you want to mark this booking as ${newStatus.toUpperCase()}?`)) return;

    try {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banquet-bookings/update_status.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: newStatus })
        });
      } catch {
        // ignore
      }

      await updateLocalBanquetBookingStatus(id, newStatus);
      setBookings(prev => prev.map(b => String(b.id) === String(id) ? { ...b, booking_status: newStatus } : b));
    } catch (e) {
      alert("Failed to update booking status");
    }
  };

  useEffect(() => {
    loadBanquetsCatalog();
    loadRegistrations();
  }, []);

  useEffect(() => {
    if (activeTab === "bookings") {
      loadBookings();
    } else if (activeTab === "registrations") {
      loadRegistrations();
    }
  }, [activeTab]);

  // Form Handlers for Catalog Edit
  const openAddModal = () => {
    setCurrentBq({
      name: "",
      location: "",
      capacity: 500,
      pricePerPlateVeg: 800,
      pricePerPlateNonVeg: 1000,
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&q=90",
      description: "",
      amenities: ["AC Hall", "Decor", "Parking"],
      featured: false,
    });
    setCatalogErrors({});
    setModalOpen(true);
  };

  const openEditModal = (bq: Banquet) => {
    setCurrentBq(bq);
    setCatalogErrors({});
    setModalOpen(true);
  };

  const handleDeleteCatalog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banquet hall?")) return;
    try {
      const success = await deleteBanquet(id);
      if (success) {
        setBanquets(prev => prev.filter(b => b.id !== id));
      }
    } catch (e) {
      alert("Failed to delete banquet hall");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let targetValue: any = value;
    if (type === "checkbox") {
      targetValue = (e.target as HTMLInputElement).checked;
    } else if (name === "pricePerPlateVeg" || name === "pricePerPlateNonVeg" || name === "capacity") {
      targetValue = value ? Number(value) : 0;
    }
    setCurrentBq(prev => prev ? { ...prev, [name]: targetValue } : null);
  };

  const validateCatalogForm = () => {
    const errs: Record<string, string> = {};
    if (!currentBq?.name?.trim()) errs.name = "Banquet name is required";
    if (!currentBq?.location?.trim()) errs.location = "Location is required";
    if (!currentBq?.capacity || currentBq.capacity <= 0) errs.capacity = "Seating capacity is required";
    if (!currentBq?.pricePerPlateVeg || currentBq.pricePerPlateVeg <= 0) errs.pricePerPlateVeg = "Veg plate rate is required";
    if (!currentBq?.description?.trim() || currentBq.description.length < 15) errs.description = "Description must be at least 15 chars";
    setCatalogErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCatalogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCatalogForm()) return;
    try {
      const saved = await createOrUpdateBanquet(currentBq as any);
      if (saved) {
        loadBanquetsCatalog();
        setModalOpen(false);
      }
    } catch (e) {
      alert("Failed to save banquet hall");
    }
  };

  // Filter Bookings & Registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const q = regSearchQuery.toLowerCase();
    return (
      (reg.banquetName || "").toLowerCase().includes(q) ||
      (reg.ownerName || "").toLowerCase().includes(q) ||
      (reg.email || "").toLowerCase().includes(q) ||
      (reg.city || "").toLowerCase().includes(q) ||
      (reg.ownerContact || "").includes(q)
    );
  });

  const filteredBookings = bookings.filter((b) => {
    const q = bookingsSearchQuery.toLowerCase();
    return (
      (b.customer_name || "").toLowerCase().includes(q) ||
      (b.customer_email || "").toLowerCase().includes(q) ||
      (b.banquet_name || "").toLowerCase().includes(q) ||
      (b.event_type || "").toLowerCase().includes(q) ||
      String(b.id).includes(q)
    );
  });

  const totalRevenue = filteredBookings
    .filter((b) => b.booking_status === "confirmed")
    .reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink">
            Banquet Management
          </h1>
          <p className="text-muted text-xs mt-1">
            Manage approved banquet halls, venue registration requests, and event bookings.
          </p>
        </div>
        {activeTab === "catalog" && (
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add New Banquet Hall
          </button>
        )}
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-border/40 gap-6 mb-6">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "catalog"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Approved Banquets Inventory ({banquets.length})
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
          Master Banquet Bookings ({bookings.length})
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
                placeholder="Search by banquet, owner, email, city..."
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
              <p className="text-muted text-xs">Loading banquet owner registration requests...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <GlassWater className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No Registration Requests</h3>
              <p className="text-muted text-xs mt-1">When banquet hall owners submit registration forms, they will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface border-b border-border/50 text-muted uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Banquet Hall Name</th>
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
                        <span className="font-bold text-ink block">{reg.banquetName}</span>
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
                        <span className="text-xs text-muted block truncate max-w-[200px]">{reg.address}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-semibold text-ink block">GST: {reg.gst}</span>
                        <span className="text-[11px] font-mono text-muted block">Reg: {reg.banquetRegistrationNumber}</span>
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
                              title="Accept & Approve Banquet"
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

      {/* TAB 2: MASTER BOOKINGS */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          {!isLoadingBookings && bookings.length > 0 && (
             <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
               <div>
                 <h3 className="text-primary-dark font-bold text-sm">Total Confirmed Revenue</h3>
                 <p className="text-muted text-xs mt-1">From all confirmed banquet event bookings.</p>
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
                placeholder="Search by customer name, email, or banquet..."
                value={bookingsSearchQuery}
                onChange={(e) => setBookingsSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-white rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
              />
            </div>
            <button
              onClick={loadBookings}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-border/40 border border-border text-ink font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBookings ? "animate-spin" : ""}`} /> Refresh Bookings
            </button>
          </div>

          {isLoadingBookings ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-muted text-xs">Loading banquet bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <GlassWater className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No Event Bookings Found</h3>
              <p className="text-muted text-xs mt-1">When customers book banquet halls, their reservations will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface border-b border-border/50 text-muted uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Booking ID & Customer</th>
                    <th className="px-6 py-4">Banquet Venue</th>
                    <th className="px-6 py-4">Event & Guests</th>
                    <th className="px-6 py-4 text-center">Status</th>
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
                        <span className="font-bold text-primary block">{b.banquet_name}</span>
                        <span className="text-xs text-muted block mt-0.5">{b.city}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-ink block">{b.event_type}</span>
                        <span className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-primary" /> {b.event_date} ({b.guest_count} Guests)
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={b.booking_status}
                          onChange={(e) => updateBookingStatus(b.id, e.target.value as any)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
                            b.booking_status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            b.booking_status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {b.booking_status !== "cancelled" && (
                          <button
                            onClick={() => updateBookingStatus(b.id, "cancelled")}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Cancel Booking
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

      {/* TAB 3: APPROVED BANQUETS CATALOG */}
      {activeTab === "catalog" && (
        <>
          {isLoadingCatalog ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-muted text-xs">Loading banquet halls catalog...</p>
            </div>
          ) : banquets.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <GlassWater className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No Banquets in Catalog</h3>
              <p className="text-muted text-xs mt-1">Add a new banquet hall or approve pending registrations to populate the inventory.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banquets.map((bq) => (
                <div key={bq.id} className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="relative h-48 bg-surface">
                    <img 
                      src={getImageUrl(bq.image) || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80"} 
                      alt={bq.name}
                      className="w-full h-full object-cover"
                    />
                    {bq.featured && (
                      <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-heading font-bold text-ink text-lg">{bq.name}</h3>
                      <p className="text-xs text-muted flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        {bq.location}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                      <div>
                        <span className="text-[10px] text-muted uppercase font-bold block">Capacity</span>
                        <span className="font-bold text-ink flex items-center gap-1 mt-0.5">
                          <Users className="w-3.5 h-3.5 text-primary" /> {bq.capacity} Guests
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted uppercase font-bold block">Veg Plate</span>
                        <span className="font-bold text-ink mt-0.5 block">₹{bq.pricePerPlateVeg} / plate</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/40 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(bq)}
                        className="px-3 py-1.5 bg-surface hover:bg-border/40 text-ink rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCatalog(bq.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* CATALOG ADD / EDIT MODAL */}
      {modalOpen && currentBq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-heading font-bold text-xl text-ink">
                {currentBq.id ? "Edit Banquet Hall" : "Add New Banquet Hall"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-surface rounded-xl text-muted hover:text-ink cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCatalogSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-muted mb-1">Banquet Name *</label>
                <input
                  type="text"
                  name="name"
                  value={currentBq.name || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. Royal Palace Banquet"
                  className="w-full px-4 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none"
                />
                {catalogErrors.name && <p className="text-rose-500 text-[10px] mt-0.5">{catalogErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-muted mb-1">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={currentBq.location || ""}
                    onChange={handleInputChange}
                    placeholder="e.g. Boring Road, Patna"
                    className="w-full px-4 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none"
                  />
                  {catalogErrors.location && <p className="text-rose-500 text-[10px] mt-0.5">{catalogErrors.location}</p>}
                </div>
                <div>
                  <label className="block font-semibold text-muted mb-1">Seating Capacity *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={currentBq.capacity || 0}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-muted mb-1">Veg Plate Rate (₹) *</label>
                  <input
                    type="number"
                    name="pricePerPlateVeg"
                    value={currentBq.pricePerPlateVeg || 0}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-muted mb-1">Non-Veg Plate Rate (₹)</label>
                  <input
                    type="number"
                    name="pricePerPlateNonVeg"
                    value={currentBq.pricePerPlateNonVeg || 0}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-muted mb-1">Cover Image URL *</label>
                <input
                  type="text"
                  name="image"
                  value={currentBq.image || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted mb-1">Description *</label>
                <textarea
                  name="description"
                  rows={3}
                  value={currentBq.description || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none resize-none"
                />
                {catalogErrors.description && <p className="text-rose-500 text-[10px] mt-0.5">{catalogErrors.description}</p>}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={currentBq.featured || false}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer"
                />
                <label htmlFor="featured" className="font-semibold text-ink cursor-pointer">
                  Feature this Banquet Hall on homepage
                </label>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-border text-ink rounded-xl font-semibold hover:bg-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold cursor-pointer shadow-lg shadow-primary/20 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Banquet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRATION DETAILS MODAL DRAWER */}
      {viewingReg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 relative">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-heading font-bold text-xl text-ink">{viewingReg.banquetName}</h2>
                <p className="text-muted text-xs mt-1">Submitted on {new Date(viewingReg.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setViewingReg(null)} className="p-2 hover:bg-surface rounded-xl text-muted hover:text-ink cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions Bar */}
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
                  <CheckCircle2 className="w-4 h-4" /> Approve Banquet
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
                <p><strong className="text-ink">Registration No:</strong> {viewingReg.banquetRegistrationNumber}</p>
                <p><strong className="text-ink">Fire Safety NOC:</strong> {viewingReg.fireSafetyNoc}</p>
                <p><strong className="text-ink">CCTV Camera Config:</strong> {viewingReg.cctvCamera}</p>
              </div>

              <div className="bg-surface/50 border border-border/60 rounded-2xl p-5 space-y-2 col-span-1 md:col-span-2">
                <h3 className="font-bold text-ink text-sm border-b border-border/40 pb-2 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-primary" /> Payout Bank Details
                </h3>
                <p><strong className="text-ink">Bank Name:</strong> {viewingReg.bankName}</p>
                <p><strong className="text-ink">Account Holder:</strong> {viewingReg.accountHolderName}</p>
                <p><strong className="text-ink">Account No:</strong> {viewingReg.accountNo}</p>
                <p><strong className="text-ink">IFSC Code:</strong> {viewingReg.ifscCode}</p>
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="font-bold text-ink text-sm">Inspection Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { title: "Hall Photo", pics: viewingReg.hallPics || (viewingReg.hallPic ? [viewingReg.hallPic] : []) },
                  { title: "Reception Photo", pics: viewingReg.receptionPics || (viewingReg.receptionPic ? [viewingReg.receptionPic] : []) },
                  { title: "Bathroom Photo", pics: viewingReg.bathroomPics || (viewingReg.bathroomPic ? [viewingReg.bathroomPic] : []) },
                  { title: "Interior/Exterior", pics: viewingReg.interiorExteriorPics || (viewingReg.interiorExteriorPic ? [viewingReg.interiorExteriorPic] : []) },
                ].map((cat, idx) => (
                  <div key={idx} className="border border-border/60 rounded-xl p-3 bg-surface/40 space-y-2">
                    <span className="text-[11px] font-bold text-ink block">{cat.title}</span>
                    {cat.pics && cat.pics.length > 0 ? (
                      <div
                        onClick={() => setLightboxImg(getImageUrl(cat.pics[0]))}
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

      {/* LIGHTBOX MODAL */}
      {lightboxImg && (
        <div onClick={() => setLightboxImg(null)} className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-3xl w-full p-4 space-y-3 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-bold text-xs text-ink">Inspection Photo Preview</span>
              <button onClick={() => setLightboxImg(null)} className="p-1 hover:bg-surface rounded-lg text-muted hover:text-ink cursor-pointer">
                ✕
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-black/5 rounded-xl">
              <img src={lightboxImg} alt="Inspection Photo" className="max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
