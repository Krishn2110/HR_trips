"use client";

import { useState } from "react";
import {
  Calendar,
  Users,
  Utensils,
  CheckCircle2,
  AlertCircle,
  Loader2,
  IndianRupee,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { submitBanquetBooking } from "@/lib/api";

interface BanquetBookingFormProps {
  banquet: {
    id: string | number;
    name: string;
    city?: string;
    capacity?: number;
    pricePerPlateVeg?: number;
    price_per_plate_veg?: number;
    pricePerPlateNonVeg?: number;
    price_per_plate_non_veg?: number;
  };
}

export default function BanquetBookingForm({ banquet }: BanquetBookingFormProps) {
  const vegRate = Number(banquet.price_per_plate_veg ?? banquet.pricePerPlateVeg ?? 800);
  const nonVegRate = Number(banquet.price_per_plate_non_veg ?? banquet.pricePerPlateNonVeg ?? 1000);
  const maxCapacity = Number(banquet.capacity || 1000);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    event_type: "Marriage / Wedding",
    event_date: "",
    guest_count: 200,
    food_preference: "Veg & Non-Veg",
    special_requests: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingRef, setBookingRef] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "guest_count" ? Math.max(1, Number(value)) : value,
    }));
  };

  // Calculate estimated total
  const calculateEstimatedTotal = () => {
    const guests = formData.guest_count || 1;
    if (formData.food_preference === "Veg Only") {
      return guests * vegRate;
    } else if (formData.food_preference === "Veg & Non-Veg") {
      return guests * (nonVegRate || vegRate);
    } else {
      // Venue Only base calculation
      return Math.max(30000, guests * 150);
    }
  };

  const estimatedTotal = calculateEstimatedTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const payload = {
        banquet_id: banquet.id,
        banquet_name: banquet.name,
        city: banquet.city || "India",
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        event_type: formData.event_type,
        event_date: formData.event_date,
        guest_count: Number(formData.guest_count),
        food_preference: formData.food_preference,
        special_requests: formData.special_requests,
        total_amount: estimatedTotal,
        payment_status: "pending" as const,
        booking_status: "pending" as const,
      };

      // 1. Submit local/API state
      const newBooking = await submitBanquetBooking(payload);

      // 2. Remote backend sync
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const endpoint = apiUrl.endsWith("/")
          ? `${apiUrl}banquet-bookings/create.php`
          : `${apiUrl}/banquet-bookings/create.php`;

        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.log("Remote backend notice:", err);
      }

      setBookingRef(String(newBooking.id));
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.message || "Failed to submit booking request.");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white rounded-3xl border border-emerald-200 p-8 text-center shadow-xl shadow-emerald-500/5 space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="font-heading font-bold text-2xl text-ink">
          Booking Request Received!
        </h3>
        <p className="text-muted text-xs leading-relaxed max-w-sm mx-auto">
          Your reservation request for <strong>{banquet.name}</strong> has been logged with reference ID <span className="font-mono font-bold text-ink">#{bookingRef}</span>.
        </p>

        <div className="bg-surface rounded-2xl p-4 text-xs text-left space-y-2 border border-border/50 max-w-xs mx-auto">
          <div className="flex justify-between">
            <span className="text-muted">Event Date:</span>
            <span className="font-bold text-ink">{formData.event_date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Event Type:</span>
            <span className="font-bold text-ink">{formData.event_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Guest Count:</span>
            <span className="font-bold text-ink">{formData.guest_count} Guests</span>
          </div>
          <div className="flex justify-between border-t border-border/50 pt-2">
            <span className="text-muted">Estimated Cost:</span>
            <span className="font-bold text-primary">₹{estimatedTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <p className="text-[11px] text-muted max-w-xs mx-auto">
          Our venue coordinator will call you within 2 hours to confirm hall slot availability and finalize stage decorations.
        </p>

        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          Book Another Date
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-border/60 shadow-xl shadow-black/5 p-6 sm:p-8 space-y-6">
      <div className="border-b border-border/40 pb-4">
        <span className="text-[11px] font-bold text-primary uppercase tracking-wider block mb-1">
          Instant Venue Booking
        </span>
        <h3 className="font-heading font-bold text-xl text-ink">
          Reserve {banquet.name}
        </h3>
        <p className="text-muted text-xs mt-1">
          Lock your celebration date with zero advance cancellation penalties.
        </p>
      </div>

      {status === "error" && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Event Type & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-muted mb-1.5">
              Event Type *
            </label>
            <select
              name="event_type"
              required
              value={formData.event_type}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none cursor-pointer"
            >
              <option value="Marriage / Wedding">Marriage / Wedding</option>
              <option value="Reception Party">Reception Party</option>
              <option value="Engagement Ceremony">Engagement Ceremony</option>
              <option value="Birthday Party">Birthday Party</option>
              <option value="Anniversary Celebration">Anniversary Celebration</option>
              <option value="Corporate Seminar / Conference">Corporate Seminar / Conference</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-muted mb-1.5">
              Event Date *
            </label>
            <input
              type="date"
              name="event_date"
              required
              min={new Date().toISOString().split("T")[0]}
              value={formData.event_date}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none"
            />
          </div>
        </div>

        {/* Guests & Catering Preference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-muted mb-1.5">
              Expected Guests * (Max {maxCapacity})
            </label>
            <input
              type="number"
              name="guest_count"
              required
              min={50}
              max={maxCapacity * 1.5}
              value={formData.guest_count}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted mb-1.5">
              Catering Preference *
            </label>
            <select
              name="food_preference"
              required
              value={formData.food_preference}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none cursor-pointer"
            >
              <option value="Veg Only">Veg Only Catering (₹{vegRate}/plate)</option>
              {nonVegRate > 0 && (
                <option value="Veg & Non-Veg">Veg & Non-Veg Catering (₹{nonVegRate}/plate)</option>
              )}
              <option value="Venue Only">Venue Only (No Food)</option>
            </select>
          </div>
        </div>

        {/* Customer Contact */}
        <div className="space-y-3 pt-2">
          <div>
            <label className="block font-semibold text-muted mb-1.5">
              Your Full Name *
            </label>
            <input
              type="text"
              name="customer_name"
              required
              placeholder="e.g. Ramesh Kumar"
              value={formData.customer_name}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted mb-1.5">
                Contact Phone Number *
              </label>
              <input
                type="tel"
                name="customer_phone"
                required
                placeholder="10-digit mobile number"
                value={formData.customer_phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted mb-1.5">
                Email Address (For Confirmation) *
              </label>
              <input
                type="email"
                name="customer_email"
                required
                placeholder="name@example.com"
                value={formData.customer_email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-muted mb-1.5">
              Special Requests (Optional)
            </label>
            <textarea
              name="special_requests"
              rows={2}
              placeholder="e.g. Stage floral decoration, DJ sound license, mandap setup..."
              value={formData.special_requests}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-border focus:border-primary outline-none resize-none"
            />
          </div>
        </div>

        {/* Estimated Price Summary Box */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
              Estimated Venue Amount
            </span>
            <span className="text-xs text-muted">
              Based on {formData.guest_count} guests • {formData.food_preference}
            </span>
          </div>
          <div className="text-right">
            <div className="font-heading font-black text-xl text-primary flex items-center justify-end">
              <IndianRupee className="w-4 h-4" />
              {estimatedTotal.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-muted">Zero advance required today</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold rounded-xl text-xs shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Confirming Booking Slot...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Request Banquet Reservation
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-muted text-[11px] pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>HR Trips Verified Venue Partner Guarantee</span>
        </div>
      </form>
    </div>
  );
}
