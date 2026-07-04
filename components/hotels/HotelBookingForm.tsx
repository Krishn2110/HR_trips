"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { bookingSchema, type BookingFormData } from "@/lib/validators";
import { submitBooking } from "@/lib/api";

interface HotelBookingFormProps {
  hotelId: string;
  hotelName: string;
  roomTypes: { name: string; pricePerNight: number }[];
}

export default function HotelBookingForm({
  hotelId,
  hotelName,
  roomTypes,
}: HotelBookingFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      rooms: 1,
      adults: 2,
      children: 0,
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    setStatus("loading");
    try {
      await submitBooking({
        ...data,
        rooms: Number(data.rooms),
        guests: `${data.adults} Adults, ${data.children} Children`,
        adults: Number(data.adults),
        children: Number(data.children),
        hotelId,
        specialRequests: data.specialRequests || "",
      });
      setStatus("success");
      reset();
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl border border-border/50 p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-heading font-semibold text-ink text-lg mb-2">
          Booking Request Sent!
        </h3>
        <p className="text-muted text-sm">
          We&apos;ll confirm your reservation and contact you shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border/50 p-6 lg:p-8">
      <h3 className="font-heading font-semibold text-ink text-lg mb-1">
        Book This Hotel
      </h3>
      <p className="text-muted text-sm mb-6">
        <span className="text-primary font-medium">{hotelName}</span>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register("name")}
            placeholder="Your Name *"
            className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              {...register("phone")}
              placeholder="Phone *"
              className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
            )}
          </div>
          <div>
            <input
              {...register("email")}
              type="email"
              placeholder="Email *"
              className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted mb-1">Check-in</label>
            <input
              {...register("checkin")}
              type="date"
              className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
            />
            {errors.checkin && (
              <p className="text-red-500 text-xs mt-1">{errors.checkin.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Check-out</label>
            <input
              {...register("checkout")}
              type="date"
              className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
            />
            {errors.checkout && (
              <p className="text-red-500 text-xs mt-1">{errors.checkout.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted mb-1">Rooms</label>
            <input
              {...register("rooms", { valueAsNumber: true })}
              type="number"
              min={1}
              placeholder="Rooms"
              className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
            />
            {errors.rooms && (
              <p className="text-red-500 text-xs mt-1">{errors.rooms.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Room Type</label>
            <select
              {...register("roomType")}
              className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
            >
              <option value="">Select type</option>
              {roomTypes.map((rt) => (
                <option key={rt.name} value={rt.name}>
                  {rt.name}
                </option>
              ))}
            </select>
            {errors.roomType && (
              <p className="text-red-500 text-xs mt-1">{errors.roomType.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted mb-1">Adults</label>
            <input
              {...register("adults", { valueAsNumber: true })}
              type="number"
              min={1}
              placeholder="Adults (12+ yrs)"
              className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
            />
            {errors.adults && (
              <p className="text-red-500 text-xs mt-1">{errors.adults.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Children</label>
            <input
              {...register("children", { valueAsNumber: true })}
              type="number"
              min={0}
              placeholder="Children (0-12 yrs)"
              className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
            />
            {errors.children && (
              <p className="text-red-500 text-xs mt-1">{errors.children.message}</p>
            )}
          </div>
        </div>

        <div>
          <textarea
            {...register("specialRequests")}
            rows={2}
            placeholder="Special requests (optional)"
            className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full px-6 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Request Booking
            </>
          )}
        </button>

        {status === "error" && (
          <p className="text-red-500 text-sm text-center">
            Something went wrong. Please try again or call us.
          </p>
        )}
      </form>
    </div>
  );
}
