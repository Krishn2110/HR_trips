"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  GlassWater,
  ShieldCheck,
  CreditCard,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  FileText,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Building2,
  Camera
} from "lucide-react";
import { banquetRegistrationSchema, type BanquetRegistrationFormData } from "@/lib/validators";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { submitBanquetRegistration } from "@/lib/api";
import LocationAutoSuggest, { fetchCityStateFromPincode } from "@/components/shared/LocationAutoSuggest";

export default function BanquetRegistrationPage() {
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
  } = useForm<BanquetRegistrationFormData>({
    resolver: zodResolver(banquetRegistrationSchema),
    defaultValues: {
      ownerName: "",
      ownerContact: "",
      propertyManagerName: "",
      propertyManagerPhone: "",
      email: "",
      password: "",
      banquetName: "",
      gst: "",
      banquetRegistrationNumber: "",
      fireSafetyNoc: "Yes",
      cctvCamera: "Available",
      bankName: "",
      accountHolderName: "",
      accountNo: "",
      ifscCode: "",
      location: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      hallPic: "",
      receptionPic: "",
      bathroomPic: "",
      interiorExteriorPic: "",
    },
  });

  const watchHallPic = watch("hallPic");
  const watchReceptionPic = watch("receptionPic");
  const watchBathroomPic = watch("bathroomPic");
  const watchInteriorPic = watch("interiorExteriorPic");

  // Single file to Base64 handler with fast canvas compression
  const handleSingleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof BanquetRegistrationFormData
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be less than 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
        setValue(field, compressedDataUrl as any, { shouldValidate: true });
      };
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeSingleImage = (field: keyof BanquetRegistrationFormData) => {
    setValue(field, "" as any, { shouldValidate: true });
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) {
      fieldsToValidate = [
        "ownerName", "ownerContact", "propertyManagerName", "propertyManagerPhone",
        "email", "password", "address", "city", "state", "pincode", "location"
      ];
    } else if (currentStep === 2) {
      fieldsToValidate = [
        "banquetName", "gst", "banquetRegistrationNumber", "fireSafetyNoc",
        "cctvCamera", "bankName", "accountHolderName", "accountNo", "ifscCode"
      ];
    }

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onInvalid = (validationErrors: any) => {
    console.error("Validation Failed:", validationErrors);
    const step1Fields = ["ownerName", "ownerContact", "email", "password", "city", "state", "pincode"];
    const step2Fields = ["banquetName", "gst", "banquetRegistrationNumber", "bankName", "accountNo"];

    if (step1Fields.some((field) => validationErrors[field])) {
      setCurrentStep(1);
    } else if (step2Fields.some((field) => validationErrors[field])) {
      setCurrentStep(2);
    } else {
      setCurrentStep(3);
      alert("Please ensure all 4 property inspection photos are uploaded.");
    }
  };

  // Sub-second Submission
  const onSubmit = async (data: BanquetRegistrationFormData) => {
    setStatus("loading");
    setErrorMsg("");

    try {
      await submitBanquetRegistration(data);

      try {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          formData.append(key, (data as any)[key]);
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banquets/register.php`, {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (remoteErr) {
        console.log("Remote backend sync notice:", remoteErr);
      }

      setStatus("success");
      reset();
      setCurrentStep(1);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err?.message || "Registration failed. Please try again.");
    }
  };

  const photoBoxes: {
    key: keyof BanquetRegistrationFormData;
    label: string;
    description: string;
    value: string;
  }[] = [
    { key: "hallPic", label: "Room / Hall Photo", description: "Main celebration hall / event space view", value: watchHallPic },
    { key: "receptionPic", label: "Reception Photo", description: "Welcome counter / entrance lobby", value: watchReceptionPic },
    { key: "bathroomPic", label: "Washroom / Restroom Photo", description: "Guest restroom & sanitation area", value: watchBathroomPic },
    { key: "interiorExteriorPic", label: "Interior & Exterior Photo", description: "Building elevation & stage lighting setup", value: watchInteriorPic },
  ];

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
            Register Your Banquet Hall
          </h1>
          <p
            style={{ color: "rgba(255, 255, 255, 0.85)" }}
            className="text-sm lg:text-base !text-white/85"
          >
            Partner your venue with HR Trips and start receiving event & wedding bookings
          </p>
        </div>
      </div>

      <div className="container-wide pt-4 pb-2">
        <Breadcrumbs
          items={[
            { label: "Services", href: "/services" },
            { label: "Banquet Registration" },
          ]}
        />
      </div>

      <section className="section-padding bg-surface pt-6 pb-28 sm:pb-36">
        <div className="container-wide max-w-4xl mx-auto">
          {/* SUCCESS STATE */}
          {status === "success" ? (
            <div className="bg-white rounded-3xl border border-emerald-200 p-8 lg:p-12 text-center shadow-xl shadow-emerald-500/5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-ink mb-3">
                Banquet Registration Request Submitted!
              </h2>
              <p className="text-muted text-sm max-w-md mx-auto mb-8">
                Your banquet venue details & compliance photos have been submitted to HR Trips Admin. Once verified, your banquet will be activated for customer bookings.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => setStatus("idle")}
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Register Another Venue
                </button>
                <Link
                  href="/services"
                  className="px-6 py-3 border border-border text-ink hover:bg-surface font-semibold rounded-xl text-xs transition-colors"
                >
                  Return to Services
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8">
              {/* STEP PROGRESS BAR */}
              <div className="bg-white rounded-2xl border border-border/50 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                  <div className={`flex items-center gap-2 ${currentStep >= 1 ? "text-primary font-bold" : "text-muted"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 1 ? "bg-primary text-white" : "bg-surface border border-border"}`}>
                      1
                    </div>
                    <span className="text-xs hidden sm:inline">Owner & Location</span>
                  </div>
                  <div className={`h-1 flex-1 mx-4 rounded-full ${currentStep >= 2 ? "bg-primary" : "bg-border/60"}`} />
                  <div className={`flex items-center gap-2 ${currentStep >= 2 ? "text-primary font-bold" : "text-muted"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 2 ? "bg-primary text-white" : "bg-surface border border-border"}`}>
                      2
                    </div>
                    <span className="text-xs hidden sm:inline">Banquet & Bank Specs</span>
                  </div>
                  <div className={`h-1 flex-1 mx-4 rounded-full ${currentStep >= 3 ? "bg-primary" : "bg-border/60"}`} />
                  <div className={`flex items-center gap-2 ${currentStep >= 3 ? "text-primary font-bold" : "text-muted"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 3 ? "bg-primary text-white" : "bg-surface border border-border"}`}>
                      3
                    </div>
                    <span className="text-xs hidden sm:inline">Inspection Photos</span>
                  </div>
                </div>
              </div>

              {status === "error" && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700 text-xs">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{errorMsg}</p>
                </div>
              )}

              {/* STEP 1: Owner, Manager & Location Details */}
              <div className={`space-y-6 ${currentStep === 1 ? "block" : "hidden"}`}>
                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                  <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                    <User className="w-5 h-5 text-primary" /> Owner & Property Management Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Owner Name *</label>
                      <input
                        {...register("ownerName")}
                        placeholder="e.g. Rakesh Sharma"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.ownerName && <p className="text-red-500 text-[10px] mt-1">{errors.ownerName.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Owner Contact No *</label>
                      <input
                        {...register("ownerContact")}
                        placeholder="10-digit mobile number"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.ownerContact && <p className="text-red-500 text-[10px] mt-1">{errors.ownerContact.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Property Manager Name *</label>
                      <input
                        {...register("propertyManagerName")}
                        placeholder="e.g. Vikram Singh"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.propertyManagerName && <p className="text-red-500 text-[10px] mt-1">{errors.propertyManagerName.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Property Manager Phone *</label>
                      <input
                        {...register("propertyManagerPhone")}
                        placeholder="10-digit mobile number"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.propertyManagerPhone && <p className="text-red-500 text-[10px] mt-1">{errors.propertyManagerPhone.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Email Address (For Portal Login) *</label>
                      <input
                        type="email"
                        {...register("email")}
                        placeholder="owner@example.com"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Password (For Future Logins) *</label>
                      <input
                        type="password"
                        {...register("password")}
                        placeholder="Min. 6 characters"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.password && <p className="text-red-500 text-[10px] mt-1">{errors.password.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                  <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                    <MapPin className="w-5 h-5 text-primary" /> Location & Address
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-muted mb-1.5">Google Maps Link / Landmark Location *</label>
                      <input
                        {...register("location")}
                        placeholder="e.g. https://maps.google.com/?q=... or Near Gandhi Maidan"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.location && <p className="text-red-500 text-[10px] mt-1">{errors.location.message}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-muted mb-1.5">Full Street Address *</label>
                      <textarea
                        rows={2}
                        {...register("address")}
                        placeholder="Full street address of the banquet hall..."
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none resize-none"
                      />
                      {errors.address && <p className="text-red-500 text-[10px] mt-1">{errors.address.message}</p>}
                    </div>

                    <div>
                      <LocationAutoSuggest
                        label="City *"
                        type="city"
                        value={watch("city") || ""}
                        onChange={(val) => setValue("city", val, { shouldValidate: true })}
                        onSelectState={(st) => setValue("state", st, { shouldValidate: true })}
                        placeholder="e.g. Patna / New Delhi"
                        error={errors.city?.message}
                      />
                    </div>

                    <div>
                      <LocationAutoSuggest
                        label="State *"
                        type="state"
                        value={watch("state") || ""}
                        onChange={(val) => setValue("state", val, { shouldValidate: true })}
                        placeholder="e.g. Bihar"
                        error={errors.state?.message}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Pincode *</label>
                      <input
                        {...register("pincode")}
                        onChange={async (e) => {
                          const val = e.target.value;
                          setValue("pincode", val, { shouldValidate: true });
                          if (val.replace(/\D/g, "").length === 6) {
                            const loc = await fetchCityStateFromPincode(val);
                            if (loc) {
                              if (loc.city) setValue("city", loc.city, { shouldValidate: true });
                              if (loc.state) setValue("state", loc.state, { shouldValidate: true });
                            }
                          }
                        }}
                        placeholder="Auto-fetches City & State"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none font-mono"
                      />
                      {errors.pincode && <p className="text-red-500 text-[10px] mt-1">{errors.pincode.message}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 2: Banquet Specs, Reg/GST/NOC & Bank Details */}
              <div className={`space-y-6 ${currentStep === 2 ? "block" : "hidden"}`}>
                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                  <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                    <GlassWater className="w-5 h-5 text-primary" /> Banquet Specifications & Compliance
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Banquet Name *</label>
                      <input
                        {...register("banquetName")}
                        placeholder="e.g. Grand Celebration Banquet Hall"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.banquetName && <p className="text-red-500 text-[10px] mt-1">{errors.banquetName.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">GST Number (15 Digits) *</label>
                      <input
                        {...register("gst")}
                        placeholder="e.g. 10ABCDE1234F1Z5"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs font-mono text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.gst && <p className="text-red-500 text-[10px] mt-1">{errors.gst.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Banquet Registration Number *</label>
                      <input
                        {...register("banquetRegistrationNumber")}
                        placeholder="e.g. BQ-2024-8891"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.banquetRegistrationNumber && <p className="text-red-500 text-[10px] mt-1">{errors.banquetRegistrationNumber.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Fire Safety NOC *</label>
                      <select
                        {...register("fireSafetyNoc")}
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none cursor-pointer"
                      >
                        <option value="Yes">Yes (NOC Issued)</option>
                        <option value="No">No</option>
                        <option value="In Process">In Process</option>
                      </select>
                      {errors.fireSafetyNoc && <p className="text-red-500 text-[10px] mt-1">{errors.fireSafetyNoc.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">CCTV Camera Setup *</label>
                      <select
                        {...register("cctvCamera")}
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none cursor-pointer"
                      >
                        <option value="Available">Available (Full Coverage)</option>
                        <option value="Not Available">Not Available</option>
                      </select>
                      {errors.cctvCamera && <p className="text-red-500 text-[10px] mt-1">{errors.cctvCamera.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                  <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                    <CreditCard className="w-5 h-5 text-primary" /> Bank Details (For Payouts)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Bank Name *</label>
                      <input
                        {...register("bankName")}
                        placeholder="e.g. State Bank of India"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
                      />
                      {errors.bankName && <p className="text-red-500 text-[10px] mt-1">{errors.bankName.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Account Holder Name *</label>
                      <input
                        {...register("accountHolderName")}
                        placeholder="As written in bank passbook"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none"
                      />
                      {errors.accountHolderName && <p className="text-red-500 text-[10px] mt-1">{errors.accountHolderName.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Account Number *</label>
                      <input
                        {...register("accountNo")}
                        placeholder="e.g. 123456789012"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs font-mono text-ink border border-border focus:border-primary outline-none"
                      />
                      {errors.accountNo && <p className="text-red-500 text-[10px] mt-1">{errors.accountNo.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">IFSC Code *</label>
                      <input
                        {...register("ifscCode")}
                        placeholder="e.g. SBIN0001234"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs font-mono text-ink border border-border focus:border-primary outline-none"
                      />
                      {errors.ifscCode && <p className="text-red-500 text-[10px] mt-1">{errors.ifscCode.message}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: Property Inspection Photo Uploads */}
              <div className={`space-y-6 ${currentStep === 3 ? "block" : "hidden"}`}>
                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                  <div>
                    <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                      <Camera className="w-5 h-5 text-primary" /> Property Inspection Photos
                    </h3>
                    <p className="text-xs text-muted mt-2">
                      Upload clear photos for admin verification. JPG/PNG images up to 10MB each.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {photoBoxes.map((box) => (
                      <div key={box.key} className="border border-border/60 rounded-2xl p-4 bg-surface/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-ink">{box.label} *</label>
                          {box.value ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Check className="w-3 h-3" /> Uploaded
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted">Required</span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted">{box.description}</p>

                        {box.value ? (
                          <div className="relative h-40 rounded-xl overflow-hidden border border-border group bg-black/5">
                            <img src={box.value} alt={box.label} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeSingleImage(box.key)}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="h-40 border-2 border-dashed border-border/80 hover:border-primary rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer transition-colors bg-white hover:bg-primary/5">
                            <Upload className="w-6 h-6 text-primary mb-2" />
                            <span className="text-xs font-semibold text-ink">Click to Upload {box.label}</span>
                            <span className="text-[10px] text-muted mt-1">PNG, JPG up to 10MB</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleSingleImageUpload(e, box.key)}
                            />
                          </label>
                        )}
                        {errors[box.key] && (
                          <p className="text-red-500 text-[10px] mt-1">{(errors[box.key] as any)?.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* NAVIGATION CONTROL BUTTONS */}
              <div className="mt-8 p-4 sm:p-6 bg-white border border-border/50 rounded-2xl shadow-sm flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-border text-ink font-semibold rounded-xl text-xs hover:bg-surface cursor-pointer transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous Step
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-70"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting Registration...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Submit Banquet Registration
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
