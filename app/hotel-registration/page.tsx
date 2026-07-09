"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  Send,
  Loader2,
  CheckCircle2,
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  FileText,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Image as ImageIcon,
  Camera,
  Map
} from "lucide-react";
import { hotelRegistrationSchema, type HotelRegistrationFormData } from "@/lib/validators";
import { submitHotelRegistration } from "@/lib/api";
import Breadcrumbs from "@/components/shared/Breadcrumbs";

export default function HotelRegistrationPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm<HotelRegistrationFormData>({
    resolver: zodResolver(hotelRegistrationSchema),
    mode: "onTouched"
  });

  const nextStep = async () => {
    // Validate current step fields before proceeding
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ["ownerName", "ownerContact", "propertyManagerName", "propertyManagerPhone", "email", "password"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["hotelName", "gst", "hotelRegistrationNumber", "fireSafetyNoc", "cctvCamera", "bankDetails"];
    }
    
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data: HotelRegistrationFormData) => {
    setStatus("loading");
    setErrorMsg("");
    try {
      await submitHotelRegistration(data);
      setStatus("success");
      reset();
      setCurrentStep(1);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Registration failed. Please try again.");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <>
      {/* Hero Banner */}
      <div className="relative h-52 lg:h-64 flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1400&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        </div>
        <div className="container-wide relative z-10 pb-8">
          <h1
            style={{ color: "#ffffff" }}
            className="font-heading text-3xl lg:text-4xl font-bold !text-white mb-1"
          >
            Register Your Hotel
          </h1>
          <p
            style={{ color: "rgba(255, 255, 255, 0.8)" }}
            className="text-sm lg:text-base !text-white/80"
          >
            Partner with HR Trips and get listed in front of thousands of travelers
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        <Breadcrumbs
          items={[
            { label: "Hotel Booking", href: "/hotel-booking" },
            { label: "Register Your Hotel" },
          ]}
        />

        {status === "success" ? (
          <div className="max-w-2xl mx-auto py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-ink mb-3">
              Registration Submitted Successfully!
            </h2>
            <p className="text-muted text-sm max-w-md mx-auto mb-6">
              Your hotel registration request has been submitted and is currently under review.
              Once approved, you will be able to log in to your owner dashboard to set up room categories, pricing, and deluxe options.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/hotel-booking"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-xl text-sm font-semibold text-ink hover:bg-surface transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Hotels
              </Link>
              <Link
                href="/hotel-owner/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all"
              >
                Go to Owner Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Step Indicator Header */}
            <div className="mb-8 bg-white rounded-2xl border border-border/50 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                {[
                  { step: 1, title: "Owner Info" },
                  { step: 2, title: "Hotel Docs" },
                  { step: 3, title: "Photos & Location" },
                ].map((s, idx) => (
                  <div key={s.step} className="flex items-center flex-1 last:flex-initial">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          currentStep >= s.step
                            ? "bg-primary text-white"
                            : "bg-surface text-muted border border-border"
                        }`}
                      >
                        {s.step}
                      </div>
                      <span
                        className={`text-xs font-semibold hidden sm:inline ${
                          currentStep >= s.step ? "text-ink" : "text-muted"
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 transition-colors ${
                          currentStep > s.step ? "bg-primary" : "bg-border/60"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* STEP 1: Owner and Property Manager Details */}
              {currentStep === 1 && (
                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                  <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                    <User className="w-5 h-5 text-primary" />
                    Account & Owner Details
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Owner Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          {...register("ownerName")}
                          placeholder="Legal owner name"
                          className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                      </div>
                      {errors.ownerName && (
                        <p className="text-red-500 text-[10px] mt-1">{errors.ownerName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Owner Contact Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          {...register("ownerContact")}
                          placeholder="Owner mobile phone"
                          className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                      </div>
                      {errors.ownerContact && (
                        <p className="text-red-500 text-[10px] mt-1">{errors.ownerContact.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Property Manager Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          {...register("propertyManagerName")}
                          placeholder="Manager name at hotel"
                          className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                      </div>
                      {errors.propertyManagerName && (
                        <p className="text-red-500 text-[10px] mt-1">{errors.propertyManagerName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Property Manager Phone *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          {...register("propertyManagerPhone")}
                          placeholder="Manager contact phone"
                          className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                      </div>
                      {errors.propertyManagerPhone && (
                        <p className="text-red-500 text-[10px] mt-1">{errors.propertyManagerPhone.message}</p>
                      )}
                    </div>

                    <div className="border-t border-border/30 sm:col-span-2 pt-4 mt-2">
                      <h4 className="font-heading font-semibold text-ink text-xs mb-3">Dashboard Login Details</h4>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Login Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          {...register("email")}
                          type="email"
                          placeholder="owner@example.com"
                          className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-[10px] mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Dashboard Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          {...register("password")}
                          type="password"
                          placeholder="Min 6 characters"
                          className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-[10px] mt-1">{errors.password.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Hotel Details & Legals & Financials */}
              {currentStep === 2 && (
                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                  <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Hotel Documentation & Legals
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-muted mb-1.5">Hotel Name *</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          {...register("hotelName")}
                          placeholder="Hotel trade name"
                          className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                      </div>
                      {errors.hotelName && (
                        <p className="text-red-500 text-[10px] mt-1">{errors.hotelName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Hotel GST Number (15 chars) *</label>
                      <input
                        {...register("gst")}
                        placeholder="e.g. 10AAAAA0000A1Z5"
                        maxLength={15}
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.gst && (
                        <p className="text-red-500 text-[10px] mt-1">{errors.gst.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Hotel Registration No / Details *</label>
                      <input
                        {...register("hotelRegistrationNumber")}
                        placeholder="Registration ID / Certificate details"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.hotelRegistrationNumber && (
                        <p className="text-red-500 text-[10px] mt-1">{errors.hotelRegistrationNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Fire Safety NOC Details *</label>
                      <input
                        {...register("fireSafetyNoc")}
                        placeholder="NOC reference number / validity"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.fireSafetyNoc && (
                        <p className="text-red-500 text-[10px] mt-1">{errors.fireSafetyNoc.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">CCTV Camera Configuration *</label>
                      <input
                        {...register("cctvCamera")}
                        placeholder="Active CCTV configuration, count, coverage details"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.cctvCamera && (
                        <p className="text-red-500 text-[10px] mt-1">{errors.cctvCamera.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Hotel Direct Contact Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          {...register("phone")}
                          placeholder="Reception desk phone"
                          className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-[10px] mt-1">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2 pt-2">
                      <label className="block text-xs font-semibold text-muted mb-1.5 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-primary" /> Bank details (for billing settlements) *
                      </label>
                      <textarea
                        {...register("bankDetails")}
                        rows={3}
                        placeholder="Account Number: &#10;IFSC Code: &#10;Bank Name: &#10;Account Holder Name: "
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none resize-none"
                      />
                      {errors.bankDetails && (
                        <p className="text-red-500 text-[10px] mt-1">{errors.bankDetails.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Location & Media Photos */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Location Info */}
                  <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                    <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      Location & Address
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-muted mb-1.5">Google Maps Link / Coordinates *</label>
                        <div className="relative">
                          <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input
                            {...register("location")}
                            placeholder="Share Maps share link or Lat/Long coordinates"
                            className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                          />
                        </div>
                        {errors.location && (
                          <p className="text-red-500 text-[10px] mt-1">{errors.location.message}</p>
                        )}
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-muted mb-1.5">Full Address *</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input
                            {...register("hotelAddress")}
                            placeholder="Street Address, Area"
                            className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                          />
                        </div>
                        {errors.hotelAddress && (
                          <p className="text-red-500 text-[10px] mt-1">{errors.hotelAddress.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1.5">City *</label>
                        <input
                          {...register("city")}
                          placeholder="e.g. Patna"
                          className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                        {errors.city && (
                          <p className="text-red-500 text-[10px] mt-1">{errors.city.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1.5">State *</label>
                        <input
                          {...register("state")}
                          placeholder="e.g. Bihar"
                          className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                        {errors.state && (
                          <p className="text-red-500 text-[10px] mt-1">{errors.state.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1.5">Pincode *</label>
                        <input
                          {...register("pincode")}
                          placeholder="e.g. 800001"
                          className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                        {errors.pincode && (
                          <p className="text-red-500 text-[10px] mt-1">{errors.pincode.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Media uploads */}
                  <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                    <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                      <Camera className="w-5 h-5 text-primary" />
                      Hotel Photos (Image URLs)
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1.5">Room Pic URL *</label>
                        <div className="relative">
                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input
                            {...register("roomPic")}
                            placeholder="URL starting with https://"
                            className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                          />
                        </div>
                        {errors.roomPic && (
                          <p className="text-red-500 text-[10px] mt-1">{errors.roomPic.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1.5">Reception Pic URL *</label>
                        <div className="relative">
                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input
                            {...register("receptionPic")}
                            placeholder="URL starting with https://"
                            className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                          />
                        </div>
                        {errors.receptionPic && (
                          <p className="text-red-500 text-[10px] mt-1">{errors.receptionPic.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1.5">Bathroom Pic URL *</label>
                        <div className="relative">
                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input
                            {...register("bathroomPic")}
                            placeholder="URL starting with https://"
                            className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                          />
                        </div>
                        {errors.bathroomPic && (
                          <p className="text-red-500 text-[10px] mt-1">{errors.bathroomPic.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1.5">Interior & Exterior Pic URL *</label>
                        <div className="relative">
                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input
                            {...register("interiorExteriorPic")}
                            placeholder="URL starting with https://"
                            className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                          />
                        </div>
                        {errors.interiorExteriorPic && (
                          <p className="text-red-500 text-[10px] mt-1">{errors.interiorExteriorPic.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {status === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Wizard Nav Buttons */}
              <div className="flex items-center justify-between gap-4">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3.5 border border-border rounded-xl text-xs font-bold text-ink hover:bg-surface transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3.5 bg-ink text-white font-bold rounded-xl text-xs hover:bg-ink-light transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex-1 sm:flex-initial px-8 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.99] transition-all disabled:opacity-70 cursor-pointer"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Hotel Application
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* Already registered */}
            <div className="text-center mt-8 pb-4 border-t border-border/30 pt-6">
              <p className="text-muted text-xs">
                Already registered hotel partner?{" "}
                <Link
                  href="/hotel-owner/login"
                  className="text-primary font-bold hover:underline"
                >
                  Login to owner dashboard
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
