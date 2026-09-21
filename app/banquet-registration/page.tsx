"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  GlassWater, ShieldCheck, CreditCard, User, MapPin, Upload,
  CheckCircle2, AlertCircle, Loader2, ArrowRight, ArrowLeft,
  X, Check, Camera, Users, IndianRupee, Star, AlignLeft
} from "lucide-react";
import { banquetRegistrationSchema } from "@/lib/validators"; 
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import LocationAutoSuggest, { fetchCityStateFromPincode } from "@/components/shared/LocationAutoSuggest";

type PhotoKey = "hallPic" | "receptionPic" | "bathroomPic" | "interiorExteriorPic";

export default function BanquetRegistrationPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<Partial<Record<PhotoKey, File>>>({});

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    setValue,
    getValues, // Added getValues to extract raw un-stripped data
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(banquetRegistrationSchema), 
    defaultValues: {
      ownerName: "", ownerContact: "", propertyManagerName: "", propertyManagerPhone: "",
      email: "", password: "", banquetName: "", 
      capacity: "", pricePerPlateVeg: "", pricePerPlateNonVeg: "", pricePerDay: "", 
      description: "", amenities: "", 
      gst: "", banquetRegistrationNumber: "", fireSafetyNoc: "Yes", cctvCamera: "Available",
      bankName: "", accountHolderName: "", accountNo: "", ifscCode: "",
      location: "", address: "", city: "", state: "", pincode: "",
      hallPic: "", receptionPic: "", bathroomPic: "", interiorExteriorPic: "",
    },
  });

  useEffect(() => {
    register("hallPic");
    register("receptionPic");
    register("bathroomPic");
    register("interiorExteriorPic");
  }, [register]);

  const handleSingleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: PhotoKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be less than 10MB.");
      e.target.value = "";
      return;
    }

    setSelectedFiles((prev) => ({ ...prev, [field]: file }));
    setValue(field, "file_uploaded", { shouldValidate: true });
    e.target.value = ""; 
  };

  const removeSingleImage = (field: PhotoKey) => {
    setSelectedFiles((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
    setValue(field, "", { shouldValidate: true });
  };

  const step1Fields = ["ownerName", "ownerContact", "propertyManagerName", "propertyManagerPhone", "email", "password", "location", "address", "city", "state", "pincode"];
  const step2Fields = ["banquetName", "capacity", "pricePerPlateVeg", "pricePerPlateNonVeg", "pricePerDay", "description", "amenities", "gst", "banquetRegistrationNumber", "fireSafetyNoc", "cctvCamera", "bankName", "accountHolderName", "accountNo", "ifscCode"];

  const nextStep = async () => {
    let fieldsToValidate = currentStep === 1 ? step1Fields : step2Fields;
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && currentStep < 3 && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
      nextStep();
    }
  };

  const onInvalid = (validationErrors: any) => {
    if (step1Fields.some((field) => validationErrors[field])) {
      setCurrentStep(1);
    } else if (step2Fields.some((field) => validationErrors[field])) {
      setCurrentStep(2);
    } else {
      setCurrentStep(3);
      alert("Please ensure all 4 property inspection photos are uploaded.");
    }
  };

  const onSubmit = async () => {
    const requiredPhotos: PhotoKey[] = ["hallPic", "receptionPic", "bathroomPic", "interiorExteriorPic"];
    if (requiredPhotos.some((field) => !selectedFiles[field])) {
      setCurrentStep(3);
      alert("Please ensure all 4 property inspection photos are uploaded.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const rawValues = getValues();
      const formData = new FormData();

      // 1. Append text fields
      formData.append("ownerName", rawValues.ownerName || "");
      formData.append("ownerContact", rawValues.ownerContact || "");
      formData.append("propertyManagerName", rawValues.propertyManagerName || "");
      formData.append("propertyManagerPhone", rawValues.propertyManagerPhone || "");
      formData.append("email", rawValues.email || "");
      formData.append("password", rawValues.password || "");
      
      formData.append("banquetName", rawValues.banquetName || "");
      formData.append("description", rawValues.description || "");
      
      // 2. FORCE NUMBERS AND AMENITIES INTACT
      formData.append("capacity", String(rawValues.capacity || "0"));
      formData.append("pricePerPlateVeg", String(rawValues.pricePerPlateVeg || "0"));
      formData.append("pricePerPlateNonVeg", String(rawValues.pricePerPlateNonVeg || "0"));
      formData.append("pricePerDay", String(rawValues.pricePerDay || "0"));
      
      const amenitiesStr = String(rawValues.amenities || "");
      const amenitiesArr = amenitiesStr.split(",").map((s) => s.trim()).filter(Boolean);
      formData.append("amenities", JSON.stringify(amenitiesArr));

      // 3. Append remaining fields
      formData.append("gst", rawValues.gst || "");
      formData.append("banquetRegistrationNumber", rawValues.banquetRegistrationNumber || "");
      formData.append("fireSafetyNoc", rawValues.fireSafetyNoc || "");
      formData.append("cctvCamera", rawValues.cctvCamera || "");
      formData.append("bankName", rawValues.bankName || "");
      formData.append("accountHolderName", rawValues.accountHolderName || "");
      formData.append("accountNo", rawValues.accountNo || "");
      formData.append("ifscCode", rawValues.ifscCode || "");
      formData.append("location", rawValues.location || "");
      formData.append("address", rawValues.address || "");
      formData.append("city", rawValues.city || "");
      formData.append("state", rawValues.state || "");
      formData.append("pincode", rawValues.pincode || "");

      // 4. Append actual Native Files
      if (selectedFiles.hallPic) formData.append("hallPic", selectedFiles.hallPic);
      if (selectedFiles.receptionPic) formData.append("receptionPic", selectedFiles.receptionPic);
      if (selectedFiles.bathroomPic) formData.append("bathroomPic", selectedFiles.bathroomPic);
      if (selectedFiles.interiorExteriorPic) formData.append("interiorExteriorPic", selectedFiles.interiorExteriorPic);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banquets/register.php`, {
        method: "POST",
        body: formData, 
      });

      const result = await response.json();

      if (!response.ok || result.status === "error") {
        throw new Error(result.message || "Banquet registration failed.");
      }

      setStatus("success");
      reset();
      setSelectedFiles({});
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error: any) {
      setStatus("error");
      setErrorMsg(error?.message || "Registration failed. Please try again.");
    }
  };

  const photoBoxes: Array<{ key: PhotoKey; label: string; description: string }> = [
    { key: "hallPic", label: "Room / Hall Photo", description: "Main celebration hall / event space view" },
    { key: "receptionPic", label: "Reception Photo", description: "Welcome counter / entrance lobby" },
    { key: "bathroomPic", label: "Washroom / Restroom Photo", description: "Guest restroom & sanitation area" },
    { key: "interiorExteriorPic", label: "Interior & Exterior Photo", description: "Building elevation & stage lighting setup" },
  ];

  return (
    <>
      <div className="relative h-56 lg:h-64 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1400&q=80')" }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        </div>
        <div className="container-wide relative z-10 pb-8">
          <h1 className="font-heading text-3xl lg:text-4xl font-bold !text-white mb-1">
            Register Your Banquet Hall
          </h1>
          <p className="text-sm lg:text-base !text-white/85">
            Partner your venue with HR Trips and start receiving event & wedding bookings
          </p>
        </div>
      </div>

      <div className="container-wide pt-4 pb-2">
        <Breadcrumbs items={[{ label: "Services", href: "/services" }, { label: "Banquet Registration" }]} />
      </div>

      <section className="section-padding bg-surface pt-6 pb-28 sm:pb-36">
        <div className="container-wide max-w-4xl mx-auto">
          {status === "success" ? (
            <div className="bg-white rounded-3xl border border-emerald-200 p-8 lg:p-12 text-center shadow-xl">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-ink mb-3">Banquet Registration Submitted!</h2>
              <p className="text-muted text-sm max-w-md mx-auto mb-8">
                Your venue details and photos have been submitted. Once verified, your banquet will be activated.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button onClick={() => { setStatus("idle"); setCurrentStep(1); }} className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs cursor-pointer">
                  Register Another Venue
                </button>
                <Link href="/services" className="px-6 py-3 border border-border text-ink hover:bg-surface font-semibold rounded-xl text-xs">
                  Return to Services
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} onKeyDown={handleKeyDown} className="space-y-8" noValidate>
              {/* PROGRESS BAR */}
              <div className="bg-white rounded-2xl border border-border/50 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                  <div className={`flex items-center gap-2 ${currentStep >= 1 ? "text-primary font-bold" : "text-muted"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 1 ? "bg-primary text-white" : "bg-surface border border-border"}`}>1</div>
                    <span className="text-xs hidden sm:inline">Owner & Location</span>
                  </div>
                  <div className={`h-1 flex-1 mx-4 rounded-full ${currentStep >= 2 ? "bg-primary" : "bg-border/60"}`} />
                  <div className={`flex items-center gap-2 ${currentStep >= 2 ? "text-primary font-bold" : "text-muted"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 2 ? "bg-primary text-white" : "bg-surface border border-border"}`}>2</div>
                    <span className="text-xs hidden sm:inline">Banquet Specs</span>
                  </div>
                  <div className={`h-1 flex-1 mx-4 rounded-full ${currentStep >= 3 ? "bg-primary" : "bg-border/60"}`} />
                  <div className={`flex items-center gap-2 ${currentStep >= 3 ? "text-primary font-bold" : "text-muted"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 3 ? "bg-primary text-white" : "bg-surface border border-border"}`}>3</div>
                    <span className="text-xs hidden sm:inline">Photos</span>
                  </div>
                </div>
              </div>

              {status === "error" && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700 text-xs">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{errorMsg}</p>
                </div>
              )}

              {/* STEP 1 */}
              <div className={`space-y-6 ${currentStep === 1 ? "block" : "hidden"}`}>
                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                  <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                    <User className="w-5 h-5 text-primary" /> Owner Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Owner Name *</label>
                      <input {...register("ownerName")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                      {errors.ownerName && <p className="text-red-500 text-[10px] mt-1">{(errors.ownerName as any).message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Owner Contact No *</label>
                      <input type="tel" {...register("ownerContact")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                      {errors.ownerContact && <p className="text-red-500 text-[10px] mt-1">{(errors.ownerContact as any).message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Property Manager Name *</label>
                      <input {...register("propertyManagerName")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                      {errors.propertyManagerName && <p className="text-red-500 text-[10px] mt-1">{(errors.propertyManagerName as any).message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Property Manager Phone *</label>
                      <input type="tel" {...register("propertyManagerPhone")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                      {errors.propertyManagerPhone && <p className="text-red-500 text-[10px] mt-1">{(errors.propertyManagerPhone as any).message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Email Address *</label>
                      <input type="email" {...register("email")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                      {errors.email && <p className="text-red-500 text-[10px] mt-1">{(errors.email as any).message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Password *</label>
                      <input type="password" {...register("password")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                      {errors.password && <p className="text-red-500 text-[10px] mt-1">{(errors.password as any).message}</p>}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                  <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                    <MapPin className="w-5 h-5 text-primary" /> Location & Address
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-muted mb-1.5">Google Maps Link / Landmark *</label>
                      <input {...register("location")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                      {errors.location && <p className="text-red-500 text-[10px] mt-1">{(errors.location as any).message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-muted mb-1.5">Full Street Address *</label>
                      <textarea rows={2} {...register("address")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none resize-none" />
                      {errors.address && <p className="text-red-500 text-[10px] mt-1">{(errors.address as any).message}</p>}
                    </div>
                    <div>
                      <LocationAutoSuggest label="City *" type="city" value={watch("city") || ""} onChange={(val) => setValue("city", val, { shouldValidate: true })} onSelectState={(st) => setValue("state", st, { shouldValidate: true })} error={(errors.city as any)?.message} />
                    </div>
                    <div>
                      <LocationAutoSuggest label="State *" type="state" value={watch("state") || ""} onChange={(val) => setValue("state", val, { shouldValidate: true })} error={(errors.state as any)?.message} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Pincode *</label>
                      <input {...register("pincode")} maxLength={6} onChange={async (e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setValue("pincode", val, { shouldValidate: true });
                        if (val.length === 6) {
                          try {
                            const loc = await fetchCityStateFromPincode(val);
                            if (loc?.city) setValue("city", loc.city, { shouldValidate: true });
                            if (loc?.state) setValue("state", loc.state, { shouldValidate: true });
                          } catch (err) {}
                        }
                      }} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none font-mono" />
                      {errors.pincode && <p className="text-red-500 text-[10px] mt-1">{(errors.pincode as any).message}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 2 */}
              <div className={`space-y-6 ${currentStep === 2 ? "block" : "hidden"}`}>
                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                  <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                    <GlassWater className="w-5 h-5 text-primary" /> Banquet Setup & Pricing
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-muted mb-1.5">Banquet Name *</label>
                      <input {...register("banquetName")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                      {errors.banquetName && <p className="text-red-500 text-[10px] mt-1">{(errors.banquetName as any).message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Maximum Capacity *</label>
                      <input type="number" {...register("capacity")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                      {errors.capacity && <p className="text-red-500 text-[10px] mt-1">{(errors.capacity as any).message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5 flex items-center gap-1"><Star className="w-3.5 h-3.5" /> Amenities (comma separated) *</label>
                      <input type="text" placeholder="e.g. AC Hall, DJ, Parking" {...register("amenities")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                      {errors.amenities && <p className="text-red-500 text-[10px] mt-1">{(errors.amenities as any).message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5 flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /> Veg Plate Price (₹)</label>
                      <input type="number" step="0.01" {...register("pricePerPlateVeg")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                      {errors.pricePerPlateVeg && <p className="text-red-500 text-[10px] mt-1">{(errors.pricePerPlateVeg as any).message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5 flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /> Non-Veg Plate Price (₹)</label>
                      <input type="number" step="0.01" {...register("pricePerPlateNonVeg")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5 flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /> Per Day Hall Rent (₹)</label>
                      <input type="number" step="0.01" {...register("pricePerDay")} placeholder="Optional rent without food" className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                    </div>
                    
                    {/* DESCRIPTION FIELD */}
                    <div className="sm:col-span-2 mt-2">
                      <label className="block text-xs font-semibold text-muted mb-1.5 flex items-center gap-1"><AlignLeft className="w-3.5 h-3.5" /> Description / About Banquet</label>
                      <textarea rows={3} {...register("description")} placeholder="Describe the ambiance, services, and special features of your banquet hall..." className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none resize-none" />
                      {errors.description && <p className="text-red-500 text-[10px] mt-1">{(errors.description as any).message}</p>}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                  <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                    <ShieldCheck className="w-5 h-5 text-primary" /> Compliance Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">GST Number *</label>
                      <input {...register("gst")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs font-mono text-ink border border-border focus:border-primary outline-none" />
                      {errors.gst && <p className="text-red-500 text-[10px] mt-1">{(errors.gst as any).message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Banquet Registration Number *</label>
                      <input {...register("banquetRegistrationNumber")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                      {errors.banquetRegistrationNumber && <p className="text-red-500 text-[10px] mt-1">{(errors.banquetRegistrationNumber as any).message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Fire Safety NOC *</label>
                      <select {...register("fireSafetyNoc")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none cursor-pointer">
                        <option value="Yes">Yes (NOC Issued)</option>
                        <option value="No">No</option>
                        <option value="In Process">In Process</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">CCTV Camera Setup *</label>
                      <select {...register("cctvCamera")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none cursor-pointer">
                        <option value="Available">Available (Full Coverage)</option>
                        <option value="Not Available">Not Available</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                  <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                    <CreditCard className="w-5 h-5 text-primary" /> Bank Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Bank Name *</label>
                      <input {...register("bankName")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                      {errors.bankName && <p className="text-red-500 text-[10px] mt-1">{(errors.bankName as any).message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Account Holder Name *</label>
                      <input {...register("accountHolderName")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none" />
                      {errors.accountHolderName && <p className="text-red-500 text-[10px] mt-1">{(errors.accountHolderName as any).message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Account Number *</label>
                      <input {...register("accountNo")} inputMode="numeric" className="w-full px-4 py-3 bg-surface rounded-xl text-xs font-mono text-ink border border-border focus:border-primary outline-none" />
                      {errors.accountNo && <p className="text-red-500 text-[10px] mt-1">{(errors.accountNo as any).message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">IFSC Code *</label>
                      <input {...register("ifscCode")} className="w-full px-4 py-3 bg-surface rounded-xl text-xs font-mono uppercase text-ink border border-border focus:border-primary outline-none" />
                      {errors.ifscCode && <p className="text-red-500 text-[10px] mt-1">{(errors.ifscCode as any).message}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3 */}
              <div className={`space-y-6 ${currentStep === 3 ? "block" : "hidden"}`}>
                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                  <div>
                    <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                      <Camera className="w-5 h-5 text-primary" /> Property Inspection Photos
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {photoBoxes.map((box) => {
                      const file = selectedFiles[box.key];
                      return (
                        <div key={box.key} className="border border-border/60 rounded-2xl p-4 bg-surface/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-ink">{box.label} *</label>
                            {file ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Check className="w-3 h-3" /> Uploaded
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">Required</span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted">{box.description}</p>
                          {file ? (
                            <div className="relative h-40 rounded-xl overflow-hidden border border-border bg-black/5">
                              <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeSingleImage(box.key)} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full cursor-pointer">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="h-40 border-2 border-dashed border-border/80 hover:border-primary rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer transition-colors bg-white hover:bg-primary/5">
                              <Upload className="w-6 h-6 text-primary mb-2" />
                              <span className="text-xs font-semibold text-ink">Click to Upload</span>
                              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleSingleImageUpload(e, box.key)} />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* NAVIGATION BUTTONS */}
              <div className="mt-8 p-4 sm:p-6 bg-white border border-border/50 rounded-2xl shadow-sm flex items-center justify-between">
                {currentStep > 1 ? (
                  <button type="button" onClick={prevStep} className="px-6 py-3 border border-border text-ink font-semibold rounded-xl text-xs hover:bg-surface cursor-pointer flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Previous Step
                  </button>
                ) : <div />}

                {currentStep < 3 ? (
                  <button type="button" onClick={nextStep} className="px-6 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-2">
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="submit" disabled={status === "loading"} className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 disabled:opacity-70 cursor-pointer">
                    {status === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Check className="w-4 h-4" /> Submit Registration</>}
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