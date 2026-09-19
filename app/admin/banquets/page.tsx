"use client";

import { useEffect, useState } from "react";
import {
  GlassWater, MapPin, Loader2, CheckCircle2,
  Mail, Phone, Calendar, Users, IndianRupee, Eye, X,
  Trash2, RefreshCw, Search, ShieldCheck, UserCheck, CreditCard, XCircle,
  Plus, Edit2, Save, UploadCloud, Star
} from "lucide-react";

// CORRECTED IMAGE URL HELPER
const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path; 
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost/hrtrips/api/";
  const baseUrl = apiUrl.replace(/\/api\/?$/, "");
  return `${baseUrl}/${path.replace(/^\//, "")}`;
};

// HELPER TO FORMAT AMENITIES FROM DB JSON
const formatAmenities = (amenitiesData: any) => {
  if (!amenitiesData || amenitiesData === '[]') return "None";
  if (Array.isArray(amenitiesData)) return amenitiesData.join(", ");
  if (typeof amenitiesData === "string") {
    try {
      const parsed = JSON.parse(amenitiesData);
      return Array.isArray(parsed) ? parsed.join(", ") : amenitiesData;
    } catch {
      return amenitiesData;
    }
  }
  return "None";
};

export default function AdminBanquetsPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "registrations" | "bookings">("catalog");

  // --- UNIFIED BANQUETS STATE ---
  const [banquets, setBanquets] = useState<any[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  
  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [currentBq, setCurrentBq] = useState<any>(null);
  const [catalogErrors, setCatalogErrors] = useState<Record<string, string>>({});
  
  // Viewing Registration State
  const [viewingReg, setViewingReg] = useState<any | null>(null);

  // Form States
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [amenityInput, setAmenityInput] = useState("");
  const [pendingSearchQuery, setPendingSearchQuery] = useState("");

  // --- BOOKINGS STATE ---
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingsSearchQuery, setBookingsSearchQuery] = useState("");

  // Lightbox
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // ================= 1. API: LOAD ALL BANQUETS (Both Approved & Pending) =================
  const loadBanquetsCatalog = async () => {
    setIsLoadingCatalog(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}banquets/get_catalog.php`, { cache: "no-store" });
      const rawText = await response.text();
      const match = rawText.match(/\{.*\}/s);
      if (match) {
        const result = JSON.parse(match[0]);
        if (response.ok && result.status === "success") {
          setBanquets(result.data || []);
        }
      }
    } catch (e) {
      console.error("Failed to load catalog", e);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  // ================= 2. API: LOAD BANQUET BOOKINGS =================
  const loadBookingsData = async () => {
    setIsLoadingBookings(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}banquet-bookings/list.php`, { cache: "no-store" });
      const rawText = await response.text();
      const match = rawText.match(/\{.*\}/s);
      if (match) {
        const result = JSON.parse(match[0]);
        if (response.ok && result.status === "success") {
          setBookings(result.data || []);
        }
      }
    } catch (e) {
      console.error("Failed to load bookings", e);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Initial Load
  useEffect(() => {
    loadBanquetsCatalog();
    loadBookingsData();
  }, []);

  useEffect(() => {
    if (activeTab === "bookings") loadBookingsData();
    else loadBanquetsCatalog();
  }, [activeTab]);


  // ================= DATA SPLITTING (Approved vs Pending) =================
  const approvedBanquets = banquets.filter(b => Number(b.is_approved) === 1);
  const pendingBanquets = banquets.filter(b => Number(b.is_approved) === 0);
  
  const filteredPending = pendingBanquets.filter(r => 
    (r.name || "").toLowerCase().includes(pendingSearchQuery.toLowerCase()) ||
    (r.owner_name || "").toLowerCase().includes(pendingSearchQuery.toLowerCase())
  );

  const filteredBooks = bookings.filter(b => (b.customer_name || "").toLowerCase().includes(bookingsSearchQuery.toLowerCase()));
  const totalRevenue = filteredBooks.filter(b => b.booking_status === "confirmed").reduce((s, b) => s + (Number(b.total_amount) || 0), 0);


  // ================= MODAL & FORM ACTIONS =================
  const openAddModal = () => {
    setCurrentBq({
      name: "", location: "", address: "", city: "", state: "", pincode: "", 
      capacity: 500, pricePerPlateVeg: 800, pricePerPlateNonVeg: 1000,
      description: "", amenities: ["AC Hall", "Decor", "Parking"], featured: false, is_approved: true,
      owner_name: "", owner_phone: "", property_manager_name: "", property_manager_phone: "", email: "",
      gst: "", banquet_registration_number: "", fire_safety_noc: "Yes", cctv_camera: "Available",
      bank_name: "", account_holder_name: "", ifsc_code: "", account_number: ""
    });
    setExistingImages([]);
    setNewImageFiles([]);
    setAmenityInput("");
    setCatalogErrors({});
    setModalOpen(true);
  };

  const openEditModal = (bq: any) => {
    // Safely parse amenities if it's a string
    let parsedAmenities = bq.amenities;
    if (typeof parsedAmenities === "string") {
      try { parsedAmenities = JSON.parse(parsedAmenities); } catch { parsedAmenities = [parsedAmenities]; }
    }
    if (!Array.isArray(parsedAmenities)) parsedAmenities = [];

    setCurrentBq({
      ...bq,
      pricePerPlateVeg: bq.price_per_plate_veg || bq.pricePerPlateVeg || 0,
      pricePerPlateNonVeg: bq.price_per_plate_non_veg || bq.pricePerPlateNonVeg || 0,
      featured: Boolean(Number(bq.featured)),
      is_approved: Boolean(Number(bq.is_approved)),
      owner_name: bq.owner_name || "",
      owner_phone: bq.owner_phone || "",
      property_manager_name: bq.property_manager_name || "",
      property_manager_phone: bq.property_manager_phone || "",
      email: bq.email || "",
      address: bq.address || "",
      city: bq.city || "",
      state: bq.state || "",
      pincode: bq.pincode || "",
      gst: bq.gst || "",
      banquet_registration_number: bq.banquet_registration_number || "",
      fire_safety_noc: bq.fire_safety_noc || "Yes",
      cctv_camera: bq.cctv_camera || "Available",
      bank_name: bq.bank_name || "",
      account_holder_name: bq.account_holder_name || "",
      ifsc_code: bq.ifsc_code || "",
      account_number: bq.account_number || "",
      amenities: parsedAmenities
    });
    
    let imgs: string[] = [];
    if (Array.isArray(bq.images)) imgs = bq.images;
    else if (typeof bq.images === 'string') {
      try { imgs = JSON.parse(bq.images); } catch { imgs = []; }
    } else if (bq.image) imgs = [bq.image]; 
    
    setExistingImages(imgs);
    setNewImageFiles([]);
    setAmenityInput("");
    setCatalogErrors({});
    setModalOpen(true);
  };

  const handleDeleteCatalog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banquet hall from the database?")) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}banquets/delete_catalog.php`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (response.ok) {
        setBanquets(prev => prev.filter(b => b.id !== id));
        if (viewingReg?.id === id) setViewingReg(null);
      }
    } catch { alert("Failed to delete banquet hall"); }
  };

  // Image Upload Handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImageFiles(prev => [...prev, ...files]);
    setCatalogErrors(prev => ({ ...prev, images: "" }));
  };
  const removeExistingImage = (index: number) => setExistingImages(prev => prev.filter((_, i) => i !== index));
  const removeNewImage = (index: number) => setNewImageFiles(prev => prev.filter((_, i) => i !== index));

  const handleAddAmenity = () => {
    if (!amenityInput.trim()) return;
    setCurrentBq((prev: any) => ({ ...prev, amenities: [...(prev?.amenities || []), amenityInput.trim()] }));
    setAmenityInput("");
  };
  const handleRemoveAmenity = (index: number) => {
    setCurrentBq((prev: any) => ({ ...prev, amenities: prev.amenities.filter((_: any, i: number) => i !== index) }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let targetValue: any = value;
    if (type === "checkbox") targetValue = (e.target as HTMLInputElement).checked;
    else if (name === "pricePerPlateVeg" || name === "pricePerPlateNonVeg" || name === "capacity") {
      targetValue = value ? Number(value) : 0;
    }
    setCurrentBq((prev: any) => prev ? { ...prev, [name]: targetValue } : null);
  };

  // --- SUBMIT FULL CATALOG FORM ---
  const handleCatalogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!currentBq?.name?.trim()) errs.name = "Banquet name is required";
    if (!currentBq?.location?.trim()) errs.location = "Location is required";
    if (!currentBq?.capacity || currentBq.capacity <= 0) errs.capacity = "Capacity is required";
    if (!currentBq?.pricePerPlateVeg || currentBq.pricePerPlateVeg <= 0) errs.pricePerPlateVeg = "Veg plate rate is required";
    if (existingImages.length === 0 && newImageFiles.length === 0) errs.images = "At least one image is required";

    if (Object.keys(errs).length > 0) {
      setCatalogErrors(errs);
      return;
    }
    
    setIsSaving(true);
    try {
      const formData = new FormData();
      if (currentBq.id) formData.append("id", String(currentBq.id));
      formData.append("name", currentBq.name || "");
      formData.append("location", currentBq.location || "");
      formData.append("address", currentBq.address || "");
      formData.append("city", currentBq.city || "");
      formData.append("state", currentBq.state || "");
      formData.append("pincode", currentBq.pincode || "");

      formData.append("capacity", String(currentBq.capacity || 0));
      formData.append("price_per_plate_veg", String(currentBq.pricePerPlateVeg || 0));
      formData.append("price_per_plate_non_veg", String(currentBq.pricePerPlateNonVeg || 0));
      formData.append("description", currentBq.description || "");
      formData.append("featured", currentBq.featured ? "1" : "0");
      formData.append("is_approved", currentBq.is_approved ? "1" : "0");
      
      formData.append("owner_name", currentBq.owner_name || "");
      formData.append("owner_phone", currentBq.owner_phone || "");
      formData.append("property_manager_name", currentBq.property_manager_name || "");
      formData.append("property_manager_phone", currentBq.property_manager_phone || "");
      formData.append("email", currentBq.email || "");

      formData.append("gst", currentBq.gst || "");
      formData.append("banquet_registration_number", currentBq.banquet_registration_number || "");
      formData.append("fire_safety_noc", currentBq.fire_safety_noc || "");
      formData.append("cctv_camera", currentBq.cctv_camera || "");

      formData.append("bank_name", currentBq.bank_name || "");
      formData.append("account_holder_name", currentBq.account_holder_name || "");
      formData.append("account_number", currentBq.account_number || "");
      formData.append("ifsc_code", currentBq.ifsc_code || "");
      
      formData.append("amenities", JSON.stringify(currentBq.amenities || []));
      formData.append("existing_images", JSON.stringify(existingImages));

      newImageFiles.forEach((file) => formData.append("new_images[]", file));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}banquets/save.php`, {
        method: "POST", body: formData, 
      });

      if (response.ok) {
        await loadBanquetsCatalog(); 
        setModalOpen(false);
      } else alert("Failed to save banquet hall");
    } catch {
      alert("Network error. Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- APPROVE & REJECT PENDING REQUESTS ---
  const handleApproveBanquet = async (bq: any) => {
    if (!confirm(`Approve ${bq.name} and list it on the public website?`)) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}banquets/update_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bq.id, status: 'Approved' }) 
      });

      if (response.ok) {
        await loadBanquetsCatalog();
        setViewingReg(null);
      } else {
        alert("Failed to approve banquet");
      }
    } catch { alert("Network error"); }
  };

  const handleRejectBanquet = async (bq: any) => {
    if (!confirm(`Reject and delete registration request for ${bq.name}?`)) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}banquets/update_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bq.id, status: 'Rejected' }) 
      });

      if (response.ok) {
        setBanquets(prev => prev.filter(b => b.id !== bq.id));
        setViewingReg(null);
      } else {
        alert("Failed to reject banquet");
      }
    } catch { alert("Network error"); }
  };

  // --- BOOKING STATUS ---
  const updateBookStatus = async (id: string | number, newStatus: string) => {
    if (!confirm(`Mark this booking as ${newStatus.toUpperCase()}?`)) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}banquet-bookings/update_status.php`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      setBookings(prev => prev.map(b => String(b.id) === String(id) ? { ...b, booking_status: newStatus } : b));
    } catch { alert("Failed to update status"); }
  };

  const getBqCoverImage = (bq: any) => {
    if (Array.isArray(bq.images) && bq.images.length > 0) return getImageUrl(bq.images[0]);
    if (typeof bq.images === 'string') {
      try { const parsed = JSON.parse(bq.images); if (parsed.length > 0) return getImageUrl(parsed[0]); } catch {}
    }
    if (bq.image) return getImageUrl(bq.image);
    if (bq.hall_pic) return getImageUrl(bq.hall_pic);
    if (bq.interior_exterior_pic) return getImageUrl(bq.interior_exterior_pic);
    return "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80";
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink">Banquet Management</h1>
          <p className="text-muted text-xs mt-1">Manage approved banquet halls, venue registration requests, and event bookings.</p>
        </div>
        {activeTab === "catalog" && (
          <button onClick={openAddModal} className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20 transition-all">
            <Plus className="w-4 h-4" /> Add New Banquet Hall
          </button>
        )}
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-border/40 gap-6 mb-6 overflow-x-auto whitespace-nowrap">
        <button onClick={() => setActiveTab("catalog")} className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeTab === "catalog" ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}>
          Approved Banquets Inventory ({approvedBanquets.length})
        </button>
        <button onClick={() => setActiveTab("registrations")} className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeTab === "registrations" ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}>
          Registration Requests ({pendingBanquets.length})
        </button>
        <button onClick={() => setActiveTab("bookings")} className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeTab === "bookings" ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}>
          Master Banquet Bookings ({bookings.length})
        </button>
      </div>

      {/* ================= TAB 1: APPROVED CATALOG INVENTORY ================= */}
      {activeTab === "catalog" && (
        <>
          {isLoadingCatalog ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-muted text-xs">Loading banquet halls catalog...</p>
            </div>
          ) : approvedBanquets.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <GlassWater className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No Approved Banquets</h3>
              <p className="text-muted text-xs mt-1">Approve pending requests or add a new banquet hall to populate the inventory.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedBanquets.map((bq) => (
                <div key={bq.id} className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                  <div className="relative h-48 bg-surface shrink-0">
                    <img src={getBqCoverImage(bq)} alt={bq.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {bq.featured == 1 && <span className="bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shadow">Featured</span>}
                      <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shadow">Approved</span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div>
                      <h3 className="font-heading font-bold text-ink text-lg line-clamp-1">{bq.name}</h3>
                      <p className="text-xs text-muted flex items-center gap-1 mt-1 truncate"><MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> {bq.location}</p>
                    </div>
                    
                    {/* UPDATED: Show all details in the approved card grid */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-4 pt-3 border-t border-border/40 text-xs">
                      <div>
                        <span className="text-[10px] text-muted uppercase font-bold block mb-0.5">Capacity</span>
                        <span className="font-bold text-ink flex items-center gap-1"><Users className="w-3.5 h-3.5 text-primary" /> {bq.capacity} Guests</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted uppercase font-bold block mb-0.5">Veg Plate</span>
                        <span className="font-bold text-ink flex items-center"><IndianRupee className="w-3 h-3"/>{bq.price_per_plate_veg}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted uppercase font-bold block mb-0.5">Non-Veg Plate</span>
                        <span className="font-bold text-ink flex items-center">{bq.price_per_plate_non_veg > 0 ? <><IndianRupee className="w-3 h-3"/>{bq.price_per_plate_non_veg}</> : "N/A"}</span>
                      </div>
                      <div className="col-span-1">
                        <span className="text-[10px] text-muted uppercase font-bold block mb-0.5">Amenities</span>
                        <span className="font-bold text-ink truncate block" title={formatAmenities(bq.amenities)}>{formatAmenities(bq.amenities)}</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-auto border-t border-border/40 flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(bq)} className="px-3 py-1.5 bg-surface hover:bg-border/40 text-ink rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDeleteCatalog(bq.id)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer">
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

      {/* ================= TAB 2: PENDING REGISTRATION REQUESTS ================= */}
      {activeTab === "registrations" && (
        <div className="space-y-6">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border/50 shadow-sm">
             <div className="relative w-full sm:w-80">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
               <input type="text" placeholder="Search pending requests..." value={pendingSearchQuery} onChange={(e) => setPendingSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
             </div>
             <button onClick={loadBanquetsCatalog} disabled={isLoadingCatalog} className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-border/40 border border-border text-ink font-semibold rounded-xl text-xs transition-colors cursor-pointer">
               <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCatalog ? "animate-spin" : ""}`} /> Refresh Data
             </button>
           </div>
           
           {isLoadingCatalog ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-muted text-xs">Loading banquet owner registration requests...</p>
            </div>
          ) : filteredPending.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <GlassWater className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No Pending Registration Requests</h3>
              <p className="text-muted text-xs mt-1">When banquet halls are submitted but not yet approved, they appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface border-b border-border/50 text-muted uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Banquet Hall</th>
                    <th className="px-6 py-4">Owner Contact</th>
                    <th className="px-6 py-4">Location & Capacity</th>
                    <th className="px-6 py-4">Bank Details</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredPending.map((bq) => (
                    <tr key={bq.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0 bg-surface">
                            <img src={getBqCoverImage(bq)} alt={bq.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="font-bold text-ink block">{bq.name}</span>
                            <span className="text-[10px] text-muted block mt-0.5">Added: {new Date(bq.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-ink block">{bq.owner_name || "N/A"}</span>
                        <span className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-primary" /> {bq.owner_phone || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-ink block truncate max-w-[150px]">{bq.location}</span>
                        <span className="text-xs text-muted block mt-0.5">{bq.capacity} Guests</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-ink block">{bq.bank_name || "N/A"}</span>
                        <span className="text-[10px] text-muted block mt-0.5">A/C: {bq.account_number || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => handleApproveBanquet(bq)} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1" title="Approve & move to Catalog">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => setViewingReg(bq)} className="px-3 py-1.5 bg-surface hover:bg-blue-50 text-ink border border-border rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer" title="Review full details">
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                          <button onClick={() => handleRejectBanquet(bq)} className="p-1.5 text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Reject & Delete">
                            <Trash2 className="w-4 h-4" />
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

      {/* ================= REGISTRATION REVIEW DETAILS MODAL ================= */}
      {viewingReg && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 relative">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-heading font-bold text-xl text-ink">Review: {viewingReg.name}</h2>
                <p className="text-muted text-xs mt-1">Submitted on {new Date(viewingReg.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setViewingReg(null)} className="p-2 hover:bg-surface rounded-xl text-muted hover:text-ink cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted">Current Status:</span>
                <span className="px-3 py-1 rounded-xl text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200">
                  Pending Approval
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleApproveBanquet(viewingReg)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer">
                  <CheckCircle2 className="w-4 h-4" /> Approve Banquet
                </button>
                <button onClick={() => handleRejectBanquet(viewingReg)} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer">
                  <XCircle className="w-4 h-4" /> Reject Request
                </button>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* NEW BOX: Banquet Specs & Pricing */}
              <div className="bg-surface/50 border border-border/60 rounded-2xl p-5 space-y-2">
                <h3 className="font-bold text-ink text-sm border-b border-border/40 pb-2 flex items-center gap-1.5">
                  <GlassWater className="w-4 h-4 text-primary" /> Banquet Specs & Pricing
                </h3>
                <p><strong className="text-ink">Capacity:</strong> {viewingReg.capacity} Guests</p>
                <p><strong className="text-ink">Veg Plate Rate:</strong> ₹{viewingReg.price_per_plate_veg}</p>
                <p><strong className="text-ink">Non-Veg Plate Rate:</strong> {viewingReg.price_per_plate_non_veg > 0 ? `₹${viewingReg.price_per_plate_non_veg}` : "N/A"}</p>
                <p className="flex items-start gap-1">
                  <strong className="text-ink shrink-0">Amenities:</strong> 
                  <span className="leading-relaxed">{formatAmenities(viewingReg.amenities)}</span>
                </p>
              </div>

              {/* Owner & Management */}
              <div className="bg-surface/50 border border-border/60 rounded-2xl p-5 space-y-2">
                <h3 className="font-bold text-ink text-sm border-b border-border/40 pb-2 flex items-center gap-1.5"><UserCheck className="w-4 h-4 text-primary" /> Owner & Management</h3>
                <p><strong className="text-ink">Owner:</strong> {viewingReg.owner_name} ({viewingReg.owner_phone})</p>
                <p><strong className="text-ink">Manager:</strong> {viewingReg.property_manager_name} ({viewingReg.property_manager_phone})</p>
                <p><strong className="text-ink">Email ID:</strong> {viewingReg.email}</p>
                <p><strong className="text-ink">Full Address:</strong> {viewingReg.address}, {viewingReg.city}, {viewingReg.state} - {viewingReg.pincode}</p>
                <p><strong className="text-ink">Map / Landmark:</strong> {viewingReg.location}</p>
              </div>

              {/* Registration & Compliance */}
              <div className="bg-surface/50 border border-border/60 rounded-2xl p-5 space-y-2">
                <h3 className="font-bold text-ink text-sm border-b border-border/40 pb-2 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" /> Registration & Compliance</h3>
                <p><strong className="text-ink">GST Number:</strong> {viewingReg.gst}</p>
                <p><strong className="text-ink">Reg No:</strong> {viewingReg.banquet_registration_number}</p>
                <p><strong className="text-ink">Fire NOC:</strong> {viewingReg.fire_safety_noc}</p>
                <p><strong className="text-ink">CCTV Camera:</strong> {viewingReg.cctv_camera}</p>
              </div>

              {/* Payout Bank Details */}
              <div className="bg-surface/50 border border-border/60 rounded-2xl p-5 space-y-2">
                <h3 className="font-bold text-ink text-sm border-b border-border/40 pb-2 flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-primary" /> Payout Bank Details</h3>
                <p><strong className="text-ink">Bank Name:</strong> {viewingReg.bank_name}</p>
                <p><strong className="text-ink">Account Holder:</strong> {viewingReg.account_holder_name}</p>
                <p><strong className="text-ink">Account No:</strong> {viewingReg.account_number}</p>
                <p><strong className="text-ink">IFSC Code:</strong> {viewingReg.ifsc_code}</p>
              </div>
            </div>

            {/* Inspection Photos based on the unified DB schema */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="font-bold text-ink text-sm">Inspection Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { title: "Hall Photo", pic: viewingReg.hall_pic },
                  { title: "Reception", pic: viewingReg.reception_pic },
                  { title: "Bathroom", pic: viewingReg.bathroom_pic },
                  { title: "Exterior", pic: viewingReg.interior_exterior_pic },
                ].map((cat, idx) => (
                  <div key={idx} className="border border-border/60 rounded-xl p-3 bg-surface/40 space-y-2">
                    <span className="text-[11px] font-bold text-ink block">{cat.title}</span>
                    {cat.pic ? (
                      <div onClick={() => setLightboxImg(getImageUrl(cat.pic))} className="relative group h-28 rounded-lg overflow-hidden border border-border bg-black/5 cursor-pointer">
                        <img src={getImageUrl(cat.pic)} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </div>
                      </div>
                    ) : (
                      <div className="h-28 rounded-lg border border-dashed border-border flex items-center justify-center text-muted text-[11px]">No photo</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMMON CATALOG ADD / EDIT MODAL FOR BOTH TABS */}
      {modalOpen && currentBq && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
              <h2 className="font-heading font-bold text-xl text-ink">
                {currentBq.id ? "Edit Banquet Hall Details" : "Add New Banquet Hall"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-surface rounded-xl text-muted hover:text-ink cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCatalogSubmit} className="space-y-6 text-xs overflow-y-auto pr-2 pb-4">
              
              {/* IMAGE UPLOAD SECTION */}
              <div className="bg-surface/30 p-4 rounded-xl border border-border/50">
                <label className="block font-bold text-ink mb-3 text-sm">Banquet Image Gallery *</label>
                <div className="flex flex-wrap gap-4">
                  {existingImages.map((img, idx) => (
                    <div key={`ext-${idx}`} className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl border border-border overflow-hidden group">
                      <img src={getImageUrl(img)} alt="preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {newImageFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl border border-primary/40 overflow-hidden group">
                      <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">NEW</div>
                      <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-24 h-24 sm:w-28 sm:h-28 flex flex-col items-center justify-center border-2 border-dashed border-primary/50 text-primary hover:bg-primary/5 rounded-xl cursor-pointer transition-colors bg-white">
                    <UploadCloud className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold text-center px-2">Add Files</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                  </label>
                </div>
                {catalogErrors.images && <p className="text-rose-500 text-[11px] font-semibold mt-2">{catalogErrors.images}</p>}
              </div>

              {/* SECTION 1: BASIC DETAILS */}
              <div className="bg-surface/30 p-4 rounded-xl border border-border/50 space-y-4">
                <h3 className="font-bold text-ink text-sm border-b border-border/60 pb-2">Basic Details & Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-muted mb-1">Banquet Name *</label>
                    <input type="text" name="name" value={currentBq.name || ""} onChange={handleInputChange} placeholder="e.g. Royal Palace Banquet" className="w-full px-4 py-2.5 bg-white rounded-xl border border-border focus:border-primary outline-none" />
                    {catalogErrors.name && <p className="text-rose-500 text-[10px] mt-0.5">{catalogErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block font-semibold text-muted mb-1">Seating Capacity *</label>
                    <input type="number" name="capacity" value={currentBq.capacity || 0} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white rounded-xl border border-border focus:border-primary outline-none" />
                    {catalogErrors.capacity && <p className="text-rose-500 text-[10px] mt-0.5">{catalogErrors.capacity}</p>}
                  </div>
                  <div>
                    <label className="block font-semibold text-muted mb-1">Veg Plate Rate (₹) *</label>
                    <input type="number" name="pricePerPlateVeg" value={currentBq.pricePerPlateVeg || 0} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white rounded-xl border border-border focus:border-primary outline-none" />
                    {catalogErrors.pricePerPlateVeg && <p className="text-rose-500 text-[10px] mt-0.5">{catalogErrors.pricePerPlateVeg}</p>}
                  </div>
                  <div>
                    <label className="block font-semibold text-muted mb-1">Non-Veg Plate Rate (₹)</label>
                    <input type="number" name="pricePerPlateNonVeg" value={currentBq.pricePerPlateNonVeg || 0} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white rounded-xl border border-border focus:border-primary outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-muted mb-1">Description</label>
                    <textarea name="description" rows={3} value={currentBq.description || ""} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white rounded-xl border border-border focus:border-primary outline-none resize-none" />
                  </div>
                </div>
              </div>

              {/* SECTION 2: LOCATION DETAILS */}
              <div className="bg-surface/30 p-4 rounded-xl border border-border/50 space-y-4">
                <h3 className="font-bold text-ink text-sm border-b border-border/60 pb-2">Location Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-muted mb-1">Google Maps Link / Landmark *</label>
                    <input type="text" name="location" value={currentBq.location || ""} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white rounded-xl border border-border focus:border-primary outline-none" />
                    {catalogErrors.location && <p className="text-rose-500 text-[10px] mt-0.5">{catalogErrors.location}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-muted mb-1">Full Street Address</label>
                    <textarea name="address" rows={2} value={currentBq.address || ""} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white rounded-xl border border-border focus:border-primary outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block font-semibold text-muted mb-1">City</label>
                    <input type="text" name="city" value={currentBq.city || ""} onChange={handleInputChange} className="w-full px-4 py-2 bg-white rounded-xl border border-border focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block font-semibold text-muted mb-1">State</label>
                    <input type="text" name="state" value={currentBq.state || ""} onChange={handleInputChange} className="w-full px-4 py-2 bg-white rounded-xl border border-border focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block font-semibold text-muted mb-1">Pincode</label>
                    <input type="text" name="pincode" value={currentBq.pincode || ""} onChange={handleInputChange} maxLength={6} className="w-full px-4 py-2 bg-white rounded-xl border border-border focus:border-primary outline-none font-mono" />
                  </div>
                </div>
              </div>

              {/* SECTION 3: OWNER & BANK DETAILS */}
              <div className="bg-surface/30 p-4 rounded-xl border border-border/50 space-y-4">
                <h3 className="font-bold text-ink text-sm border-b border-border/60 pb-2">Owner & Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-muted mb-1">Owner Name</label>
                    <input type="text" name="owner_name" value={currentBq.owner_name || ""} onChange={handleInputChange} className="w-full px-4 py-2 bg-white rounded-xl border border-border focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block font-semibold text-muted mb-1">Owner Phone</label>
                    <input type="text" name="owner_phone" value={currentBq.owner_phone || ""} onChange={handleInputChange} className="w-full px-4 py-2 bg-white rounded-xl border border-border focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block font-semibold text-muted mb-1">Property Manager Name</label>
                    <input type="text" name="property_manager_name" value={currentBq.property_manager_name || ""} onChange={handleInputChange} className="w-full px-4 py-2 bg-white rounded-xl border border-border focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block font-semibold text-muted mb-1">Property Manager Phone</label>
                    <input type="text" name="property_manager_phone" value={currentBq.property_manager_phone || ""} onChange={handleInputChange} className="w-full px-4 py-2 bg-white rounded-xl border border-border focus:border-primary outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-muted mb-1">Registered Email ID</label>
                    <input type="email" name="email" value={currentBq.email || ""} onChange={handleInputChange} className="w-full px-4 py-2 bg-white rounded-xl border border-border focus:border-primary outline-none" />
                  </div>
                </div>

                <h3 className="font-bold text-ink text-sm border-b border-border/60 pb-2 mt-6">Payout Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-muted mb-1">Bank Name</label>
                    <input type="text" name="bank_name" value={currentBq.bank_name || ""} onChange={handleInputChange} className="w-full px-4 py-2 bg-white rounded-xl border border-border focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block font-semibold text-muted mb-1">Account Holder Name</label>
                    <input type="text" name="account_holder_name" value={currentBq.account_holder_name || ""} onChange={handleInputChange} className="w-full px-4 py-2 bg-white rounded-xl border border-border focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block font-semibold text-muted mb-1">Account Number</label>
                    <input type="text" name="account_number" value={currentBq.account_number || ""} onChange={handleInputChange} className="w-full px-4 py-2 bg-white rounded-xl border border-border focus:border-primary outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block font-semibold text-muted mb-1">IFSC Code</label>
                    <input type="text" name="ifsc_code" value={currentBq.ifsc_code || ""} onChange={handleInputChange} className="w-full px-4 py-2 bg-white rounded-xl border border-border focus:border-primary outline-none font-mono uppercase" />
                  </div>
                </div>
              </div>

              {/* SECTION 4: COMPLIANCE DETAILS */}
              <div className="bg-surface/30 p-4 rounded-xl border border-border/50 space-y-4">
                <h3 className="font-bold text-ink text-sm border-b border-border/60 pb-2">Compliance & Licenses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-muted mb-1">GST Number</label>
                    <input type="text" name="gst" value={currentBq.gst || ""} onChange={handleInputChange} className="w-full px-4 py-2 bg-white rounded-xl border border-border focus:border-primary outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block font-semibold text-muted mb-1">Banquet Registration No.</label>
                    <input type="text" name="banquet_registration_number" value={currentBq.banquet_registration_number || ""} onChange={handleInputChange} className="w-full px-4 py-2 bg-white rounded-xl border border-border focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block font-semibold text-muted mb-1">Fire Safety NOC</label>
                    <select name="fire_safety_noc" value={currentBq.fire_safety_noc || "Yes"} onChange={handleInputChange} className="w-full px-4 py-2 bg-white rounded-xl border border-border focus:border-primary outline-none">
                      <option value="Yes">Yes (NOC Issued)</option>
                      <option value="No">No</option>
                      <option value="In Process">In Process</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-muted mb-1">CCTV Camera Setup</label>
                    <select name="cctv_camera" value={currentBq.cctv_camera || "Available"} onChange={handleInputChange} className="w-full px-4 py-2 bg-white rounded-xl border border-border focus:border-primary outline-none">
                      <option value="Available">Available (Full Coverage)</option>
                      <option value="Not Available">Not Available</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* AMENITIES SECTION */}
              <div className="bg-surface/30 p-4 rounded-xl border border-border/50">
                <label className="block font-bold text-ink text-sm border-b border-border/60 pb-2 mb-3">Amenities List</label>
                <div className="flex items-center gap-2 mb-3">
                  <input 
                    type="text" 
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddAmenity(); }}}
                    placeholder="e.g. Valet Parking, DJ, AC"
                    className="flex-1 px-4 py-2.5 bg-white rounded-xl border border-border focus:border-primary outline-none"
                  />
                  <button type="button" onClick={handleAddAmenity} className="px-4 py-2.5 bg-ink text-white font-bold rounded-xl cursor-pointer hover:bg-ink-light">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(currentBq?.amenities || []).map((am: string, idx: number) => (
                    <span key={idx} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
                      {am}
                      <X className="w-3.5 h-3.5 cursor-pointer hover:text-red-500" onClick={() => handleRemoveAmenity(idx)} />
                    </span>
                  ))}
                </div>
              </div>

              {/* VISIBILITY SETTINGS */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-3 pb-2 bg-surface/30 p-4 rounded-xl border border-border/50">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_approved" name="is_approved" checked={currentBq.is_approved || false} onChange={handleInputChange} className="w-4 h-4 rounded text-primary border-border cursor-pointer" />
                  <label htmlFor="is_approved" className="font-bold text-emerald-600 cursor-pointer text-xs">Approved (Visible on Public Website)</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="featured" name="featured" checked={currentBq.featured || false} onChange={handleInputChange} className="w-4 h-4 rounded text-primary border-border cursor-pointer" />
                  <label htmlFor="featured" className="font-bold text-amber-600 cursor-pointer text-xs">Mark as Featured Listing</label>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" disabled={isSaving} onClick={() => setModalOpen(false)} className="px-5 py-2.5 border border-border text-ink rounded-xl font-semibold hover:bg-surface cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold cursor-pointer shadow-lg shadow-primary/20 flex items-center gap-1.5 disabled:opacity-70">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {isSaving ? "Saving..." : "Save Banquet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 3: MASTER BOOKINGS ================= */}
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
              onClick={loadBookingsData}
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
          ) : filteredBooks.length === 0 ? (
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
                    <th className="px-6 py-4">Event Details</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredBooks.map((b) => (
                    <tr key={b.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-ink block">#{b.id} - {b.customer_name}</span>
                        <span className="text-xs text-muted flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3 text-primary" /> {b.customer_email}</span>
                        <span className="text-xs text-muted flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3 text-primary" /> {b.customer_phone}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-primary block">{b.banquet_name}</span>
                        <span className="text-xs text-muted block mt-0.5">{b.city || "N/A"}</span>
                        <span className="text-[10px] text-muted block mt-1">Booked: {new Date(b.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-ink block">{b.event_type}</span>
                        <span className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-primary" /> {b.event_date}
                        </span>
                        <span className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3 text-primary" /> {b.guest_count} Guests
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-ink flex items-center">
                          <IndianRupee className="w-3.5 h-3.5"/>
                          {b.total_amount ? Number(b.total_amount).toLocaleString("en-IN") : "0"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={b.booking_status}
                          onChange={(e) => updateBookStatus(b.id, e.target.value as any)}
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
                          <button onClick={() => updateBookStatus(b.id, "cancelled")} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer">
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

      {/* LIGHTBOX MODAL */}
      {lightboxImg && (
        <div onClick={() => setLightboxImg(null)} className="fixed inset-0 z-[70] bg-black/85 flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-3xl w-full p-4 space-y-3 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-bold text-xs text-ink">Preview</span>
              <button onClick={() => setLightboxImg(null)} className="p-1 hover:bg-surface rounded-lg text-muted hover:text-ink cursor-pointer">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-black/5 rounded-xl">
              <img src={lightboxImg} alt="Preview" className="max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}