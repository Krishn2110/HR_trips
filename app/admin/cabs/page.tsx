"use client";

import { useEffect, useState } from "react";
import { getCabs, createOrUpdateCab, deleteCab } from "@/lib/api";
import type { Cab } from "@/lib/types";
import { Plus, Edit2, Trash2, Users, Car, X, Image as ImageIcon, Save } from "lucide-react";
import Image from "next/image";
import BookingRequestsSection from "@/components/admin/BookingRequestsSection";

export default function AdminCabsPage() {
  const [cabs, setCabs] = useState<Cab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentCab, setCurrentCab] = useState<Partial<Cab> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"catalog" | "bookings">("catalog");

  const loadCabs = async () => {
    setIsLoading(true);
    try {
      const data = await getCabs();
      setCabs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCabs();
  }, []);

  const openAddModal = () => {
    setCurrentCab({
      vehicleName: "",
      vehicleType: "Sedan",
      pricePerKm: 12,
      capacity: 4,
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1920&q=90",
      description: "",
      featured: false,
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (cab: Cab) => {
    setCurrentCab(cab);
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cab option?")) return;
    try {
      const success = await deleteCab(id);
      if (success) {
        setCabs(prev => prev.filter(c => c.id !== id));
      }
    } catch (e) {
      alert("Failed to delete cab");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let targetValue: any = value;
    if (type === "checkbox") {
      targetValue = (e.target as HTMLInputElement).checked;
    } else if (name === "pricePerKm" || name === "capacity") {
      targetValue = value ? Number(value) : 0;
    }
    setCurrentCab(prev => prev ? { ...prev, [name]: targetValue } : null);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!currentCab?.vehicleName?.trim()) errs.vehicleName = "Vehicle name is required";
    if (!currentCab?.pricePerKm || currentCab.pricePerKm <= 0) errs.pricePerKm = "Valid price per km is required";
    if (!currentCab?.capacity || currentCab.capacity <= 0) errs.capacity = "Capacity is required";
    if (!currentCab?.description?.trim() || currentCab.description.length < 10) errs.description = "Description must be at least 10 chars";
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const saved = await createOrUpdateCab(currentCab as any);
      if (saved) {
        loadCabs();
        setModalOpen(false);
      }
    } catch (e) {
      alert("Error saving cab");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink">
            Manage Cab Fleet
          </h1>
          <p className="text-muted text-xs mt-1">
            Create, modify, and delete cabs available in your local and outstation taxi fleet.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-xs font-semibold hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Cab
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
        <BookingRequestsSection filterType="cabs" />
      ) : (
        <>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
              <p className="text-muted text-xs">Loading fleet...</p>
            </div>
          ) : cabs.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <Car className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No cabs found</h3>
              <p className="text-muted text-xs max-w-xs mx-auto mt-1 mb-6">Create your first cab option to display to customers.</p>
              <button onClick={openAddModal} className="px-5 py-3 bg-primary text-white text-xs font-semibold rounded-xl cursor-pointer">
                Create Cab
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cabs.map((cab) => (
                <div key={cab.id} className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                  <div className="relative h-48 bg-surface">
                    {cab.image ? (
                      <Image src={cab.image} alt={cab.vehicleName} fill className="object-cover" sizes="30vw" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted"><ImageIcon className="w-8 h-8" /></div>
                    )}
                    {cab.featured && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase">Featured</span>
                    )}
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 text-white text-[10px] font-bold rounded-full">{cab.vehicleType}</span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-heading font-semibold text-ink text-base mb-2 group-hover:text-primary transition-colors">{cab.vehicleName}</h3>
                    <p className="text-muted text-xs mb-4 line-clamp-2">{cab.description}</p>
                    
                    <div className="flex items-center gap-4 text-muted text-xs mb-4">
                      <span className="flex items-center gap-1"><Users className="w-4 h-4 text-primary" /> Max {cab.capacity} pax</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                      <div>
                        <span className="text-[10px] text-muted block">Rate starting from</span>
                        <span className="font-heading font-black text-lg text-primary">₹{cab.pricePerKm}/km</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(cab)} className="p-2 bg-surface hover:bg-primary-light text-ink hover:text-primary rounded-xl border border-border/50 cursor-pointer transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(cab.id)} className="p-2 bg-surface hover:bg-red-50 text-ink hover:text-red-500 rounded-xl border border-border/50 cursor-pointer transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {modalOpen && currentCab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border max-w-lg w-full shadow-2xl flex flex-col">
            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-white z-10">
              <h2 className="font-heading font-bold text-lg text-ink">{currentCab.id ? "Edit Cab Details" : "Add New Cab"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-surface rounded-lg text-muted cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Vehicle Name *</label>
                <input type="text" name="vehicleName" required value={currentCab.vehicleName} onChange={handleInputChange} placeholder="e.g. Swift Dzire AC" className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                {errors.vehicleName && <p className="text-red-500 text-[10px] mt-1">{errors.vehicleName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Vehicle Type</label>
                  <select name="vehicleType" value={currentCab.vehicleType} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none cursor-pointer">
                    <option value="Hatchback">Hatchback</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Traveller">Traveller</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Max Seating Capacity *</label>
                  <input type="number" name="capacity" required value={currentCab.capacity} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                  {errors.capacity && <p className="text-red-500 text-[10px] mt-1">{errors.capacity}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Rate per km (₹) *</label>
                  <input type="number" name="pricePerKm" required value={currentCab.pricePerKm || ""} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                  {errors.pricePerKm && <p className="text-red-500 text-[10px] mt-1">{errors.pricePerKm}</p>}
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Image URL</label>
                  <input type="text" name="image" value={currentCab.image} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input type="checkbox" id="featured" name="featured" checked={currentCab.featured || false} onChange={handleInputChange} className="w-4 h-4 accent-primary cursor-pointer" />
                <label htmlFor="featured" className="text-xs font-semibold text-ink cursor-pointer">Feature on taxi sections</label>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Description *</label>
                <textarea name="description" rows={3} required value={currentCab.description} onChange={handleInputChange} placeholder="Briefly describe the cab inclusions (AC, carrier space, outstation guidelines)..." className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none resize-none" />
                {errors.description && <p className="text-red-500 text-[10px] mt-1">{errors.description}</p>}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer text-xs">
                  <Save className="w-4 h-4" /> Save Cab Option
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
