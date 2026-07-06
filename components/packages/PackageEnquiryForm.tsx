"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Loader2, CheckCircle2, Ticket } from "lucide-react";
import { enquirySchema, type EnquiryFormData } from "@/lib/validators";
import type { PricingTier } from "@/lib/types";

interface PackageEnquiryFormProps {
  packageId: string | number;
  packageTitle: string;
  pricing: PricingTier[];
}

export default function PackageEnquiryForm({
  packageId,
  packageTitle,
  pricing,
}: PackageEnquiryFormProps) {
  const [activeTab, setActiveTab] = useState<"enquiry" | "booking">("enquiry");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(0);

  // Quick Enquiry Form
  const {
    register: registerEnquiry,
    handleSubmit: handleEnquirySubmit,
    reset: resetEnquiry,
    formState: { errors: enquiryErrors },
  } = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      paxCount: 1,
    },
  });

  // Direct Booking Form (Manual fields validation)
  const [bookingFields, setBookingFields] = useState({
    name: "",
    phone: "",
    email: "",
    travelDate: "",
    guests: 1,
    specialRequests: "",
  });
  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>({});

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingFields((prev) => ({
      ...prev,
      [name]: name === "guests" ? Number(value) : value,
    }));
  };

  const validateBooking = () => {
    const errs: Record<string, string> = {};
    if (!bookingFields.name.trim()) errs.name = "Name is required";
    if (!bookingFields.phone.trim() || bookingFields.phone.length < 10) errs.phone = "Valid phone is required";
    if (!bookingFields.email.trim() || !bookingFields.email.includes("@")) errs.email = "Valid email is required";
    if (!bookingFields.travelDate) errs.travelDate = "Please pick a date";
    if (bookingFields.guests <= 0) errs.guests = "At least 1 guest required";

    setBookingErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // --- API: SUBMIT ENQUIRY ---
  const onEnquirySubmit = async (data: EnquiryFormData) => {
    setStatus("loading");
    try {
      const payload = {
        package_id: packageId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        travelDate: data.travelDate,
        paxCount: Number(data.paxCount),
        message: data.message || "",
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enquiries/create.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setStatus("success");
        resetEnquiry();
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  // --- API: SUBMIT BOOKING ---
  const onBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBooking()) return;

    setStatus("loading");
    
    const activePlan = pricing[selectedPlanIdx] || {
      hotelCategory: "Standard", plan: "Base", pricePerPerson: 0
    };
    const totalPrice = activePlan.pricePerPerson * bookingFields.guests;
    
    // Format pricing context into the special requests field so admins see it
    const bookingNotes = `Plan: ${activePlan.hotelCategory} (${activePlan.plan}) | Total Price Estimate: ₹${totalPrice} | Customer Note: ${bookingFields.specialRequests}`;

    try {
      const payload = {
        package_id: packageId,
        customer_name: bookingFields.name,
        customer_phone: bookingFields.phone,
        customer_email: bookingFields.email,
        travel_date: bookingFields.travelDate,
        adults: bookingFields.guests,
        special_requests: bookingNotes,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/create.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setStatus("success");
        setBookingFields({ name: "", phone: "", email: "", travelDate: "", guests: 1, specialRequests: "" });
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl border border-border/50 p-8 text-center shadow-lg">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-heading font-semibold text-ink text-lg mb-2">
          {activeTab === "booking" ? "Booking Requested!" : "Enquiry Submitted!"}
        </h3>
        <p className="text-muted text-sm leading-relaxed">
          {activeTab === "booking"
            ? "Thank you! Your direct tour booking has been logged. Our travel desk will contact you with invoice details."
            : "Thank you! Our team will contact you shortly with the best deals and answers to your questions."}
        </p>
      </div>
    );
  }

  // Live Total Price Calculation for booking
  const selectedPlan = pricing?.[selectedPlanIdx];
  const totalPrice = selectedPlan ? selectedPlan.pricePerPerson * bookingFields.guests : 0;

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-md overflow-hidden">
      {/* Dynamic Tab Switcher */}
      <div className="grid grid-cols-2 border-b border-border/40 bg-surface/40 p-1.5 gap-1">
        <button
          onClick={() => setActiveTab("enquiry")}
          className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
            activeTab === "enquiry"
              ? "bg-white text-primary shadow-sm border border-border/30"
              : "text-muted hover:text-ink"
          }`}
        >
          Send Enquiry
        </button>
        <button
          onClick={() => setActiveTab("booking")}
          className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
            activeTab === "booking"
              ? "bg-white text-primary shadow-sm border border-border/30"
              : "text-muted hover:text-ink"
          }`}
        >
          Book Now
        </button>
      </div>

      <div className="p-6">
        <h3 className="font-heading font-bold text-ink text-base mb-1">
          {activeTab === "booking" ? "Book This Tour" : "Enquiry Form"}
        </h3>
        <p className="text-muted text-xs mb-5">
          {activeTab === "booking" 
            ? "Reserve your dates directly and secure your pricing plan." 
            : `Interested in ${packageTitle}? Ask a question below.`}
        </p>

        {/* Tab 1: Enquiry Form */}
        {activeTab === "enquiry" && (
          <form onSubmit={handleEnquirySubmit(onEnquirySubmit)} className="space-y-4">
            <div>
              <input
                {...registerEnquiry("name")}
                placeholder="Your Name *"
                className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-colors"
              />
              {enquiryErrors.name && (
                <p className="text-red-500 text-[10px] mt-1">{enquiryErrors.name.message}</p>
              )}
            </div>

            <div>
              <input
                {...registerEnquiry("phone")}
                placeholder="Phone Number *"
                className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-colors"
              />
              {enquiryErrors.phone && (
                <p className="text-red-500 text-[10px] mt-1">{enquiryErrors.phone.message}</p>
              )}
            </div>

            <div>
              <input
                {...registerEnquiry("email")}
                type="email"
                placeholder="Email Address *"
                className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-colors"
              />
              {enquiryErrors.email && (
                <p className="text-red-500 text-[10px] mt-1">{enquiryErrors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  {...registerEnquiry("travelDate")}
                  type="date"
                  className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-colors"
                />
                {enquiryErrors.travelDate && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {enquiryErrors.travelDate.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  {...registerEnquiry("paxCount", { valueAsNumber: true })}
                  type="number"
                  min={1}
                  placeholder="Travelers"
                  className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-colors"
                />
                {enquiryErrors.paxCount && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {enquiryErrors.paxCount.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <textarea
                {...registerEnquiry("message")}
                rows={3}
                placeholder="Any special requirements? (optional)"
                className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all cursor-pointer text-xs disabled:opacity-60"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Enquiry
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 2: Direct Booking Form */}
        {activeTab === "booking" && (
          <form onSubmit={onBookingSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="name"
                required
                value={bookingFields.name}
                onChange={handleBookingChange}
                placeholder="Customer Name *"
                className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-colors"
              />
              {bookingErrors.name && <p className="text-red-500 text-[10px] mt-1">{bookingErrors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  name="phone"
                  required
                  value={bookingFields.phone}
                  onChange={handleBookingChange}
                  placeholder="Phone Number *"
                  className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-colors"
                />
                {bookingErrors.phone && <p className="text-red-500 text-[10px] mt-1">{bookingErrors.phone}</p>}
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  required
                  value={bookingFields.email}
                  onChange={handleBookingChange}
                  placeholder="Email Address *"
                  className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-colors"
                />
                {bookingErrors.email && <p className="text-red-500 text-[10px] mt-1">{bookingErrors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="date"
                  name="travelDate"
                  required
                  value={bookingFields.travelDate}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-colors"
                />
                {bookingErrors.travelDate && <p className="text-red-500 text-[10px] mt-1">{bookingErrors.travelDate}</p>}
              </div>
              <div>
                <input
                  type="number"
                  name="guests"
                  required
                  min={1}
                  value={bookingFields.guests}
                  onChange={handleBookingChange}
                  placeholder="Travelers *"
                  className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-colors"
                />
                {bookingErrors.guests && <p className="text-red-500 text-[10px] mt-1">{bookingErrors.guests}</p>}
              </div>
            </div>

            {/* Dynamic Plan Selector */}
            {pricing && pricing.length > 0 && (
              <div>
                <label className="block text-[10px] uppercase font-bold text-muted mb-1">
                  Select Hotel Plan / Category
                </label>
                <select
                  value={selectedPlanIdx}
                  onChange={(e) => setSelectedPlanIdx(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none cursor-pointer"
                >
                  {pricing.map((p, idx) => (
                    <option key={idx} value={idx}>
                      {p.hotelCategory} ({p.plan}) — ₹{p.pricePerPerson.toLocaleString("en-IN")}/pp
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <textarea
                name="specialRequests"
                rows={2}
                value={bookingFields.specialRequests}
                onChange={handleBookingChange}
                placeholder="Any special requests? (Bed type, food choice, etc.)"
                className="w-full px-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-colors resize-none"
              />
            </div>

            {/* Total Price Display */}
            {selectedPlan && (
              <div className="p-3.5 bg-primary-light border border-primary/10 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">Total Price Estimate</span>
                  <span className="font-heading font-black text-base text-primary">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="text-[10px] text-muted font-medium text-right">
                  ₹{selectedPlan.pricePerPerson.toLocaleString("en-IN")} x {bookingFields.guests} pax
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer text-xs disabled:opacity-60"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Requesting Booking...
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  Confirm Booking Request
                </>
              )}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="text-red-500 text-xs text-center mt-3">
            Something went wrong. Please try again or call us directly.
          </p>
        )}
      </div>
    </div>
  );
}