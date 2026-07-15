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
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Image as ImageIcon,
  Camera,
  Map,
  X
} from "lucide-react";
import { hotelRegistrationSchema, type HotelRegistrationFormData } from "@/lib/validators";
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<HotelRegistrationFormData>({
    resolver: zodResolver(hotelRegistrationSchema),
    mode: "onTouched",
    defaultValues: {
      roomPics: [],
      receptionPics: [],
      bathroomPics: [],
      interiorExteriorPics: [],
    }
  });

  const watchRoomPics = watch("roomPics") || [];
  const watchReceptionPics = watch("receptionPics") || [];
  const watchBathroomPics = watch("bathroomPics") || [];
  const watchInteriorExteriorPics = watch("interiorExteriorPics") || [];

  // --- NATIVE FILE UPLOAD HANDLER ---
  const handleMultipleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "roomPics" | "receptionPics" | "bathroomPics" | "interiorExteriorPics"
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = files.filter(f => f.size <= 2 * 1024 * 1024);
    if (validFiles.length !== files.length) {
      alert("Some images were larger than 2MB and were skipped.");
    }

    const currentFiles = watch(field) || [];
    setValue(field, [...currentFiles, ...validFiles] as any, { shouldValidate: true });
    
    e.target.value = '';
  };

  const removeImage = (
    field: "roomPics" | "receptionPics" | "bathroomPics" | "interiorExteriorPics",
    indexToRemove: number
  ) => {
    const currentFiles = watch(field) || [];
    setValue(field, currentFiles.filter((_, idx) => idx !== indexToRemove) as any, { shouldValidate: true });
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ["ownerName", "ownerContact", "propertyManagerName", "propertyManagerPhone", "email", "password"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["hotelName", "gst", "hotelRegistrationNumber", "fireSafetyNoc", "cctvCamera", "phone", "bankDetails"];
    }
    
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // --- ERROR BOUNDARY ---
  const onInvalid = (validationErrors: any) => {
    console.error("Form Validation Failed! Missing/Invalid Fields:", validationErrors);
    
    const step1Fields = ["ownerName", "ownerContact", "propertyManagerName", "propertyManagerPhone", "email", "password"];
    const step2Fields = ["hotelName", "gst", "hotelRegistrationNumber", "fireSafetyNoc", "cctvCamera", "phone", "bankDetails"];
    
    if (step1Fields.some(field => validationErrors[field])) {
      setCurrentStep(1);
    } else if (step2Fields.some(field => validationErrors[field])) {
      setCurrentStep(2);
    } else {
      // If the error isn't in Step 1 or 2, it must be the photos in Step 3
      setCurrentStep(3);
      alert("Please ensure you have uploaded at least 1 photo for every category.");
    }
  };

  // --- FORMDATA SUBMISSION ---
  const onSubmit = async (data: HotelRegistrationFormData) => {
    setStatus("loading");
    setErrorMsg("");
    
    try {
      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        if (!['roomPics', 'receptionPics', 'bathroomPics', 'interiorExteriorPics'].includes(key)) {
          // @ts-ignore
          formData.append(key, data[key]);
        }
      });

      // Append files for PHP arrays
      data.roomPics.forEach((file: File) => formData.append("roomPics[]", file));
      data.receptionPics.forEach((file: File) => formData.append("receptionPics[]", file));
      data.bathroomPics.forEach((file: File) => formData.append("bathroomPics[]", file));
      data.interiorExteriorPics.forEach((file: File) => formData.append("interiorExteriorPics[]", file));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/register.php`, {
        method: "POST",
        body: formData
      });
      
      const result = await response.json();

      if (response.ok && result.status === "success") {
        setStatus("success");
        reset();
        setCurrentStep(1);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err?.message || "Registration failed. Please try again.");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <>
      <div className="relative h-52 lg:h-64 flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1400&q=80')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        </div>
        <div className="container-wide relative z-10 pb-8">
          <h1 className="font-heading text-3xl lg:text-4xl font-bold text-white mb-1">
            Register Your Hotel
          </h1>
          <p className="text-sm lg:text-base text-white/80">
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
              Once approved, you will be able to log in to your owner dashboard.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/hotel-booking"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-xl text-sm font-semibold text-ink hover:bg-surface transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Hotels
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
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${currentStep >= s.step ? "bg-primary text-white" : "bg-surface text-muted border border-border"}`}>
                        {s.step}
                      </div>
                      <span className={`text-xs font-semibold hidden sm:inline ${currentStep >= s.step ? "text-ink" : "text-muted"}`}>
                        {s.title}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div className={`flex-1 h-0.5 mx-4 transition-colors ${currentStep > s.step ? "bg-primary" : "bg-border/60"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-8">
              
              {/* STEP 1: Owner and Property Manager Details */}
              <div className={`bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6 ${currentStep === 1 ? 'block' : 'hidden'}`}>
                <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                  <User className="w-5 h-5 text-primary" /> Account & Owner Details
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
                    {errors.ownerName && <p className="text-red-500 text-[10px] mt-1">{errors.ownerName.message}</p>}
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
                    {errors.ownerContact && <p className="text-red-500 text-[10px] mt-1">{errors.ownerContact.message}</p>}
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
                    {errors.propertyManagerName && <p className="text-red-500 text-[10px] mt-1">{errors.propertyManagerName.message}</p>}
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
                    {errors.propertyManagerPhone && <p className="text-red-500 text-[10px] mt-1">{errors.propertyManagerPhone.message}</p>}
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
                    {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email.message}</p>}
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
                    {errors.password && <p className="text-red-500 text-[10px] mt-1">{errors.password.message}</p>}
                  </div>
                </div>
              </div>

              {/* STEP 2: Hotel Details & Legals & Financials */}
              <div className={`bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6 ${currentStep === 2 ? 'block' : 'hidden'}`}>
                <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                  <ShieldCheck className="w-5 h-5 text-primary" /> Hotel Documentation & Legals
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
                    {errors.hotelName && <p className="text-red-500 text-[10px] mt-1">{errors.hotelName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1.5">Hotel GST Number (15 chars) *</label>
                    <input
                      {...register("gst")}
                      placeholder="e.g. 10AAAAA0000A1Z5"
                      maxLength={15}
                      className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                    />
                    {errors.gst && <p className="text-red-500 text-[10px] mt-1">{errors.gst.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1.5">Hotel Registration No / Details *</label>
                    <input
                      {...register("hotelRegistrationNumber")}
                      placeholder="Registration ID / Certificate details"
                      className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                    />
                    {errors.hotelRegistrationNumber && <p className="text-red-500 text-[10px] mt-1">{errors.hotelRegistrationNumber.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1.5">Fire Safety NOC Details *</label>
                    <input
                      {...register("fireSafetyNoc")}
                      placeholder="NOC reference number / validity"
                      className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                    />
                    {errors.fireSafetyNoc && <p className="text-red-500 text-[10px] mt-1">{errors.fireSafetyNoc.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1.5">CCTV Camera Configuration *</label>
                    <input
                      {...register("cctvCamera")}
                      placeholder="Active CCTV config, count details"
                      className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                    />
                    {errors.cctvCamera && <p className="text-red-500 text-[10px] mt-1">{errors.cctvCamera.message}</p>}
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
                    {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone.message}</p>}
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
                    {errors.bankDetails && <p className="text-red-500 text-[10px] mt-1">{errors.bankDetails.message}</p>}
                  </div>
                </div>
              </div>

              {/* STEP 3: Location & Media Photos */}
              <div className={`space-y-6 ${currentStep === 3 ? 'block' : 'hidden'}`}>
                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                  <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                    <MapPin className="w-5 h-5 text-primary" /> Location & Address
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
                      {errors.location && <p className="text-red-500 text-[10px] mt-1">{errors.location.message}</p>}
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
                      {errors.hotelAddress && <p className="text-red-500 text-[10px] mt-1">{errors.hotelAddress.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">City *</label>
                      <input
                        {...register("city")}
                        placeholder="e.g. Patna"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.city && <p className="text-red-500 text-[10px] mt-1">{errors.city.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">State *</label>
                      <input
                        {...register("state")}
                        placeholder="e.g. Bihar"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.state && <p className="text-red-500 text-[10px] mt-1">{errors.state.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Pincode *</label>
                      <input
                        {...register("pincode")}
                        placeholder="e.g. 800001"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.pincode && <p className="text-red-500 text-[10px] mt-1">{errors.pincode.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                  <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                    <Camera className="w-5 h-5 text-primary" /> Hotel Photos
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {/* Room Pics */}
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-2">Room Photos *</label>
                      <div className="flex flex-wrap gap-4">
                        {watchRoomPics.map((file: any, idx: number) => (
                          <div key={idx} className="relative w-32 h-32 border border-border rounded-xl overflow-hidden bg-surface group">
                            <img src={URL.createObjectURL(file)} alt="Room" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage("roomPics", idx)} className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/85 text-white rounded-full transition-colors cursor-pointer">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border/80 hover:border-primary rounded-xl bg-surface cursor-pointer transition-all">
                          <ImageIcon className="w-6 h-6 text-muted mb-1" />
                          <span className="text-[10px] font-bold text-ink text-center">Add Room<br/>Photos</span>
                          <input type="file" accept="image/*" multiple onChange={(e) => handleMultipleImageUpload(e, "roomPics")} className="hidden" />
                        </label>
                      </div>
                      {errors.roomPics && <p className="text-red-500 text-[10px] mt-1">{(errors.roomPics as any).message}</p>}
                    </div>

                    {/* Reception Pics */}
                    <div className="pt-4 border-t border-border/30">
                      <label className="block text-xs font-semibold text-muted mb-2">Reception Photos *</label>
                      <div className="flex flex-wrap gap-4">
                        {watchReceptionPics.map((file: any, idx: number) => (
                          <div key={idx} className="relative w-32 h-32 border border-border rounded-xl overflow-hidden bg-surface group">
                            <img src={URL.createObjectURL(file)} alt="Reception" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage("receptionPics", idx)} className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/85 text-white rounded-full transition-colors cursor-pointer">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border/80 hover:border-primary rounded-xl bg-surface cursor-pointer transition-all">
                          <ImageIcon className="w-6 h-6 text-muted mb-1" />
                          <span className="text-[10px] font-bold text-ink text-center">Add Reception<br/>Photos</span>
                          <input type="file" accept="image/*" multiple onChange={(e) => handleMultipleImageUpload(e, "receptionPics")} className="hidden" />
                        </label>
                      </div>
                      {errors.receptionPics && <p className="text-red-500 text-[10px] mt-1">{(errors.receptionPics as any).message}</p>}
                    </div>

                    {/* Bathroom Pics */}
                    <div className="pt-4 border-t border-border/30">
                      <label className="block text-xs font-semibold text-muted mb-2">Bathroom Photos *</label>
                      <div className="flex flex-wrap gap-4">
                        {watchBathroomPics.map((file: any, idx: number) => (
                          <div key={idx} className="relative w-32 h-32 border border-border rounded-xl overflow-hidden bg-surface group">
                            <img src={URL.createObjectURL(file)} alt="Bathroom" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage("bathroomPics", idx)} className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/85 text-white rounded-full transition-colors cursor-pointer">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border/80 hover:border-primary rounded-xl bg-surface cursor-pointer transition-all">
                          <ImageIcon className="w-6 h-6 text-muted mb-1" />
                          <span className="text-[10px] font-bold text-ink text-center">Add Bathroom<br/>Photos</span>
                          <input type="file" accept="image/*" multiple onChange={(e) => handleMultipleImageUpload(e, "bathroomPics")} className="hidden" />
                        </label>
                      </div>
                      {errors.bathroomPics && <p className="text-red-500 text-[10px] mt-1">{(errors.bathroomPics as any).message}</p>}
                    </div>

                    {/* Interior/Exterior Pics */}
                    <div className="pt-4 border-t border-border/30">
                      <label className="block text-xs font-semibold text-muted mb-2">Interior & Exterior Photos *</label>
                      <div className="flex flex-wrap gap-4">
                        {watchInteriorExteriorPics.map((file: any, idx: number) => (
                          <div key={idx} className="relative w-32 h-32 border border-border rounded-xl overflow-hidden bg-surface group">
                            <img src={URL.createObjectURL(file)} alt="Interior/Exterior" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage("interiorExteriorPics", idx)} className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/85 text-white rounded-full transition-colors cursor-pointer">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border/80 hover:border-primary rounded-xl bg-surface cursor-pointer transition-all">
                          <ImageIcon className="w-6 h-6 text-muted mb-1" />
                          <span className="text-[10px] font-bold text-ink text-center">Add Exterior<br/>Photos</span>
                          <input type="file" accept="image/*" multiple onChange={(e) => handleMultipleImageUpload(e, "interiorExteriorPics")} className="hidden" />
                        </label>
                      </div>
                      {errors.interiorExteriorPics && <p className="text-red-500 text-[10px] mt-1">{(errors.interiorExteriorPics as any).message}</p>}
                    </div>

                  </div>
                </div>
              </div>

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
                    <ArrowLeft className="w-4 h-4" /> Back
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
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex-1 sm:flex-initial px-8 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.99] transition-all disabled:opacity-70 cursor-pointer"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Submit Hotel Application
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

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