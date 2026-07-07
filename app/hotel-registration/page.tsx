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
  Star,
  DoorOpen,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { hotelRegistrationSchema, type HotelRegistrationFormData } from "@/lib/validators";
import { submitHotelRegistration } from "@/lib/api";
import Breadcrumbs from "@/components/shared/Breadcrumbs";

const AMENITY_OPTIONS = [
  "Free Wi-Fi",
  "Swimming Pool",
  "Gym / Fitness Center",
  "Restaurant",
  "Room Service",
  "Parking",
  "Air Conditioning",
  "Laundry Service",
  "Conference Room",
  "Spa & Wellness",
  "Bar / Lounge",
  "Airport Shuttle",
  "24/7 Front Desk",
  "Power Backup",
  "CCTV Security",
  "Elevator",
];

export default function HotelRegistrationPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HotelRegistrationFormData>({
    resolver: zodResolver(hotelRegistrationSchema),
    defaultValues: {
      starRating: 3,
      totalRooms: 10,
    },
  });

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const onSubmit = async (data: HotelRegistrationFormData) => {
    setStatus("loading");
    setErrorMsg("");
    try {
      await submitHotelRegistration({
        ...data,
        amenities: selectedAmenities,
      });
      setStatus("success");
      reset();
      setSelectedAmenities([]);
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
            Partner with HR Trips and grow your hotel business
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
              You will be able to login to your hotel owner dashboard once approved by our team.
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
            {/* Info Card */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-ink text-lg mb-1">
                    Why Register With Us?
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    Get your hotel listed on the HR Trips platform and reach thousands of travelers.
                    Enjoy seamless booking management, visibility across our network, and dedicated support
                    from our partnership team.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Owner Details Section */}
              <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
                <h3 className="font-heading font-bold text-ink text-base mb-5 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Owner Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        {...register("ownerName")}
                        placeholder="Your full name"
                        className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
                      />
                    </div>
                    {errors.ownerName && (
                      <p className="text-red-500 text-xs mt-1">{errors.ownerName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        {...register("phone")}
                        placeholder="Your phone number"
                        className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="owner@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Create Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        {...register("password")}
                        type="password"
                        placeholder="Min 6 characters"
                        className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Hotel Details Section */}
              <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
                <h3 className="font-heading font-bold text-ink text-base mb-5 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Hotel Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-muted mb-1">Hotel Name *</label>
                    <input
                      {...register("hotelName")}
                      placeholder="e.g. Grand Palace Hotel"
                      className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
                    />
                    {errors.hotelName && (
                      <p className="text-red-500 text-xs mt-1">{errors.hotelName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-muted mb-1">Full Address *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted" />
                      <input
                        {...register("hotelAddress")}
                        placeholder="Street address, locality"
                        className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
                      />
                    </div>
                    {errors.hotelAddress && (
                      <p className="text-red-500 text-xs mt-1">{errors.hotelAddress.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-muted mb-1">City *</label>
                      <input
                        {...register("city")}
                        placeholder="e.g. Patna"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1">State *</label>
                      <input
                        {...register("state")}
                        placeholder="e.g. Bihar"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
                      />
                      {errors.state && (
                        <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1">Pincode *</label>
                      <input
                        {...register("pincode")}
                        placeholder="e.g. 800001"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
                      />
                      {errors.pincode && (
                        <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted mb-1 flex items-center gap-1">
                        <Star className="w-3 h-3" /> Star Rating *
                      </label>
                      <select
                        {...register("starRating", { valueAsNumber: true })}
                        className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
                      >
                        <option value={1}>1 Star</option>
                        <option value={2}>2 Stars</option>
                        <option value={3}>3 Stars</option>
                        <option value={4}>4 Stars</option>
                        <option value={5}>5 Stars</option>
                      </select>
                      {errors.starRating && (
                        <p className="text-red-500 text-xs mt-1">{errors.starRating.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1 flex items-center gap-1">
                        <DoorOpen className="w-3 h-3" /> Total Rooms *
                      </label>
                      <input
                        {...register("totalRooms", { valueAsNumber: true })}
                        type="number"
                        min={1}
                        placeholder="e.g. 50"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
                      />
                      {errors.totalRooms && (
                        <p className="text-red-500 text-xs mt-1">{errors.totalRooms.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-muted mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Hotel Description *
                    </label>
                    <textarea
                      {...register("description")}
                      rows={4}
                      placeholder="Describe your hotel, its unique features, and what makes it special..."
                      className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors resize-none"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Amenities Section */}
              <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
                <h3 className="font-heading font-bold text-ink text-base mb-4">
                  Available Amenities
                </h3>
                <p className="text-muted text-xs mb-4">Select all amenities your hotel offers</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {AMENITY_OPTIONS.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-surface border-border text-muted hover:border-primary/20 hover:text-ink"
                        }`}
                      >
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error Message */}
              {status === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.99] transition-all disabled:opacity-70 cursor-pointer"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Registration...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Hotel Registration
                  </>
                )}
              </button>
            </form>

            {/* Already registered */}
            <div className="text-center mt-8 pb-4">
              <p className="text-muted text-sm">
                Already registered?{" "}
                <Link
                  href="/hotel-owner/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Login to your dashboard
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
