"use client";

import { useState } from "react";
import Link from "next/link";
import { Car, ShieldCheck, CheckCircle2, UserCheck, ArrowRight, Phone, MessageCircle, Loader2, AlertCircle } from "lucide-react";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { CONTACT } from "@/lib/constants";
import LocationAutoSuggest from "@/components/shared/LocationAutoSuggest";

export default function CabServicesPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pickup: "",
    dropoff: "",
    date: "",
    time: "",
    tripType: "",
    cabType: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cabs/create_booking.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const rawText = await response.text();
      let result;
      try {
        result = JSON.parse(rawText);
      } catch (err) {
        throw new Error("Invalid server response.");
      }

      if (response.ok && result.status === "success") {
        setStatus("success");
        setFormData({
          name: "", email: "", phone: "", pickup: "", dropoff: "", date: "", time: "", tripType: "", cabType: ""
        });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        throw new Error(result.message || "Failed to submit booking request.");
      }
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      setMessage(error?.message || "Network error. Please try again.");
    }
  };

  return (
    <>
      {/* Header Banner */}
      <div className="relative h-56 lg:h-64 flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1400&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        </div>
        <div className="container-wide relative z-10 pb-8">
          <h1 className="font-heading text-3xl lg:text-4xl font-bold !text-white mb-1">
            Cab Services & Partner Network
          </h1>
          <p className="text-sm lg:text-base !text-white/85">
            Book premium rides or register your cab fleet with HR Trips
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        <Breadcrumbs
          items={[
            { label: "Services", href: "/services" },
            { label: "Cab Services" },
          ]}
        />

        {/* CAB OWNER REGISTRATION HERO BANNER */}
        <div className="mt-8 bg-gradient-to-r from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-white/10">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-xs font-bold text-primary">
              <Car className="w-3.5 h-3.5" /> CAB OWNER PARTNER PROGRAM
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl !text-white">
              Own a Cab or Taxi Fleet? Register & Drive with HR Trips
            </h2>
            <p className="!text-white/85 text-xs sm:text-sm leading-relaxed">
              Join our network of verified cab operators. Register your vehicle details (Cab No, Engine/Chassis No, Insurance, Permit, DL, PUC, Photos & Bank info) for quick admin verification and receive steady trip bookings.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/cab-registration"
                className="px-6 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl text-xs hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center gap-2"
              >
                Register Your Cab Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/cab-owner/login"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl text-xs transition-colors flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" /> Cab Owner Portal Login
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
                Reliable airport transfers, city tours, local rentals, and outstation cab bookings. Our verified fleet of vehicles and experienced drivers ensure safe, comfortable journeys every time.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div className="flex items-start gap-3 p-4 bg-surface rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-semibold text-ink text-sm">
                      Admin Verified Fleets
                    </h4>
                    <p className="text-muted text-xs mt-1">
                      Every vehicle undergoes strict document & safety inspection (RC, Insurance, Permit & PUC).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-surface rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-semibold text-ink text-sm">
                      Transparent Pricing
                    </h4>
                    <p className="text-muted text-xs mt-1">
                      Fixed outstation rates, hourly rental plans, and zero hidden charges.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary-light/35 rounded-2xl p-6 lg:p-8 border border-primary/10">
              <h3 className="font-heading text-lg font-bold text-ink mb-2">
                Need a Custom Ride or Outstation Package?
              </h3>
              <p className="text-muted text-sm mb-6">
                Contact our customer support team to get direct rates, multi-city itineraries, and sedan/SUV cab availability.
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

          {/* Quick Ride Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-border/50 p-6 space-y-4 shadow-sm">
              <h3 className="font-heading font-semibold text-ink text-lg border-b border-border/50 pb-3">
                Quick Cab Booking
              </h3>
              
              {status === "success" ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-ink">Request Submitted!</h4>
                  <p className="text-xs text-muted leading-relaxed">
                    We've emailed you the details. Our team will contact you shortly to confirm the cab assignment and amount.
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
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Full Name *"
                      className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
                    />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address (For details) *"
                      className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
                    />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone Number *"
                      className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <LocationAutoSuggest
                        type="city"
                        value={formData.pickup}
                        onChange={(val) => setFormData((prev) => ({ ...prev, pickup: val }))}
                        placeholder="Pickup Location (e.g. Patna / Airport) *"
                      />
                    </div>
                    <div className="col-span-2">
                      <LocationAutoSuggest
                        type="city"
                        value={formData.dropoff}
                        onChange={(val) => setFormData((prev) => ({ ...prev, dropoff: val }))}
                        placeholder="Destination Location (e.g. Muzaffarpur) *"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-muted mb-1 ml-1 font-semibold">Pickup Date *</label>
                      <input
                        type="date"
                        name="date"
                        required
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-muted mb-1 ml-1 font-semibold">Pickup Time *</label>
                      <input
                        type="time"
                        name="time"
                        required
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <select
                      name="tripType"
                      required
                      value={formData.tripType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
                    >
                      <option value="">Trip Type *</option>
                      <option value="One Way">One Way</option>
                      <option value="Round Trip">Round Trip (Two Way)</option>
                    </select>

                    <select
                      name="cabType"
                      required
                      value={formData.cabType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
                    >
                      <option value="">Cab Type *</option>
                      <option value="Sedan (4 seats)">Sedan (4 seats)</option>
                      <option value="SUV (6 seats)">SUV (6 seats)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-3.5 mt-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-primary/20 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                  >
                    {status === "loading" ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                      "Submit Ride Request"
                    )}
                  </button>
                  <p className="text-[10px] text-center text-muted mt-2">
                    Our team will contact you to assign the cab and confirm the amount.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}