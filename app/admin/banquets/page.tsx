"use client";

import { useEffect, useState } from "react";
import { getBanquets, createOrUpdateBanquet, deleteBanquet } from "@/lib/api";
import type { Banquet } from "@/lib/types";
import { Plus, Edit2, Trash2, Users, MapPin, X, Image as ImageIcon, Save } from "lucide-react";
import Image from "next/image";
import BookingRequestsSection from "@/components/admin/BookingRequestsSection";

export default function AdminBanquetsPage() {
  const [banquets, setBanquets] = useState<Banquet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentBq, setCurrentBq] = useState<Partial<Banquet> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"catalog" | "bookings">("catalog");

  const loadBanquets = async () => {
    setIsLoading(true);
    try {
      const data = await getBanquets();
      setBanquets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanquets();
  }, []);

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
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (bq: Banquet) => {
    setCurrentBq(bq);
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
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

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!currentBq?.name?.trim()) errs.name = "Banquet name is required";
    if (!currentBq?.location?.trim()) errs.location = "Location is required";
    if (!currentBq?.capacity || currentBq.capacity <= 0) errs.capacity = "Seating capacity is required";
    if (!currentBq?.pricePerPlateVeg || currentBq.pricePerPlateVeg <= 0) errs.pricePerPlateVeg = "Veg plate rate is required";
    if (!currentBq?.description?.trim() || currentBq.description.length < 15) errs.description = "Description must be at least 15 chars";
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const saved = await createOrUpdateBanquet(currentBq as any);
      if (saved) {
        loadBanquets();
        setModalOpen(false);
      }
    } catch (e) {
      alert("Error saving banquet");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink">
            Manage Banquet Halls
          </h1>
          <p className="text-muted text-xs mt-1">
            Create, modify, and delete wedding/party venues listed on your public website.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-xs font-semibold hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Banquet
        </button>
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
        <BookingRequestsSection filterType="banquets" />
      ) : (
        <>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
              <p className="text-muted text-xs">Loading banquets...</p>
            </div>
          ) : banquets.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <ImageIcon className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No banquet halls</h3>
              <p className="text-muted text-xs max-w-xs mx-auto mt-1 mb-6">Create your first banquet option to display to customers.</p>
              <button onClick={openAddModal} className="px-5 py-3 bg-primary text-white text-xs font-semibold rounded-xl cursor-pointer">
                Create Banquet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banquets.map((bq) => (
                <div key={bq.id} className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                  <div className="relative h-48 bg-surface">
                    {bq.image ? (
                      <Image src={bq.image} alt={bq.name} fill className="object-cover" sizes="30vw" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted"><ImageIcon className="w-8 h-8" /></div>
                    )}
                    {bq.featured && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase">Featured</span>
                    )}
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Up to {bq.capacity} guests
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-heading font-semibold text-ink text-base mb-2 group-hover:text-primary transition-colors">{bq.name}</h3>
                    <span className="text-muted text-xs flex items-center gap-1 mb-4"><MapPin className="w-3.5 h-3.5 shrink-0" /> {bq.location}</span>
                    <p className="text-muted text-xs mb-4 line-clamp-2">{bq.description}</p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] text-muted block uppercase font-bold">Veg Plate</span>
                          <span className="font-heading font-black text-sm text-primary">₹{bq.pricePerPlateVeg}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-muted block uppercase font-bold">Non-Veg Plate</span>
                          <span className="font-heading font-black text-sm text-primary">₹{bq.pricePerPlateNonVeg}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(bq)} className="p-2 bg-surface hover:bg-primary-light text-ink hover:text-primary rounded-xl border border-border/50 cursor-pointer transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(bq.id)} className="p-2 bg-surface hover:bg-red-50 text-ink hover:text-red-500 rounded-xl border border-border/50 cursor-pointer transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {modalOpen && currentBq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border max-w-lg w-full shadow-2xl flex flex-col">
            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-white z-10">
              <h2 className="font-heading font-bold text-lg text-ink">{currentBq.id ? "Edit Banquet Details" : "Add New Banquet"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-surface rounded-lg text-muted cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Banquet Venue Name *</label>
                <input type="text" name="name" required value={currentBq.name} onChange={handleInputChange} placeholder="e.g. Royal Celebration Palace" className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Venue Location Address *</label>
                <input type="text" name="location" required value={currentBq.location} onChange={handleInputChange} placeholder="e.g. Bailey Road, Patna, Bihar" className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                {errors.location && <p className="text-red-500 text-[10px] mt-1">{errors.location}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Seating Capacity (pax) *</label>
                  <input type="number" name="capacity" required value={currentBq.capacity} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                  {errors.capacity && <p className="text-red-500 text-[10px] mt-1">{errors.capacity}</p>}
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Image URL</label>
                  <input type="text" name="image" value={currentBq.image} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Veg Plate Rate (₹) *</label>
                  <input type="number" name="pricePerPlateVeg" required value={currentBq.pricePerPlateVeg || ""} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                  {errors.pricePerPlateVeg && <p className="text-red-500 text-[10px] mt-1">{errors.pricePerPlateVeg}</p>}
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Non-Veg Rate (₹) *</label>
                  <input type="number" name="pricePerPlateNonVeg" required value={currentBq.pricePerPlateNonVeg || ""} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input type="checkbox" id="featured" name="featured" checked={currentBq.featured || false} onChange={handleInputChange} className="w-4 h-4 accent-primary cursor-pointer" />
                <label htmlFor="featured" className="text-xs font-semibold text-ink cursor-pointer flex items-center gap-1.5">Feature on venue sections</label>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Venue Description *</label>
                <textarea name="description" rows={3} required value={currentBq.description} onChange={handleInputChange} placeholder="Describe stage sizes, AC setups, and overall venue beauty..." className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none resize-none" />
                {errors.description && <p className="text-red-500 text-[10px] mt-1">{errors.description}</p>}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer text-xs">
                  <Save className="w-4 h-4" /> Save Banquet Venue
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 border border-border text-ink font-semibold rounded-xl hover:bg-surface cursor-pointer transition-colors text-xs">
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
