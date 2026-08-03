"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GlassWater, ShieldCheck, CheckCircle2, UserCheck, ArrowRight, Phone, MessageCircle, Calendar, Users, MapPin, Loader2, AlertCircle } from "lucide-react";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { CONTACT } from "@/lib/constants";
import { submitBanquetBooking, getBanquetRegistrations } from "@/lib/api";
import LocationAutoSuggest from "@/components/shared/LocationAutoSuggest";

export default function BanquetBookingPage() {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    banquet_name: "Grand Palace Banquet",
    city: "Patna",
    event_type: "Marriage / Wedding",
    event_date: "",
    guest_count: 250,
    food_preference: "Veg & Non-Veg",
    special_requests: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      await submitBanquetBooking({
        banquet_id: 1,
        banquet_name: formData.banquet_name,
        city: formData.city,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        event_type: formData.event_type,
        event_date: formData.event_date,
        guest_count: Number(formData.guest_count),
        food_preference: formData.food_preference,
        special_requests: formData.special_requests,
        total_amount: 50000,
        payment_status: "pending",
        booking_status: "pending",
      });

      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banquet-bookings/create.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } catch (remoteErr) {
        console.log("Remote booking sync note:", remoteErr);
      }

      setStatus("success");
      setMessage("Banquet booking request submitted successfully!");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message || "Failed to submit booking request.");
    }
  };

  return (
    <>
      {/* Header Banner */}
      <div className="relative h-56 lg:h-64 flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1400&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        </div>
        <div className="container-wide relative z-10 pb-8">
          <h1
            style={{ color: "#ffffff" }}
            className="font-heading text-3xl lg:text-4xl font-bold !text-white mb-1"
          >
            Banquet Booking & Venue Network
          </h1>
          <p
            style={{ color: "rgba(255, 255, 255, 0.85)" }}
            className="text-sm lg:text-base !text-white/85"
          >
            Book luxury banquet halls for marriages, receptions, and corporate events or register your venue
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        <Breadcrumbs
          items={[
            { label: "Services", href: "/services" },
            { label: "Banquet Booking" },
          ]}
        />

        {/* BANQUET OWNER REGISTRATION HERO BANNER */}
        <div className="mt-8 bg-gradient-to-r from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-white/10">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-xs font-bold text-primary">
              <GlassWater className="w-3.5 h-3.5" /> BANQUET VENUE PARTNER PROGRAM
            </span>
            <h2
              style={{ color: "#ffffff" }}
              className="font-heading font-black text-2xl sm:text-3xl !text-white"
            >
              Own a Banquet Hall or Marriage Lawn? Register with HR Trips
            </h2>
            <p
              style={{ color: "rgba(255, 255, 255, 0.85)" }}
              className="!text-white/85 text-xs sm:text-sm leading-relaxed"
            >
              Join our network of verified banquet hall operators. Register your venue details (GST, Registration No, Fire Safety NOC, CCTV, Inspection Photos & Payout Bank info) for quick admin approval and receive event bookings.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/banquet-registration"
                className="px-6 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl text-xs hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center gap-2"
              >
                Register Your Banquet Hall Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/banquet-owner/login"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl text-xs transition-colors flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" /> Banquet Owner Portal Login
              </Link>
            </div>
          </div>
        </div>

        {/* SERVICE DETAILS & QUICK QUOTE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          {/* Main Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-border/50 p-6 lg:p-8">
              <h2 className="font-heading text-2xl font-bold text-ink mb-4">
                Service Overview
              </h2>
              <p className="text-muted text-sm sm:text-base leading-relaxed mb-6">
                Looking for the perfect venue for your wedding, reception, engagement, or corporate seminar? HR Trips partners with premier, admin-inspected banquet halls featuring air conditioning, luxury lighting, catering options, and spacious seating arrangements.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div className="flex items-start gap-3 p-4 bg-surface rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-semibold text-ink text-sm">
                      Strict Admin Inspection
                    </h4>
                    <p className="text-muted text-xs mt-1">
                      Every banquet undergoes Fire Safety NOC, CCTV camera, GST, and hygiene verification before listing.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-surface rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-semibold text-ink text-sm">
                      Custom Catering & Lighting
                    </h4>
                    <p className="text-muted text-xs mt-1">
                      Flexible per-plate pricing for Veg and Non-Veg menus with customized stage decorations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary-light/35 rounded-2xl p-6 lg:p-8 border border-primary/10">
              <h3 className="font-heading text-lg font-bold text-ink mb-2">
                Need Custom Event Catering or Multi-day Venue Package?
              </h3>
              <p className="text-muted text-sm mb-6">
                Contact our venue coordination team to get direct per-plate rates, hall availability dates, and customized arrangements.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white text-sm font-semibold rounded-xl hover:bg-[#20bd5a] hover:shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Enquiry
                </a>
                <a
                  href={`tel:${CONTACT.phone}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-ink border border-border text-sm font-semibold rounded-xl hover:border-primary hover:text-primary transition-all"
                >
                  <Phone className="w-4 h-4" /> Call Support
                </a>
              </div>
            </div>
          </div>

          {/* Quick Banquet Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-border/50 p-6 space-y-4 shadow-sm">
              <h3 className="font-heading font-semibold text-ink text-lg border-b border-border/50 pb-3">
                Reserve Banquet Hall
              </h3>
              
              {status === "success" ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-ink">Booking Request Submitted!</h4>
                  <p className="text-xs text-muted leading-relaxed">
                    We've logged your event date. Our team will contact you shortly to confirm hall availability and menu pricing.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {status === "error" && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-xs font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {message}
                    </div>
                  )}

                  <div className="space-y-3">
                    <input
                      type="text"
                      name="customer_name"
                      required
                      value={formData.customer_name}
                      onChange={handleChange}
                      placeholder="Your Full Name *"
                      className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
                    />
                    <input
                      type="email"
                      name="customer_email"
                      required
                      value={formData.customer_email}
                      onChange={handleChange}
                      placeholder="Email Address *"
                      className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
                    />
                    <input
                      type="tel"
                      name="customer_phone"
                      required
                      value={formData.customer_phone}
                      onChange={handleChange}
                      placeholder="Phone Number *"
                      className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <LocationAutoSuggest
                      type="city"
                      value={formData.city}
                      onChange={(val) => setFormData((prev) => ({ ...prev, city: val }))}
                      placeholder="Select Event City *"
                    />

                    <select
                      name="event_type"
                      required
                      value={formData.event_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none cursor-pointer"
                    >
                      <option value="Marriage / Wedding">Marriage / Wedding</option>
                      <option value="Reception Party">Reception Party</option>
                      <option value="Engagement Ceremony">Engagement Ceremony</option>
                      <option value="Birthday Party">Birthday Party</option>
                      <option value="Anniversary Party">Anniversary Party</option>
                      <option value="Corporate Event / Seminar">Corporate Event / Seminar</option>
                    </select>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-muted uppercase mb-1">Event Date *</label>
                        <input
                          type="date"
                          name="event_date"
                          required
                          value={formData.event_date}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted uppercase mb-1">Guest Count *</label>
                        <input
                          type="number"
                          name="guest_count"
                          required
                          min={50}
                          value={formData.guest_count}
                          onChange={handleChange}
                          placeholder="No. of guests"
                          className="w-full px-3 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
                        />
                      </div>
                    </div>

                    <select
                      name="food_preference"
                      required
                      value={formData.food_preference}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none cursor-pointer"
                    >
                      <option value="Veg Only">Veg Only Catering</option>
                      <option value="Veg & Non-Veg">Veg & Non-Veg Catering</option>
                      <option value="No Catering">Venue Only (No Catering)</option>
                    </select>

                    <textarea
                      name="special_requests"
                      rows={2}
                      value={formData.special_requests}
                      onChange={handleChange}
                      placeholder="Special requirements (Decorations, AC hall, etc.)..."
                      className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                      </>
                    ) : (
                      "Submit Banquet Request"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
