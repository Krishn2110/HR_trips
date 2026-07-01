"use client";

import { useEffect, useState } from "react";
import { getTicketingOptions, createOrUpdateTicket, deleteTicket } from "@/lib/api";
import type { TicketOption } from "@/lib/types";
import { Plus, Edit2, Trash2, Ticket, X, Save } from "lucide-react";
import BookingRequestsSection from "@/components/admin/BookingRequestsSection";

export default function AdminTicketingPage() {
  const [tickets, setTickets] = useState<TicketOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTkt, setCurrentTkt] = useState<Partial<TicketOption> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"catalog" | "bookings">("catalog");

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await getTicketingOptions();
      setTickets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const openAddModal = () => {
    setCurrentTkt({
      category: "Flight Tickets",
      provider: "Commercial Airlines Support",
      priceRange: "Service fee ₹100",
      supportLevel: "24/7 Priority Emergency Support",
      description: "",
      features: ["Instant Cancellation", "WhatsApp E-Ticket Delivery"],
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (tkt: TicketOption) => {
    setCurrentTkt(tkt);
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ticketing option?")) return;
    try {
      const success = await deleteTicket(id);
      if (success) {
        setTickets(prev => prev.filter(t => t.id !== id));
      }
    } catch (e) {
      alert("Failed to delete ticketing option");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentTkt(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleFeaturesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const list = e.target.value.split("\n").filter(f => f.trim() !== "");
    setCurrentTkt(prev => prev ? { ...prev, features: list } : null);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!currentTkt?.provider?.trim()) errs.provider = "Service Provider details are required";
    if (!currentTkt?.priceRange?.trim()) errs.priceRange = "Price range details are required";
    if (!currentTkt?.description?.trim() || currentTkt.description.length < 10) errs.description = "Short description is required";
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const saved = await createOrUpdateTicket(currentTkt as any);
      if (saved) {
        loadTickets();
        setModalOpen(false);
      }
    } catch (e) {
      alert("Error saving ticketing option");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink">
            Manage Ticketing & Passes
          </h1>
          <p className="text-muted text-xs mt-1">
            Create, modify, and delete booking services for flights, trains, and buses.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-xs font-semibold hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Service Option
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
        <BookingRequestsSection filterType="ticketing" />
      ) : (
        <>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
              <p className="text-muted text-xs">Loading services...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <Ticket className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No services found</h3>
              <p className="text-muted text-xs max-w-xs mx-auto mt-1 mb-6">Create your first ticketing configuration to display to customers.</p>
              <button onClick={openAddModal} className="px-5 py-3 bg-primary text-white text-xs font-semibold rounded-xl cursor-pointer">
                Create Option
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tickets.map((tkt) => (
                <div key={tkt.id} className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden p-6 flex flex-col group hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 bg-primary-light text-primary text-[10px] font-bold rounded-full uppercase">{tkt.category}</span>
                    <span className="text-xs text-muted font-medium">{tkt.priceRange}</span>
                  </div>
                  <h3 className="font-heading font-semibold text-ink text-base mb-2 group-hover:text-primary transition-colors">{tkt.provider}</h3>
                  <p className="text-muted text-xs mb-4">{tkt.description}</p>
                  
                  <div className="mb-4 flex-1">
                    <span className="text-[10px] uppercase font-bold text-muted block mb-1">Key features</span>
                    <ul className="space-y-1">
                      {tkt.features.map((feat, idx) => (
                        <li key={idx} className="text-xs text-ink flex items-center gap-1.5">• {feat}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                    <span className="text-[10px] text-muted font-semibold">Support: {tkt.supportLevel}</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(tkt)} className="p-2 bg-surface hover:bg-primary-light text-ink hover:text-primary rounded-xl border border-border/50 cursor-pointer transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(tkt.id)} className="p-2 bg-surface hover:bg-red-50 text-ink hover:text-red-500 rounded-xl border border-border/50 cursor-pointer transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {modalOpen && currentTkt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border max-w-lg w-full shadow-2xl flex flex-col">
            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-white z-10">
              <h2 className="font-heading font-bold text-lg text-ink">{currentTkt.id ? "Edit Service details" : "Add Service option"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-surface rounded-lg text-muted cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Service Category</label>
                <select name="category" value={currentTkt.category} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none cursor-pointer">
                  <option value="Flight Tickets">Flight Tickets</option>
                  <option value="Train Tickets">Train Tickets</option>
                  <option value="Bus Passes">Bus Passes</option>
                  <option value="Tour Permits">Tour Permits</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Service / Provider Title *</label>
                <input type="text" name="provider" required value={currentTkt.provider} onChange={handleInputChange} placeholder="e.g. Domestic Air Travel Bookings" className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                {errors.provider && <p className="text-red-500 text-[10px] mt-1">{errors.provider}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Service Fees details *</label>
                  <input type="text" name="priceRange" required value={currentTkt.priceRange} onChange={handleInputChange} placeholder="e.g. ₹150 Convenience fee" className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                  {errors.priceRange && <p className="text-red-500 text-[10px] mt-1">{errors.priceRange}</p>}
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Support Level</label>
                  <input type="text" name="supportLevel" value={currentTkt.supportLevel} onChange={handleInputChange} placeholder="e.g. 24/7 Priority Emergency Help" className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Features list (One per line)</label>
                <textarea rows={3} value={currentTkt.features?.join("\n")} onChange={handleFeaturesChange} placeholder="e.g.&#10;Instant PNR Generation&#10;WhatsApp Seat Selection" className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none resize-none font-mono" />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">Short Description *</label>
                <textarea name="description" rows={3} required value={currentTkt.description} onChange={handleInputChange} placeholder="Brief details about booking schedules and permissions..." className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none resize-none" />
                {errors.description && <p className="text-red-500 text-[10px] mt-1">{errors.description}</p>}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer text-xs">
                  <Save className="w-4 h-4" /> Save Service
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
