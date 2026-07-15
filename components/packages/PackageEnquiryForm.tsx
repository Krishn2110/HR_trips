"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Loader2, CheckCircle2, Ticket, IndianRupee, User, Mail, Phone, Calendar, Users, MessageSquare } from "lucide-react";
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
  
  // Added "verifying" to the status types to show a dedicated loading screen after payment
  const [status, setStatus] = useState<"idle" | "loading" | "verifying" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
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

  // Dynamically load Razorpay SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

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
    setErrorMsg("");
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
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "Failed to send enquiry.");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  // --- API: SUBMIT BOOKING (RAZORPAY INTEGRATION) ---
  const onBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBooking()) return;

    const activePlan = pricing[selectedPlanIdx] || {
      hotelCategory: "Standard", plan: "Base", pricePerPerson: 0
    };
    const totalAmount = activePlan.pricePerPerson * bookingFields.guests;

    if (totalAmount <= 0) {
      setErrorMsg("Pricing not available for this plan.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      // 1. Ask backend to create a Razorpay Order
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/create_order.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || orderData.status !== "success") {
        throw new Error(orderData.message || "Failed to create payment order");
      }

      // 2. Setup Razorpay Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: totalAmount * 100, // in paise
        currency: "INR",
        name: "HR Trips",
        description: `Booking: ${packageTitle}`,
        image: "/logo.png", // Add your logo path if you have one
        order_id: orderData.data.order_id,
        handler: async function (response: any) {
          
          // --> SET TO VERIFYING STATE AFTER PAYMENT SUCCESS <--
          setStatus("verifying");
          
          // 3. Verify Payment & Save to DB
          try {
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/verify_payment.php`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response, // includes razorpay_payment_id, razorpay_order_id, razorpay_signature
                packageId,
                name: bookingFields.name,
                email: bookingFields.email,
                phone: bookingFields.phone,
                travelDate: bookingFields.travelDate,
                paxCount: bookingFields.guests,
                message: `Plan: ${activePlan.hotelCategory} (${activePlan.plan}) | Note: ${bookingFields.specialRequests}`,
                totalAmount
              }),
            });
            
            const verifyData = await verifyRes.json();
            
            if (verifyRes.ok && verifyData.status === "success") {
              setStatus("success");
              setBookingFields({ name: "", phone: "", email: "", travelDate: "", guests: 1, specialRequests: "" });
            } else {
              throw new Error(verifyData.message || "Payment verification failed");
            }
          } catch (err: any) {
            setStatus("error");
            setErrorMsg(err.message || "Error verifying payment. Contact support if amount was deducted.");
          }
        },
        prefill: {
          name: bookingFields.name,
          email: bookingFields.email,
          contact: bookingFields.phone,
        },
        theme: {
          color: "#0f172a", 
        },
        modal: {
          // Detect if the user closes the Razorpay popup without paying
          ondismiss: function () {
            setStatus("idle");
          }
        }
      };

      // 4. Open Razorpay Window
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setStatus("error");
        setErrorMsg(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();
      
      // We DO NOT set status to "idle" here anymore, so the button stays "Processing..." while Razorpay is open

    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  // Dedicated Loading Screen while saving to Database
  if (status === "verifying") {
    return (
      <div className="bg-white rounded-2xl border border-border/50 p-8 text-center shadow-lg">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <h3 className="font-heading font-semibold text-ink text-lg mb-2">
          Verifying Payment...
        </h3>
        <p className="text-muted text-sm leading-relaxed">
          Please wait while we confirm your transaction and secure your booking. <strong className="text-ink">Do not close or refresh this window.</strong>
        </p>
      </div>
    );
  }

  // Success Screen
  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl border border-border/50 p-8 text-center shadow-lg">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-heading font-semibold text-ink text-lg mb-2">
          {activeTab === "booking" ? "Booking Confirmed!" : "Enquiry Submitted!"}
        </h3>
        <p className="text-muted text-sm leading-relaxed">
          {activeTab === "booking"
            ? "Your payment was successful and your trip is booked. Check your email for details."
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
            ? "Reserve your dates securely with Razorpay." 
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
                  min={new Date().toISOString().split("T")[0]}
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

        {/* Tab 2: Direct Booking Form with Razorpay */}
        {activeTab === "booking" && (
          <form onSubmit={onBookingSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  name="name"
                  required
                  value={bookingFields.name}
                  onChange={handleBookingChange}
                  placeholder="Customer Name *"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-colors"
                />
              </div>
              {bookingErrors.name && <p className="text-red-500 text-[10px] mt-1">{bookingErrors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    name="phone"
                    required
                    value={bookingFields.phone}
                    onChange={handleBookingChange}
                    placeholder="Phone Number *"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-colors"
                  />
                </div>
                {bookingErrors.phone && <p className="text-red-500 text-[10px] mt-1">{bookingErrors.phone}</p>}
              </div>
              <div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={bookingFields.email}
                    onChange={handleBookingChange}
                    placeholder="Email Address *"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-colors"
                  />
                </div>
                {bookingErrors.email && <p className="text-red-500 text-[10px] mt-1">{bookingErrors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="date"
                    name="travelDate"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={bookingFields.travelDate}
                    onChange={handleBookingChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-colors"
                  />
                </div>
                {bookingErrors.travelDate && <p className="text-red-500 text-[10px] mt-1">{bookingErrors.travelDate}</p>}
              </div>
              <div>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="number"
                    name="guests"
                    required
                    min={1}
                    value={bookingFields.guests}
                    onChange={handleBookingChange}
                    placeholder="Travelers *"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-colors"
                  />
                </div>
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
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-muted" />
                <textarea
                  name="specialRequests"
                  rows={2}
                  value={bookingFields.specialRequests}
                  onChange={handleBookingChange}
                  placeholder="Any special requests? (Bed type, food choice, etc.)"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {/* Total Price Display */}
            {selectedPlan && (
              <div className="p-3.5 bg-primary-light border border-primary/10 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">Total Price Estimate</span>
                  <span className="font-heading font-black text-base text-primary flex items-center">
                    <IndianRupee className="w-4 h-4" />{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="text-[10px] text-muted font-medium text-right">
                  ₹{selectedPlan.pricePerPerson.toLocaleString("en-IN")} x {bookingFields.guests} pax
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading" || totalPrice <= 0}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer text-xs disabled:opacity-60"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  Pay & Book Now
                </>
              )}
            </button>
            
            <p className="text-[10px] text-center text-muted mt-2">
              Secure payment processing powered by Razorpay.
            </p>
          </form>
        )}

        {status === "error" && errorMsg && (
          <p className="text-red-500 text-xs text-center mt-3 p-2 bg-red-50 rounded-lg">
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
}