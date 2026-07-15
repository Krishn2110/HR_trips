"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Loader2, CheckCircle2, IndianRupee } from "lucide-react";
import { bookingSchema, type BookingFormData } from "@/lib/validators";

interface RoomTypeData {
  name: string;
  pricePerNight: number;
  maxGuests?: number;
}

interface HotelBookingFormProps {
  hotelId: string | number;
  hotelName: string;
  roomTypes: RoomTypeData[];
}

export default function HotelBookingForm({
  hotelId,
  hotelName,
  roomTypes,
}: HotelBookingFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "verifying" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { rooms: 1, adults: 2, children: 0 },
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const checkinVal = watch("checkin");
  const checkoutVal = watch("checkout");
  const roomsVal = watch("rooms") || 1;
  const roomTypeVal = watch("roomType");
  const adultsVal = watch("adults") || 1;

  let minCheckout = today;
  let nights = 0;

  if (checkinVal) {
    const cin = new Date(checkinVal);
    const coutMin = new Date(cin);
    coutMin.setDate(coutMin.getDate() + 1);
    minCheckout = coutMin.toISOString().split("T")[0];

    if (checkoutVal) {
      const cout = new Date(checkoutVal);
      const diffTime = Math.abs(cout.getTime() - cin.getTime());
      nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  useEffect(() => {
    if (checkinVal && checkoutVal && checkoutVal < minCheckout) {
      setValue("checkout", minCheckout);
    }
  }, [checkinVal, checkoutVal, minCheckout, setValue]);

  const selectedRt = roomTypes.find((r) => r.name === roomTypeVal);
  const maxCapacity = roomsVal * (selectedRt?.maxGuests || 2); 
  const totalAmount = selectedRt ? selectedRt.pricePerNight * roomsVal * nights : 0;

  const onSubmit = async (data: BookingFormData) => {
    setErrorMsg("");

    if (!selectedRt) {
      setErrorMsg("Please select a room category.");
      return;
    }
    if (nights <= 0) {
      setErrorMsg("Please select valid check-in and check-out dates.");
      return;
    }
    if (data.adults > maxCapacity) {
      setError("adults", { type: "manual", message: `Max ${maxCapacity} adults allowed`});
      return;
    }

    setStatus("loading");

    try {
      // NEW FOLDER PATH
      const checkRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotel-bookings/check_availability.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId,
          roomCategory: data.roomType,
          checkin: data.checkin,
          checkout: data.checkout,
          rooms: data.rooms
        }),
      });
      const checkData = await checkRes.json();
      
      if (!checkRes.ok || checkData.status !== "success") {
        throw new Error(checkData.message || "Rooms not available.");
      }

      // Reusing packages order creation since it just generates a generic RZP order ID
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/create_order.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || orderData.status !== "success") {
        throw new Error("Failed to initialize payment gateway.");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: totalAmount * 100,
        currency: "INR",
        name: hotelName,
        description: `${data.rooms}x ${data.roomType} for ${nights} Nights`,
        order_id: orderData.data.order_id,
        handler: async function (response: any) {
          
          setStatus("verifying");
          
          try {
            // NEW FOLDER PATH
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotel-bookings/verify_payment.php`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                ...data,
                hotelId,
                hotelName,
                totalAmount
              }),
            });
            
            const verifyData = await verifyRes.json();
            
            if (verifyRes.ok && verifyData.status === "success") {
              setStatus("success");
              reset();
            } else {
              throw new Error(verifyData.message || "Payment verification failed.");
            }
          } catch (err: any) {
            setStatus("error");
            setErrorMsg(err.message || "Payment received but verification failed.");
          }
        },
        prefill: { name: data.name, email: data.email, contact: data.phone },
        theme: { color: "#0f172a" },
        modal: { ondismiss: function () { setStatus("idle"); } }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setStatus("error");
        setErrorMsg(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong.");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  if (status === "verifying") {
    return (
      <div className="bg-white rounded-2xl border border-border/50 p-8 text-center shadow-lg">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <h3 className="font-heading font-semibold text-ink text-lg mb-2">Verifying Payment...</h3>
        <p className="text-muted text-sm">Securing your hotel room. Do not close this window.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl border border-border/50 p-8 text-center shadow-lg">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-heading font-semibold text-ink text-lg mb-2">Booking Confirmed!</h3>
        <p className="text-muted text-sm">Your reservation is secured. We've emailed you the details.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border/50 p-6 lg:p-8 shadow-sm">
      <h3 className="font-heading font-semibold text-ink text-lg mb-1">Book Your Stay</h3>
      <p className="text-muted text-sm mb-6"><span className="text-primary font-medium">{hotelName}</span></p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input {...register("name")} placeholder="Your Name *" className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary outline-none" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input {...register("phone")} placeholder="Phone *" className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary outline-none" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <input {...register("email")} type="email" placeholder="Email *" className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary outline-none" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted mb-1">Check-in</label>
            <input {...register("checkin")} type="date" min={today} className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary outline-none cursor-pointer" />
            {errors.checkin && <p className="text-red-500 text-xs mt-1">{errors.checkin.message}</p>}
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Check-out</label>
            <input {...register("checkout")} type="date" min={minCheckout} className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary outline-none cursor-pointer" />
            {errors.checkout && <p className="text-red-500 text-xs mt-1">{errors.checkout.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted mb-1">Rooms</label>
            <input {...register("rooms", { valueAsNumber: true })} type="number" min={1} className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary outline-none" />
            {errors.rooms && <p className="text-red-500 text-xs mt-1">{errors.rooms.message}</p>}
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Room Category</label>
            <select {...register("roomType")} className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary outline-none cursor-pointer">
              <option value="">Select category</option>
              {roomTypes.map((rt) => (
                <option key={rt.name} value={rt.name}>{rt.name}</option>
              ))}
            </select>
            {errors.roomType && <p className="text-red-500 text-xs mt-1">{errors.roomType.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-muted flex justify-between mb-1">
              <span>Adults</span>
              {roomTypeVal && <span className="font-semibold text-primary">Max {maxCapacity}</span>}
            </label>
            <input {...register("adults", { valueAsNumber: true })} type="number" min={1} max={maxCapacity} placeholder="12+ yrs" className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary outline-none" />
            {errors.adults && <p className="text-red-500 text-xs mt-1">{errors.adults.message}</p>}
          </div>
          <div>
            <label className="block text-[11px] text-muted mb-1">Children (0-12 yrs)</label>
            <input {...register("children", { valueAsNumber: true })} type="number" min={0} className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary outline-none" />
          </div>
        </div>

        {totalAmount > 0 && nights > 0 && (
          <div className="p-3.5 bg-primary-light border border-primary/10 rounded-xl flex items-center justify-between mt-2">
            <div>
              <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">Stay Total</span>
              <span className="font-heading font-black text-base text-primary flex items-center">
                <IndianRupee className="w-4 h-4" />{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="text-[10px] text-muted font-medium text-right">
              ₹{selectedRt?.pricePerNight.toLocaleString()} x {roomsVal} Room{roomsVal > 1 ? 's' : ''} x {nights} Night{nights > 1 ? 's' : ''}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading" || totalAmount <= 0 || nights <= 0}
          className="w-full px-6 py-3.5 mt-2 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "loading" ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Verifying Availability...</>
          ) : (
            <><Send className="w-4 h-4" /> Pay & Book Room</>
          )}
        </button>
      </form>
    </div>
  );
}