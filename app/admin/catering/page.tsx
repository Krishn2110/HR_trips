"use client";

import { useEffect, useState } from "react";
import { getCateringOptions, createOrUpdateCatering, deleteCatering } from "@/lib/api";
import type { CateringOption } from "@/lib/types";
import { Plus, Edit2, Trash2, Utensils, X, Image as ImageIcon, Save } from "lucide-react";
import Image from "next/image";
import BookingRequestsSection from "@/components/admin/BookingRequestsSection";

export default function AdminCateringPage() {
  const [catering, setCatering] = useState<CateringOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentCat, setCurrentCat] = useState<Partial<CateringOption> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"catalog" | "bookings">("catalog");

  const loadCatering = async () => {
    setIsLoading(true);
    try {
      const data = await getCateringOptions();
      setCatering(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatering();
  }, []);

  const openAddModal = () => {
    setCurrentCat({
      packageName: "",
      cuisineType: "Veg Only",
      pricePerPlate: 500,
      minimumGuests: 50,
      menuItems: ["Paneer Butter Masala", "Dal Makhani", "Jeera Rice"],
      image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=1920&q=90",
      description: "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (cat: CateringOption) => {
    setCurrentCat(cat);
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this catering package?")) return;
    try {
      const success = await deleteCatering(id);
      if (success) {
        setCatering(prev => prev.filter(c => c.id !== id));
      }
    } catch (e) {
      alert("Failed to delete catering option");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let targetValue: any = value;
    if (name === "pricePerPlate" || name === "minimumGuests") {
      targetValue = value ? Number(value) : 0;
    }
    setCurrentCat(prev => prev ? { ...prev, [name]: targetValue } : null);
  };

  const handleMenuChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const items = e.target.value.split("\n").filter(i => i.trim() !== "");
    setCurrentCat(prev => prev ? { ...prev, menuItems: items } : null);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!currentCat?.packageName?.trim()) errs.packageName = "Package name is required";
    if (!currentCat?.pricePerPlate || currentCat.pricePerPlate <= 0) errs.pricePerPlate = "Plate price is required";
    if (!currentCat?.menuItems || currentCat.menuItems.length === 0) errs.menuItems = "At least one menu item is required";
    if (!currentCat?.description?.trim() || currentCat.description.length < 10) errs.description = "Description is required";
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const saved = await createOrUpdateCatering(currentCat as any);
      if (saved) {
        loadCatering();
        setModalOpen(false);
      }
    } catch (e) {
      alert("Error saving catering option");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink">
            Manage Catering Packages
          </h1>
          <p className="text-muted text-xs mt-1">
            Create, modify, and delete catering menus and per-plate pricing options.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-xs font-semibold hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Menu Plan
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
        <BookingRequestsSection filterType="catering" />
      ) : (
        <>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
              <p className="text-muted text-xs">Loading menus...</p>
            </div>
          ) : catering.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <Utensils className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No catering menus</h3>
              <p className="text-muted text-xs max-w-xs mx-auto mt-1 mb-6">Create your first food catering package to display to customers.</p>
              <button onClick={openAddModal} className="px-5 py-3 bg-primary text-white text-xs font-semibold rounded-xl cursor-pointer">
                Create Menu
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catering.map((cat) => (
                <div key={cat.id} className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                  <div className="relative h-48 bg-surface">
                    {cat.image ? (
                      <Image src={cat.image} alt={cat.packageName} fill className="object-cover" sizes="30vw" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted"><ImageIcon className="w-8 h-8" /></div>
                    )}
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 text-white text-[10px] font-bold rounded-full">{cat.cuisineType}</span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-heading font-semibold text-ink text-base mb-2 group-hover:text-primary transition-colors">{cat.packageName}</h3>
                    <p className="text-muted text-xs mb-4 line-clamp-2">{cat.description}</p>
                    
                    <div className="mb-4">
                      <span className="text-[10px] uppercase font-bold text-muted block mb-1">Sample Menu Items</span>
                      <div className="flex flex-wrap gap-1">
                        {cat.menuItems.slice(0, 4).map((item, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-surface text-ink text-[10px] rounded-md border border-border">{item}</span>
                        ))}
                        {cat.menuItems.length > 4 && <span className="text-[10px] text-muted">+{cat.menuItems.length - 4} more</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                      <div>
                        <span className="text-[10px] text-muted block">Min {cat.minimumGuests} Guests</span>
                        <span className="font-heading font-black text-lg text-primary">₹{cat.pricePerPlate}/plate</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(cat)} className="p-2 bg-surface hover:bg-primary-light text-ink hover:text-primary rounded-xl border border-border/50 cursor-pointer transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 bg-surface hover:bg-red-50 text-ink hover:text-red-500 rounded-xl border border-border/50 cursor-pointer transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {modalOpen && currentCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border max-w-lg w-full shadow-2xl flex flex-col">
            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-white z-10">
              <h2 className="font-heading font-bold text-lg text-ink">{currentCat.id ? "Edit Catering Details" : "Add Menu Plan"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-surface rounded-lg text-muted cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Package / Menu Name *</label>
                <input type="text" name="packageName" required value={currentCat.packageName} onChange={handleInputChange} placeholder="e.g. Royal Indian Feast (Silver Tier)" className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                {errors.packageName && <p className="text-red-500 text-[10px] mt-1">{errors.packageName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Cuisine Type</label>
                  <select name="cuisineType" value={currentCat.cuisineType} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none cursor-pointer">
                    <option value="Veg Only">Veg Only</option>
                    <option value="Non-Veg Special">Non-Veg Special</option>
                    <option value="Multi-Cuisine">Multi-Cuisine</option>
                    <option value="South Indian">South Indian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Price per Plate (₹) *</label>
                  <input type="number" name="pricePerPlate" required value={currentCat.pricePerPlate || ""} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                  {errors.pricePerPlate && <p className="text-red-500 text-[10px] mt-1">{errors.pricePerPlate}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Min Guests Requirement *</label>
                  <input type="number" name="minimumGuests" required value={currentCat.minimumGuests} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Image URL</label>
                  <input type="text" name="image" value={currentCat.image} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Menu Items (One per line) *</label>
                <textarea rows={4} required value={currentCat.menuItems?.join("\n")} onChange={handleMenuChange} placeholder="e.g.&#10;Paneer Tikka Masala&#10;Dal Makhani&#10;Rumali Naan&#10;Gulab Jamun" className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none resize-none font-mono" />
                {errors.menuItems && <p className="text-red-500 text-[10px] mt-1">{errors.menuItems}</p>}
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Short Description *</label>
                <textarea name="description" rows={2} required value={currentCat.description} onChange={handleInputChange} placeholder="Describe dining styles (Buffet, Table-service, live-counters)..." className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none resize-none" />
                {errors.description && <p className="text-red-500 text-[10px] mt-1">{errors.description}</p>}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer text-xs">
                  <Save className="w-4 h-4" /> Save Catering Package
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
