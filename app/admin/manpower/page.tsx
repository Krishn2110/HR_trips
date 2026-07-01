"use client";

import { useEffect, useState } from "react";
import { getManpowerOptions, createOrUpdateManpower, deleteManpower } from "@/lib/api";
import type { ManpowerOption } from "@/lib/types";
import { Plus, Edit2, Trash2, Briefcase, X, Save } from "lucide-react";
import BookingRequestsSection from "@/components/admin/BookingRequestsSection";

export default function AdminManpowerPage() {
  const [manpower, setManpower] = useState<ManpowerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMan, setCurrentMan] = useState<Partial<ManpowerOption> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"catalog" | "bookings">("catalog");

  const loadManpower = async () => {
    setIsLoading(true);
    try {
      const data = await getManpowerOptions();
      setManpower(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadManpower();
  }, []);

  const openAddModal = () => {
    setCurrentMan({
      title: "",
      category: "Security Services",
      pricePerHour: 150,
      description: "",
      qualifications: ["Vetted Background", "Vigorous Training"],
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (man: ManpowerOption) => {
    setCurrentMan(man);
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this manpower config?")) return;
    try {
      const success = await deleteManpower(id);
      if (success) {
        setManpower(prev => prev.filter(m => m.id !== id));
      }
    } catch (e) {
      alert("Failed to delete manpower category");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let targetValue: any = value;
    if (name === "pricePerHour") {
      targetValue = value ? Number(value) : 0;
    }
    setCurrentMan(prev => prev ? { ...prev, [name]: targetValue } : null);
  };

  const handleQualificationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const list = e.target.value.split("\n").filter(q => q.trim() !== "");
    setCurrentMan(prev => prev ? { ...prev, qualifications: list } : null);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!currentMan?.title?.trim()) errs.title = "Manpower staff title is required";
    if (!currentMan?.pricePerHour || currentMan.pricePerHour <= 0) errs.pricePerHour = "Valid rate is required";
    if (!currentMan?.description?.trim() || currentMan.description.length < 10) errs.description = "Short description is required";
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const saved = await createOrUpdateManpower(currentMan as any);
      if (saved) {
        loadManpower();
        setModalOpen(false);
      }
    } catch (e) {
      alert("Error saving manpower option");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink">
            Manage Manpower Services
          </h1>
          <p className="text-muted text-xs mt-1">
            Create, modify, and delete manpower options (security, housekeeping, catering staff).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-xs font-semibold hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Staff Role
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
        <BookingRequestsSection filterType="manpower" />
      ) : (
        <>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
              <p className="text-muted text-xs">Loading manpower options...</p>
            </div>
          ) : manpower.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <Briefcase className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No staff roles found</h3>
              <p className="text-muted text-xs max-w-xs mx-auto mt-1 mb-6">Create your first staff category config to display to customers.</p>
              <button onClick={openAddModal} className="px-5 py-3 bg-primary text-white text-xs font-semibold rounded-xl cursor-pointer">
                Create Role
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {manpower.map((man) => (
                <div key={man.id} className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden p-6 flex flex-col group hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 bg-primary-light text-primary text-[10px] font-bold rounded-full uppercase">{man.category}</span>
                    <span className="text-xs font-bold text-primary">₹{man.pricePerHour}/hour</span>
                  </div>
                  <h3 className="font-heading font-semibold text-ink text-base mb-2 group-hover:text-primary transition-colors">{man.title}</h3>
                  <p className="text-muted text-xs mb-4">{man.description}</p>
                  
                  <div className="mb-4 flex-1">
                    <span className="text-[10px] uppercase font-bold text-muted block mb-1">Role requirements</span>
                    <ul className="space-y-1">
                      {man.qualifications.map((qual, idx) => (
                        <li key={idx} className="text-xs text-ink flex items-center gap-1.5">• {qual}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                    <span className="text-[10px] text-muted font-semibold">Standard hourly billing rates</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(man)} className="p-2 bg-surface hover:bg-primary-light text-ink hover:text-primary rounded-xl border border-border/50 cursor-pointer transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(man.id)} className="p-2 bg-surface hover:bg-red-50 text-ink hover:text-red-500 rounded-xl border border-border/50 cursor-pointer transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {modalOpen && currentMan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border max-w-lg w-full shadow-2xl flex flex-col">
            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-white z-10">
              <h2 className="font-heading font-bold text-lg text-ink">{currentMan.id ? "Edit Staff Role" : "Add Staff Role"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-surface rounded-lg text-muted cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Manpower Category</label>
                <select name="category" value={currentMan.category} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none cursor-pointer">
                  <option value="Security Services">Security Services</option>
                  <option value="Housekeeping Services">Housekeeping Services</option>
                  <option value="Event Coordinators">Event Coordinators</option>
                  <option value="Catering Staff">Catering Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Staff Role Title *</label>
                <input type="text" name="title" required value={currentMan.title} onChange={handleInputChange} placeholder="e.g. Professional Bouncers / Event Guards" className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                {errors.title && <p className="text-red-500 text-[10px] mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Hourly Billing Price (₹) *</label>
                <input type="number" name="pricePerHour" required value={currentMan.pricePerHour || ""} onChange={handleInputChange} placeholder="e.g. 180" className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                {errors.pricePerHour && <p className="text-red-500 text-[10px] mt-1">{errors.pricePerHour}</p>}
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Staff Qualifications (One per line)</label>
                <textarea rows={3} value={currentMan.qualifications?.join("\n")} onChange={handleQualificationsChange} placeholder="e.g.&#10;Vetted police verification&#10;Good English communication" className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none resize-none font-mono" />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Short Role Description *</label>
                <textarea name="description" rows={3} required value={currentMan.description} onChange={handleInputChange} placeholder="Describe staff experience, duty hours coverage details..." className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none resize-none" />
                {errors.description && <p className="text-red-500 text-[10px] mt-1">{errors.description}</p>}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer text-xs">
                  <Save className="w-4 h-4" /> Save Staff Role
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
