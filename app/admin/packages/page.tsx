"use client";

import { useEffect, useState } from "react";
import type { Package } from "@/lib/types";
import { 
  Plus, Edit2, Trash2, MapPin, Clock, X, Image as ImageIcon, Save, CheckSquare, 
  Palmtree, Loader2, CheckCircle2, XCircle, Mail, Phone, Calendar, Users 
} from "lucide-react";
import Image from "next/image";

interface BookingRequest {
  id: string | number;
  package_id: string | number;
  package_title: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  travel_date: string;
  adults: number;
  children: number;
  special_requests: string;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPkg, setCurrentPkg] = useState<Partial<Package> | null>(null);
  const [activeTab, setActiveTab] = useState<"catalog" | "bookings">("catalog");
  const [isSaving, setIsSaving] = useState(false);
  
  // Bookings State
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);
  const [bookingsSearchQuery, setBookingsSearchQuery] = useState("");

  // Custom lists state inside form
  const [highlightInput, setHighlightInput] = useState("");
  const [highlightsList, setHighlightsList] = useState<string[]>([]);
  const [placeInput, setPlaceInput] = useState("");
  const [placesList, setPlacesList] = useState<string[]>([]);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filtered package bookings
  const filteredBookings = bookings.filter((booking) => {
    const q = bookingsSearchQuery.toLowerCase();
    return (
      (booking.customer_name || "").toLowerCase().includes(q) ||
      (booking.customer_email || "").toLowerCase().includes(q) ||
      (booking.customer_phone || "").toLowerCase().includes(q) ||
      (booking.package_title || "").toLowerCase().includes(q) ||
      String(booking.id).includes(q)
    );
  });

  // --- API: FETCH ALL PACKAGES ---
  const loadPackages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/list.php`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store"
      });
      const result = await response.json();
      if (response.ok && result.status === "success") {
        setPackages(result.data);
      }
    } catch (e) {
      console.error("Failed to load packages:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- API: FETCH ALL BOOKINGS ---
  const loadBookings = async () => {
    setIsBookingsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/list.php`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store"
      });
      const result = await response.json();
      if (response.ok && result.status === "success") {
        setBookings(result.data);
      }
    } catch (e) {
      console.error("Error loading bookings:", e);
    } finally {
      setIsBookingsLoading(false);
    }
  };

  // --- API: UPDATE BOOKING STATUS ---
  const updateBookingStatus = async (id: string | number, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/update_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus as any } : b));
      } else {
        alert(result.message || "Failed to update booking status");
      }
    } catch (e) {
      alert("Error updating status.");
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    if (activeTab === "bookings") {
      loadBookings();
    }
  }, [activeTab]);

  const openAddModal = () => {
    setCurrentPkg({
      title: "",
      destination: "",
      duration: "",
      startingPrice: 0,
      image: "",
      overview: "",
      category: "domestic",
      featured: false,
    });
    setHighlightsList([]);
    setPlacesList([]);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (pkg: Package) => {
    setCurrentPkg(pkg);
    setHighlightsList(pkg.highlights || []);
    setPlacesList(pkg.placesCovered || []);
    setErrors({});
    setModalOpen(true);
  };

  // --- API: DELETE PACKAGE ---
  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this package? This action cannot be undone.")) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        setPackages(prev => prev.filter(p => p.id !== id));
      } else {
        alert(result.message || "Failed to delete package");
      }
    } catch (e) {
      alert("Error deleting package.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let targetValue: any = value;
    if (type === "checkbox") {
      targetValue = (e.target as HTMLInputElement).checked;
    } else if (name === "startingPrice") {
      targetValue = value ? Number(value) : 0;
    }
    setCurrentPkg(prev => prev ? { ...prev, [name]: targetValue } : null);
  };

  const addHighlight = () => {
    if (!highlightInput.trim()) return;
    setHighlightsList(prev => [...prev, highlightInput.trim()]);
    setHighlightInput("");
  };
  const removeHighlight = (idx: number) => setHighlightsList(prev => prev.filter((_, i) => i !== idx));

  const addPlace = () => {
    if (!placeInput.trim()) return;
    setPlacesList(prev => [...prev, placeInput.trim()]);
    setPlaceInput("");
  };
  const removePlace = (idx: number) => setPlacesList(prev => prev.filter((_, i) => i !== idx));

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!currentPkg?.title?.trim()) errs.title = "Title is required";
    if (!currentPkg?.destination?.trim()) errs.destination = "Destination is required";
    if (!currentPkg?.duration?.trim()) errs.duration = "Duration is required";
    if (!currentPkg?.startingPrice || currentPkg.startingPrice <= 0) errs.startingPrice = "Valid starting price is required";
    if (!currentPkg?.overview?.trim() || currentPkg.overview.length < 20) errs.overview = "Description must be at least 20 chars";
    if (highlightsList.length === 0) errs.highlights = "Add at least one highlight";
    if (placesList.length === 0) errs.places = "Add at least one place covered";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // --- API: CREATE OR UPDATE PACKAGE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      const payload = {
        ...currentPkg,
        highlights: highlightsList,
        placesCovered: placesList,
        nights: currentPkg?.duration?.toLowerCase().includes("night") ? parseInt(currentPkg.duration.match(/\d+/)?.at(0) || "0") : 0,
        days: currentPkg?.duration?.toLowerCase().includes("day") ? parseInt(currentPkg.duration.split("/").pop()?.match(/\d+/)?.at(0) || "0") : 0,
        pricing: currentPkg?.pricing || [
          { hotelCategory: "Standard Package", plan: "MAP Plan", pricePerPerson: currentPkg?.startingPrice || 0, recommended: true }
        ],
        itinerary: currentPkg?.itinerary || [
          { day: 1, title: "Day 1 Itinerary", description: "Arrival and local sightseeing overview." }
        ]
      };
      
      const endpoint = payload.id 
        ? `${process.env.NEXT_PUBLIC_API_URL}/packages/update.php` 
        : `${process.env.NEXT_PUBLIC_API_URL}/packages/create.php`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();

      if (response.ok && result.status === "success") {
        await loadPackages(); 
        setModalOpen(false);
      } else {
        alert(result.message || "Error saving package");
      }
    } catch (e) {
      alert("Error: Could not save package.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink">
            Manage Packages
          </h1>
          <p className="text-muted text-xs mt-1">
            Create, modify, and delete the holiday tour packages listed on your public website.
          </p>
        </div>
        
        {activeTab === "catalog" && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Package
          </button>
        )}
      </div>

      <div className="border-b border-border/50 flex gap-6">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "catalog"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Catalog Management
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "bookings"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Booking Requests
        </button>
      </div>

      {activeTab === "bookings" ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by name, email, phone, package title or ID..."
                value={bookingsSearchQuery}
                onChange={(e) => setBookingsSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-ink focus:border-primary outline-none shadow-sm transition-all"
              />
            </div>
          </div>

          {isBookingsLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-muted text-xs">Loading bookings data...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <Calendar className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No bookings yet</h3>
              <p className="text-muted text-xs">When customers book a package, they will appear here.</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-white p-8 text-muted text-xs">
              No matching package bookings found.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface border-b border-border/50 text-muted uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">ID & Date</th>
                    <th className="px-6 py-4">Customer Details</th>
                    <th className="px-6 py-4">Travel Details</th>
                    <th className="px-6 py-4">Package & Notes</th>
                    <th className="px-6 py-4">Status</th>
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
                        <span className="font-semibold text-ink flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-primary"/> {booking.travel_date}
                        </span>
                        <span className="text-xs text-muted flex items-center gap-1 mt-1">
                          <Users className="w-3 h-3"/> {booking.adults} Adults 
                          {booking.children > 0 && `, ${booking.children} Children`}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-[250px] whitespace-normal break-words">
                        <span className="font-semibold text-primary block">
                          {booking.package_title || `Package ID: ${booking.package_id}`}
                        </span>
                        <span className="text-[11px] text-muted line-clamp-2 mt-1" title={booking.special_requests}>
                          {booking.special_requests || "No special requests"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {booking.status === 'pending' && (
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
              <p className="text-muted text-xs">Loading packages data...</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <Palmtree className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No packages found</h3>
              <p className="text-muted text-xs max-w-xs mx-auto mt-1 mb-6">
                Get started by creating your first holiday package to show to users.
              </p>
              <button
                onClick={openAddModal}
                className="px-5 py-3 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition-all cursor-pointer"
              >
                Create First Package
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 bg-surface">
                    {pkg.image ? (
                      <Image
                        src={pkg.image}
                        alt={pkg.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    {pkg.featured && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                        Featured
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold rounded-full uppercase">
                      {pkg.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-muted text-xs mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        {pkg.destination}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        {pkg.duration}
                      </span>
                    </div>

                    <h3 className="font-heading font-semibold text-ink text-base mb-3 group-hover:text-primary transition-colors">
                      {pkg.title}
                    </h3>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                      <div>
                        <span className="text-[10px] text-muted block">Starting Price</span>
                        <span className="font-heading font-black text-lg text-primary">
                          ₹{pkg.startingPrice.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(pkg)}
                          className="p-2 bg-surface hover:bg-primary-light text-ink hover:text-primary rounded-xl border border-border/50 transition-all cursor-pointer"
                          title="Edit Package"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id as string)}
                          className="p-2 bg-surface hover:bg-red-50 text-ink hover:text-red-500 rounded-xl border border-border/50 transition-all cursor-pointer"
                          title="Delete Package"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Editor Modal Overlay */}
      {modalOpen && currentPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-6 border-b border-border/50 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-heading font-bold text-lg text-ink">
                {currentPkg.id ? "Edit Package Details" : "Create New Package"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-surface rounded-lg text-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">Package Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={currentPkg.title || ""}
                    onChange={handleInputChange}
                    placeholder="e.g. Patna to Kathmandu Tour"
                    className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                  />
                  {errors.title && <p className="text-red-500 text-[10px] mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">Destination *</label>
                  <input
                    type="text"
                    name="destination"
                    required
                    value={currentPkg.destination || ""}
                    onChange={handleInputChange}
                    placeholder="e.g. Nepal"
                    className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                  />
                  {errors.destination && <p className="text-red-500 text-[10px] mt-1">{errors.destination}</p>}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">Duration *</label>
                  <input
                    type="text"
                    name="duration"
                    required
                    value={currentPkg.duration || ""}
                    onChange={handleInputChange}
                    placeholder="e.g. 4 Nights / 5 Days"
                    className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                  />
                  {errors.duration && <p className="text-red-500 text-[10px] mt-1">{errors.duration}</p>}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">Starting Price (₹) *</label>
                  <input
                    type="number"
                    name="startingPrice"
                    required
                    value={currentPkg.startingPrice ?? ""}
                    onChange={handleInputChange}
                    placeholder="e.g. 12500"
                    className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                  />
                  {errors.startingPrice && <p className="text-red-500 text-[10px] mt-1">{errors.startingPrice}</p>}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">Category *</label>
                  <select
                    name="category"
                    value={currentPkg.category || "domestic"}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none cursor-pointer"
                  >
                    <option value="domestic">Domestic</option>
                    <option value="international">International</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">Main Banner Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={currentPkg.image || ""}
                    onChange={handleInputChange}
                    placeholder="Unsplash / external image link"
                    className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={currentPkg.featured || false}
                    onChange={handleInputChange}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <label htmlFor="featured" className="text-xs font-semibold text-ink cursor-pointer flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-primary shrink-0" />
                    Feature this package on the homepage hero grids
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">Overview Description *</label>
                  <textarea
                    name="overview"
                    rows={4}
                    required
                    value={currentPkg.overview || ""}
                    onChange={handleInputChange}
                    placeholder="Describe the tour itinerary, beauty and details..."
                    className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none resize-none"
                  />
                  {errors.overview && <p className="text-red-500 text-[10px] mt-1">{errors.overview}</p>}
                </div>

                <div className="sm:col-span-2 border-t border-border/40 pt-4">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">Highlights *</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={highlightInput}
                      onChange={(e) => setHighlightInput(e.target.value)}
                      placeholder="e.g. Daily Breakfast & Dinner"
                      className="flex-1 px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
                    />
                    <button
                      type="button"
                      onClick={addHighlight}
                      className="px-4 py-3 bg-ink hover:bg-ink-light text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {errors.highlights && <p className="text-red-500 text-[10px] mb-2">{errors.highlights}</p>}
                  <div className="flex flex-wrap gap-2">
                    {highlightsList.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-surface border border-border rounded-lg text-[10.5px] font-medium text-ink/80">
                        {item}
                        <button type="button" onClick={() => removeHighlight(idx)} className="text-red-500 hover:text-red-700 ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 border-t border-border/40 pt-4">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">Places Covered *</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={placeInput}
                      onChange={(e) => setPlaceInput(e.target.value)}
                      placeholder="e.g. Pashupatinath Temple"
                      className="flex-1 px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
                    />
                    <button
                      type="button"
                      onClick={addPlace}
                      className="px-4 py-3 bg-ink hover:bg-ink-light text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {errors.places && <p className="text-red-500 text-[10px] mb-2">{errors.places}</p>}
                  <div className="flex flex-wrap gap-2">
                    {placesList.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-surface border border-border rounded-lg text-[10.5px] font-medium text-ink/80">
                        {item}
                        <button type="button" onClick={() => removePlace(idx)} className="text-red-500 hover:text-red-700 ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-border/50 sticky bottom-0 bg-white z-10">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer text-xs disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-3.5 border border-border text-ink font-semibold rounded-xl hover:bg-surface transition-colors cursor-pointer text-xs disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}