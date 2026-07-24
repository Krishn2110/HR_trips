"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  Car,
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
  Flame,
  Check,
  FileCheck
} from "lucide-react";
import { cabRegistrationSchema, type CabRegistrationFormData } from "@/lib/validators";
import { submitCabRegistration } from "@/lib/api";
import Breadcrumbs from "@/components/shared/Breadcrumbs";

export default function CabRegistrationPage() {
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
  } = useForm<CabRegistrationFormData>({
    resolver: zodResolver(cabRegistrationSchema),
    mode: "onTouched",
    defaultValues: {
      cabType: "Commercial",
      cabPic: "",
      interiorPic: "",
      rcPic: "",
      dlPic: "",
      insurancePic: "",
      permitPic: "",
      pucPic: "",
    },
  });

  // Watch fields for file preview
  const watchCabPic = watch("cabPic");
  const watchInteriorPic = watch("interiorPic");
  const watchRcPic = watch("rcPic");
  const watchDlPic = watch("dlPic");
  const watchInsurancePic = watch("insurancePic");
  const watchPermitPic = watch("permitPic");
  const watchPucPic = watch("pucPic");

  // Single file to Base64 handler
  const handleSingleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof CabRegistrationFormData
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setValue(field, reader.result as string, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeSingleImage = (field: keyof CabRegistrationFormData) => {
    setValue(field, "" as any, { shouldValidate: true });
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) {
      fieldsToValidate = [
        "ownerName",
        "contactNo",
        "email",
        "password",
        "address",
        "city",
        "state",
        "pincode",
      ];
    } else if (currentStep === 2) {
      fieldsToValidate = [
        "cabName",
        "cabNo",
        "engineNo",
        "chassisNo",
        "insurance",
        "fitness",
        "permit",
        "drivingLicenceNo",
        "fireSafety",
        "cabType",
        "bankName",
        "accountNo",
        "ifscCode",
        "driverName",
        "driverContactNo",
        "driverDlNo",
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
    console.error("Form Validation Failed:", validationErrors);
    const step1Fields = ["ownerName", "contactNo", "email", "password", "address", "city", "state", "pincode"];
    const step2Fields = [
      "cabName", "cabNo", "engineNo", "chassisNo", "insurance", "fitness",
      "permit", "drivingLicenceNo", "fireSafety", "cabType", "bankName",
      "accountNo", "ifscCode", "driverName", "driverContactNo", "driverDlNo"
    ];

    if (step1Fields.some((field) => validationErrors[field])) {
      setCurrentStep(1);
    } else if (step2Fields.some((field) => validationErrors[field])) {
      setCurrentStep(2);
    } else {
      setCurrentStep(3);
      alert("Please ensure all document & vehicle photos are uploaded.");
    }
  };

  const onSubmit = async (data: CabRegistrationFormData) => {
    setStatus("loading");
    setErrorMsg("");

    try {
      // Remote API or Local Storage Submission
      try {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          formData.append(key, (data as any)[key]);
        });
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cabs/register.php`, {
          method: "POST",
          body: formData,
        });
      } catch {
        // Fallback to client-side storage
      }

      await submitCabRegistration(data);

      setStatus("success");
      reset();
      setCurrentStep(1);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err?.message || "Registration failed. Please try again.");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const fileUploadBoxes: {
    key: keyof CabRegistrationFormData;
    label: string;
    description: string;
    value: string;
    icon: any;
  }[] = [
    { key: "cabPic", label: "Cab Exterior Photo", description: "Front/side full view of vehicle", value: watchCabPic, icon: Car },
    { key: "interiorPic", label: "Interior Photo", description: "Dashboard & seating arrangement", value: watchInteriorPic, icon: ImageIcon },
    { key: "rcPic", label: "Registration Certificate (RC)", description: "Clear photo of vehicle RC card", value: watchRcPic, icon: FileCheck },
    { key: "dlPic", label: "Driving Licence (DL)", description: "Owner/Driver valid Licence card", value: watchDlPic, icon: FileText },
    { key: "insurancePic", label: "Insurance Policy Image", description: "Valid motor insurance paper", value: watchInsurancePic, icon: ShieldCheck },
    { key: "permitPic", label: "Permit Certificate", description: "Commercial / State tourist permit", value: watchPermitPic, icon: FileText },
    { key: "pucPic", label: "Pollution (PUC) Certificate", description: "Valid emission test certificate", value: watchPucPic, icon: CheckCircle2 },
  ];

  return (
    <>
      {/* Header Banner */}
      <div className="relative h-56 lg:h-64 flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1400&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        </div>
        <div className="container-wide relative z-10 pb-8">
          <h1
            style={{ color: "#ffffff" }}
            className="font-heading text-3xl lg:text-4xl font-bold !text-white mb-1"
          >
            Register Your Cab / Vehicle
          </h1>
          <p
            style={{ color: "rgba(255, 255, 255, 0.85)" }}
            className="text-sm lg:text-base !text-white/85"
          >
            Partner with HR Trips as an authorized cab operator and start earning
          </p>
        </div>
      </div>

      <div className="container-wide pt-4 pb-2">
        <Breadcrumbs
          items={[
            { label: "Cab Services", href: "/cab-services" },
            { label: "Cab Owner Registration" },
          ]}
        />
      </div>

      <section className="section-padding bg-surface pt-6 pb-28 sm:pb-36">
        <div className="container-wide max-w-4xl mx-auto">
          {/* SUCCESS MESSAGE STATE */}
          {status === "success" ? (
            <div className="bg-white rounded-3xl border border-emerald-200 p-8 lg:p-12 text-center shadow-xl shadow-emerald-500/5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-ink mb-3">
                Cab Registration Request Submitted!
              </h2>
              <p className="text-muted text-sm max-w-md mx-auto mb-8">
                Your cab details & verification documents have been submitted to HR Trips Admin. Once verified by our team, your vehicle will be activated for customer bookings.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/cab-owner/login"
                  className="px-6 py-3.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <Car className="w-4 h-4" /> Go to Cab Owner Portal
                </Link>
                <button
                  onClick={() => setStatus("idle")}
                  className="px-6 py-3.5 border border-border text-ink font-semibold rounded-xl text-sm hover:bg-surface transition-colors"
                >
                  Register Another Vehicle
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
              {/* STEP WIZARD INDICATOR */}
              <div className="bg-white rounded-2xl border border-border/50 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />
                  <div
                    className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
                    style={{
                      width:
                        currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
                    }}
                  />

                  {/* Step 1 */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                        currentStep >= 1
                          ? "bg-primary text-white shadow-md shadow-primary/30"
                          : "bg-surface border border-border text-muted"
                      }`}
                    >
                      1
                    </div>
                    <span className="text-[11px] font-semibold text-ink mt-1.5 hidden sm:block">
                      Owner Info
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                        currentStep >= 2
                          ? "bg-primary text-white shadow-md shadow-primary/30"
                          : "bg-surface border border-border text-muted"
                      }`}
                    >
                      2
                    </div>
                    <span className="text-[11px] font-semibold text-ink mt-1.5 hidden sm:block">
                      Vehicle & Bank
                    </span>
                  </div>

                  {/* Step 3 */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                        currentStep >= 3
                          ? "bg-primary text-white shadow-md shadow-primary/30"
                          : "bg-surface border border-border text-muted"
                      }`}
                    >
                      3
                    </div>
                    <span className="text-[11px] font-semibold text-ink mt-1.5 hidden sm:block">
                      Documents & Photos
                    </span>
                  </div>
                </div>
              </div>

              {/* ERROR MESSAGE */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-xs font-medium">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* STEP 1: Owner Details & Credentials */}
              <div className={`space-y-6 ${currentStep === 1 ? "block" : "hidden"}`}>
                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                  <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                    <User className="w-5 h-5 text-primary" /> Owner Information & Portal Credentials
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Owner Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          {...register("ownerName")}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                      </div>
                      {errors.ownerName && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.ownerName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Contact Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          {...register("contactNo")}
                          placeholder="10-digit mobile number"
                          className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                      </div>
                      {errors.contactNo && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.contactNo.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Email Address (Owner Login ID) *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          type="email"
                          {...register("email")}
                          placeholder="owner@example.com"
                          className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Portal Account Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          type="password"
                          {...register("password")}
                          placeholder="Set password for owner login"
                          className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Street Address *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          {...register("address")}
                          placeholder="Full address of owner"
                          className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                      </div>
                      {errors.address && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.address.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        City *
                      </label>
                      <input
                        {...register("city")}
                        placeholder="e.g. Patna / Ranchi"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        State *
                      </label>
                      <input
                        {...register("state")}
                        placeholder="e.g. Bihar"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.state && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.state.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Pincode *
                      </label>
                      <input
                        {...register("pincode")}
                        placeholder="6-digit Pincode"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.pincode && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.pincode.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 2: Cab Specifications, Driver & Bank Details */}
              <div className={`space-y-6 ${currentStep === 2 ? "block" : "hidden"}`}>
                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                  <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                    <Car className="w-5 h-5 text-primary" /> Vehicle & Technical Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Cab / Vehicle Name *
                      </label>
                      <input
                        {...register("cabName")}
                        placeholder="e.g. Toyota Innova Crysta / Swift Dzire"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.cabName && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.cabName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Cab / Vehicle Number (Registration No) *
                      </label>
                      <input
                        {...register("cabNo")}
                        placeholder="e.g. BR 01 AB 1234"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none uppercase"
                      />
                      {errors.cabNo && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.cabNo.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Cab Type *
                      </label>
                      <select
                        {...register("cabType")}
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      >
                        <option value="Commercial">Commercial (Yellow Plate)</option>
                        <option value="Private">Private</option>
                      </select>
                      {errors.cabType && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.cabType.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Engine Number *
                      </label>
                      <input
                        {...register("engineNo")}
                        placeholder="Engine number as per RC"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none uppercase"
                      />
                      {errors.engineNo && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.engineNo.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Chassis Number *
                      </label>
                      <input
                        {...register("chassisNo")}
                        placeholder="Chassis number as per RC"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none uppercase"
                      />
                      {errors.chassisNo && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.chassisNo.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Driving Licence Number *
                      </label>
                      <input
                        {...register("drivingLicenceNo")}
                        placeholder="DL Number"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none uppercase"
                      />
                      {errors.drivingLicenceNo && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.drivingLicenceNo.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Insurance Details / Policy No *
                      </label>
                      <input
                        {...register("insurance")}
                        placeholder="Insurance Company & Policy No"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.insurance && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.insurance.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Fitness Certificate Details *
                      </label>
                      <input
                        {...register("fitness")}
                        placeholder="Fitness Validity / Certificate No"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.fitness && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.fitness.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Permit Type & Details *
                      </label>
                      <input
                        {...register("permit")}
                        placeholder="All India Tourist / State Permit"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.permit && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.permit.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Fire Safety Status *
                      </label>
                      <input
                        {...register("fireSafety")}
                        placeholder="Extinguisher Installed / Active"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                      />
                      {errors.fireSafety && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.fireSafety.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Driver Details Section */}
                  <div className="pt-4 border-t border-border/30">
                    <h4 className="font-heading font-bold text-ink text-sm flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-primary" /> Driver Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] text-muted mb-1 font-medium">
                          Driver Name *
                        </label>
                        <input
                          {...register("driverName")}
                          placeholder="Primary Driver Name"
                          className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                        {errors.driverName && (
                          <p className="text-red-500 text-[10px] mt-1">
                            {errors.driverName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] text-muted mb-1 font-medium">
                          Driver Contact No *
                        </label>
                        <input
                          {...register("driverContactNo")}
                          placeholder="Driver Phone Number"
                          className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                        {errors.driverContactNo && (
                          <p className="text-red-500 text-[10px] mt-1">
                            {errors.driverContactNo.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] text-muted mb-1 font-medium">
                          Driver DL No *
                        </label>
                        <input
                          {...register("driverDlNo")}
                          placeholder="Driver Licence Number"
                          className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none uppercase"
                        />
                        {errors.driverDlNo && (
                          <p className="text-red-500 text-[10px] mt-1">
                            {errors.driverDlNo.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bank Settlement Details Section */}
                  <div className="pt-4 border-t border-border/30">
                    <h4 className="font-heading font-bold text-ink text-sm flex items-center gap-2 mb-3">
                      <CreditCard className="w-4 h-4 text-primary" /> Bank Details (For Trip Settlements)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] text-muted mb-1 font-medium">
                          Bank Name *
                        </label>
                        <input
                          {...register("bankName")}
                          placeholder="e.g. HDFC Bank"
                          className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                        {errors.bankName && (
                          <p className="text-red-500 text-[10px] mt-1">
                            {errors.bankName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] text-muted mb-1 font-medium">
                          Account Number *
                        </label>
                        <input
                          {...register("accountNo")}
                          placeholder="Bank Account Number"
                          className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
                        />
                        {errors.accountNo && (
                          <p className="text-red-500 text-[10px] mt-1">
                            {errors.accountNo.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] text-muted mb-1 font-medium">
                          IFSC Code *
                        </label>
                        <input
                          {...register("ifscCode")}
                          placeholder="e.g. HDFC0001234"
                          className="w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none uppercase"
                        />
                        {errors.ifscCode && (
                          <p className="text-red-500 text-[10px] mt-1">
                            {errors.ifscCode.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: Photos & Document Image Uploads */}
              <div className={`space-y-6 ${currentStep === 3 ? "block" : "hidden"}`}>
                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                  <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2 border-b border-border/40 pb-3">
                    <Upload className="w-5 h-5 text-primary" /> Vehicle Photos & Required Verification Documents
                  </h3>
                  <p className="text-muted text-xs">
                    Please upload clear photos or scanned copies of the vehicle and documents. Admin will inspect these for verification.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {fileUploadBoxes.map((box) => {
                      const BoxIcon = box.icon;
                      return (
                        <div
                          key={box.key}
                          className="border border-border/60 rounded-2xl p-4 bg-surface/50 hover:bg-surface transition-colors flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <BoxIcon className="w-4 h-4 text-primary shrink-0" />
                              <span className="text-xs font-bold text-ink">
                                {box.label} *
                              </span>
                            </div>
                            <p className="text-[11px] text-muted mb-3 leading-snug">
                              {box.description}
                            </p>

                            {/* UPLOAD BOX / PREVIEW */}
                            {box.value ? (
                              <div className="relative group rounded-xl overflow-hidden border border-border h-32 bg-black/5">
                                <img
                                  src={box.value}
                                  alt={box.label}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => removeSingleImage(box.key)}
                                    className="p-2 bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-red-700 transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" /> Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="border-2 border-dashed border-border hover:border-primary bg-white rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors h-32">
                                <Upload className="w-6 h-6 text-muted mb-1" />
                                <span className="text-xs font-semibold text-primary">
                                  Upload File
                                </span>
                                <span className="text-[10px] text-muted mt-0.5">
                                  PNG, JPG or WEBP (Max 5MB)
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleSingleImageUpload(e, box.key)}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>

                          {errors[box.key] && (
                            <p className="text-red-500 text-[10px] mt-2">
                              {(errors[box.key] as any)?.message}
                            </p>
                          )}
                        </div>
                      );
                    })}
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
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Submit Cab Registration
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
