"use client";

import { useEffect, useState } from "react";
import { getHotels, createOrUpdateHotel, deleteHotel } from "@/lib/api";
import type { Hotel } from "@/lib/types";
import { Plus, Edit2, Trash2, MapPin, Star, X, Image as ImageIcon, Save } from "lucide-react";
import Image from "next/image";
import BookingRequestsSection from "@/components/admin/BookingRequestsSection";

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<Partial<Hotel> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"catalog" | "bookings">("catalog");

  const loadHotels = async () => {
    setIsLoading(true);
    try {
      const data = await getHotels();
      setHotels(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  const openAddModal = () => {
    setCurrentHotel({
      name: "",
      city: "",
      location: "",
      starRating: 3,
      startingPrice: 1500,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=90",
      overview: "",
      cancellationPolicy: "Free cancellation up to 24 hours before check-in.",
      amenities: ["Free WiFi", "AC Rooms", "Room Service", "Parking"],
      featured: false,
      roomTypes: [
        {
          name: "Standard Room",
          description: "Well-furnished standard room.",
          pricePerNight: 1500,
          maxGuests: 2,
          image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=90",
        }
      ]
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (hotel: Hotel) => {
    setCurrentHotel(hotel);
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hotel?")) return;
    try {
      const success = await deleteHotel(id);
      if (success) {
        setHotels(prev => prev.filter(h => h.id !== id));
      }
    } catch (e) {
      alert("Failed to delete hotel");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let targetValue: any = value;
    if (type === "checkbox") {
      targetValue = (e.target as HTMLInputElement).checked;
    } else if (name === "startingPrice" || name === "starRating") {
      targetValue = value ? Number(value) : 0;
    }
    setCurrentHotel(prev => prev ? { ...prev, [name]: targetValue } : null);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!currentHotel?.name?.trim()) errs.name = "Hotel name is required";
    if (!currentHotel?.city?.trim()) errs.city = "City is required";
    if (!currentHotel?.location?.trim()) errs.location = "Location address is required";
    if (!currentHotel?.startingPrice || currentHotel.startingPrice <= 0) errs.startingPrice = "Valid starting price is required";
    if (!currentHotel?.overview?.trim() || currentHotel.overview.length < 20) errs.overview = "Description must be at least 20 chars";
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const saved = await createOrUpdateHotel(currentHotel as any);
      if (saved) {
        loadHotels();
        setModalOpen(false);
      }
    } catch (e) {
      alert("Error saving hotel");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink">
            Manage Hotels
          </h1>
          <p className="text-muted text-xs mt-1">
            Create, modify, and delete active hotels listed on your public website.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-xs font-semibold hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Hotel
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
        <BookingRequestsSection filterType="hotels" />
      ) : (
        <>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
              <p className="text-muted text-xs">Loading hotels...</p>
            </div>
          ) : hotels.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <ImageIcon className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No hotels found</h3>
              <p className="text-muted text-xs max-w-xs mx-auto mt-1 mb-6">Create your first hotel to display to customers.</p>
              <button onClick={openAddModal} className="px-5 py-3 bg-primary text-white text-xs font-semibold rounded-xl cursor-pointer">
                Create Hotel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                  <div className="relative h-48 bg-surface">
                    {hotel.image ? (
                      <Image src={hotel.image} alt={hotel.name} fill className="object-cover" sizes="30vw" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted"><ImageIcon className="w-8 h-8" /></div>
                    )}
                    {hotel.featured && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase">Featured</span>
                    )}
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {hotel.starRating} Star
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-muted text-[10px] uppercase font-bold tracking-wider mb-1 block">{hotel.city}</span>
                    <h3 className="font-heading font-semibold text-ink text-base mb-2 group-hover:text-primary transition-colors">{hotel.name}</h3>
                    <span className="text-muted text-xs flex items-center gap-1 mb-4"><MapPin className="w-3.5 h-3.5 shrink-0" /> {hotel.location}</span>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                      <div>
                        <span className="text-[10px] text-muted block">Starting Price</span>
                        <span className="font-heading font-black text-lg text-primary">₹{hotel.startingPrice.toLocaleString("en-IN")}/night</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(hotel)} className="p-2 bg-surface hover:bg-primary-light text-ink hover:text-primary rounded-xl border border-border/50 cursor-pointer transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(hotel.id)} className="p-2 bg-surface hover:bg-red-50 text-ink hover:text-red-500 rounded-xl border border-border/50 cursor-pointer transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {modalOpen && currentHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-6 border-b border-border/50 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-heading font-bold text-lg text-ink">{currentHotel.id ? "Edit Hotel Details" : "Add New Hotel"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-surface rounded-lg text-muted cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">Hotel Name *</label>
                  <input type="text" name="name" required value={currentHotel.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                  {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">City *</label>
                  <input type="text" name="city" required value={currentHotel.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                  {errors.city && <p className="text-red-500 text-[10px] mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">Star Rating</label>
                  <select name="starRating" value={currentHotel.starRating} onChange={handleInputChange} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none cursor-pointer">
                    <option value={2}>2 Star</option>
                    <option value={3}>3 Star</option>
                    <option value={4}>4 Star</option>
                    <option value={5}>5 Star</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">Location Address *</label>
                  <input type="text" name="location" required value={currentHotel.location} onChange={handleInputChange} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                  {errors.location && <p className="text-red-500 text-[10px] mt-1">{errors.location}</p>}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">Starting Price (₹) *</label>
                  <input type="number" name="startingPrice" required value={currentHotel.startingPrice || ""} onChange={handleInputChange} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                  {errors.startingPrice && <p className="text-red-500 text-[10px] mt-1">{errors.startingPrice}</p>}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">Main Image URL</label>
                  <input type="text" name="image" value={currentHotel.image} onChange={handleInputChange} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 py-1">
                  <input type="checkbox" id="featured" name="featured" checked={currentHotel.featured || false} onChange={handleInputChange} className="w-4 h-4 accent-primary cursor-pointer" />
                  <label htmlFor="featured" className="text-xs font-semibold text-ink cursor-pointer">Mark as featured hotel</label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">Cancellation Policy</label>
                  <input type="text" name="cancellationPolicy" value={currentHotel.cancellationPolicy} onChange={handleInputChange} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">Overview Description *</label>
                  <textarea name="overview" rows={3} required value={currentHotel.overview} onChange={handleInputChange} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none resize-none" />
                  {errors.overview && <p className="text-red-500 text-[10px] mt-1">{errors.overview}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-border/50 sticky bottom-0 bg-white z-10">
                <button type="submit" className="flex-1 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer text-xs">
                  <Save className="w-4 h-4" /> Save Hotel
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3.5 border border-border text-ink font-semibold rounded-xl hover:bg-surface cursor-pointer transition-colors text-xs">
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
