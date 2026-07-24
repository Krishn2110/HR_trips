"use client";

import { useEffect, useState } from "react";
import type { CabRegistration } from "@/lib/types";
import { getCabRegistrationByEmail } from "@/lib/api";
import {
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileCheck,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building2,
  FileText,
  AlertTriangle,
  IndianRupee,
  Calendar,
  Eye,
  LogOut,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CabOwnerDashboardPage() {
  const router = useRouter();
  const [cabReg, setCabReg] = useState<CabRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "driver">("overview");
  const [selectedPreview, setSelectedPreview] = useState<{ title: string; src: string } | null>(null);

  const fetchCabReg = async () => {
    setIsLoading(true);
    const email = sessionStorage.getItem("cabOwnerEmail");
    if (!email) {
      setIsLoading(false);
      return;
    }

    try {
      // Try local storage registry
      let reg = await getCabRegistrationByEmail(email);

      // Remote PHP API check fallback
      if (!reg) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cabs/get_profile.php?email=${encodeURIComponent(email)}`, {
            cache: "no-store",
          });
          const rawText = await res.text();
          const firstBrace = rawText.indexOf('{');
          const lastBrace = rawText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            const jsonText = rawText.substring(firstBrace, lastBrace + 1);
            const result = JSON.parse(jsonText);
            if (res.ok && result.status === "success") {
              reg = result.data;
            }
          }
        } catch {
          // ignore
        }
      }

      setCabReg(reg);
    } catch (e) {
      console.error("Failed to load cab registration", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCabReg();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("cabOwnerLoggedIn");
    sessionStorage.removeItem("cabOwnerEmail");
    sessionStorage.removeItem("cabOwnerId");
    router.push("/cab-owner/login");
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
        <p className="text-muted text-xs">Loading vehicle verification status...</p>
      </div>
    );
  }

  if (!cabReg) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-border/50 shadow-sm p-8 max-w-md mx-auto">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="font-heading font-bold text-xl text-ink mb-2">No Active Cab Session</h2>
        <p className="text-muted text-xs mb-6">Could not retrieve your cab registration session details.</p>
        <Link
          href="/cab-owner/login"
          className="inline-flex px-6 py-2.5 bg-primary text-white font-semibold rounded-xl text-xs hover:shadow-lg transition-all"
        >
          Go to Owner Login
        </Link>
      </div>
    );
  }

  const documentList = [
    { title: "Cab Exterior Photo", key: "cabPic", src: cabReg.cabPic },
    { title: "Interior Photo", key: "interiorPic", src: cabReg.interiorPic },
    { title: "Registration Certificate (RC)", key: "rcPic", src: cabReg.rcPic },
    { title: "Driving Licence (DL)", key: "dlPic", src: cabReg.dlPic },
    { title: "Insurance Policy Image", key: "insurancePic", src: cabReg.insurancePic },
    { title: "Permit Certificate", key: "permitPic", src: cabReg.permitPic },
    { title: "Pollution (PUC) Certificate", key: "pucPic", src: cabReg.pucPic },
  ];

  const isApproved = cabReg.status === "Approved";
  const isPending = cabReg.status === "Pending";
  const isRejected = cabReg.status === "Rejected";

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-heading font-bold text-2xl text-ink">
              {cabReg.cabName}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-surface border border-border text-ink uppercase">
              {cabReg.cabNo}
            </span>
          </div>
          <p className="text-muted text-xs flex items-center gap-2">
            <span>Owner: <strong className="text-ink">{cabReg.ownerName}</strong></span>
            <span>•</span>
            <span>Type: <strong className="text-ink">{cabReg.cabType}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCabReg}
            className="p-2.5 bg-surface hover:bg-border/50 border border-border rounded-xl text-muted hover:text-ink transition-colors cursor-pointer"
            title="Refresh Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {isApproved && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Vehicle Verified & Active
            </span>
          )}
          {isPending && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold shadow-sm">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" /> Verification Pending
            </span>
          )}
          {isRejected && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold shadow-sm">
              <XCircle className="w-4 h-4 text-rose-600" /> Verification Declined
            </span>
          )}
        </div>
      </div>

      {/* VERIFICATION STATUS NOTICE BANNER */}
      {isPending && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-ink mb-1">
                Vehicle Verification in Progress
              </h3>
              <p className="text-muted text-xs leading-relaxed max-w-2xl">
                Your cab details (RC, Insurance, Permit, Driving Licence, PUC) have been submitted to HR Trips Admin. Once our team verifies all uploaded document copies, your cab will be activated for customer trip dispatch.
              </p>
            </div>
          </div>
          <div className="shrink-0 bg-white border border-amber-200 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] uppercase font-bold text-muted block">Status</span>
            <span className="text-xs font-bold text-amber-700">UNDER ADMIN REVIEW</span>
          </div>
        </div>
      )}

      {isApproved && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-ink mb-1">
                Vehicle Verified & Ready for Rides
              </h3>
              <p className="text-muted text-xs leading-relaxed max-w-2xl">
                Congratulations! All 7 vehicle documents & photos have been verified and approved by Admin. Your vehicle is listed under HR Trips active fleet.
              </p>
            </div>
          </div>
          <div className="shrink-0 bg-emerald-600 text-white rounded-xl px-4 py-2 text-center shadow-md">
            <span className="text-[10px] uppercase font-bold opacity-80 block">Fleet Badge</span>
            <span className="text-xs font-bold">VERIFIED CAB</span>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/20 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/20">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-ink mb-1">
              Vehicle Verification Declined
            </h3>
            <p className="text-muted text-xs leading-relaxed mb-3">
              Your vehicle registration request was declined due to incomplete or unreadable document images. Please re-check your uploaded RC, DL, or Insurance papers.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 hover:underline"
            >
              Contact Support Team
            </Link>
          </div>
        </div>
      )}

      {/* DASHBOARD TABS */}
      <div className="flex border-b border-border/60 gap-8">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === "overview"
              ? "text-primary border-b-2 border-primary"
              : "text-muted hover:text-ink"
          }`}
        >
          Vehicle & Technical Specifications
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 ${
            activeTab === "documents"
              ? "text-primary border-b-2 border-primary"
              : "text-muted hover:text-ink"
          }`}
        >
          Verification Documents ({documentList.filter(d => d.src).length}/7)
        </button>
        <button
          onClick={() => setActiveTab("driver")}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === "driver"
              ? "text-primary border-b-2 border-primary"
              : "text-muted hover:text-ink"
          }`}
        >
          Driver & Bank Settlement Info
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SPECS */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Cab Specs Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
            <h3 className="font-heading font-bold text-ink text-base border-b border-border/40 pb-3 flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" /> Technical & Registration Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
              <div>
                <span className="text-muted block mb-0.5">Cab Name</span>
                <span className="font-bold text-ink text-sm">{cabReg.cabName}</span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">Registration Number</span>
                <span className="font-mono font-bold text-primary text-sm uppercase">{cabReg.cabNo}</span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">Engine Number</span>
                <span className="font-mono font-semibold text-ink uppercase">{cabReg.engineNo}</span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">Chassis Number</span>
                <span className="font-mono font-semibold text-ink uppercase">{cabReg.chassisNo}</span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">Licence Number</span>
                <span className="font-mono font-semibold text-ink uppercase">{cabReg.drivingLicenceNo}</span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">Permit Details</span>
                <span className="font-semibold text-ink">{cabReg.permit}</span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">Insurance Policy</span>
                <span className="font-semibold text-ink">{cabReg.insurance}</span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">Fitness Validity</span>
                <span className="font-semibold text-ink">{cabReg.fitness}</span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">Fire Safety Extinguisher</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] inline-block">
                  {cabReg.fireSafety}
                </span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">Cab Classification</span>
                <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded text-[11px] inline-block">
                  {cabReg.cabType} Vehicle
                </span>
              </div>
            </div>

            {/* Cab Exterior Preview Thumbnail */}
            {cabReg.cabPic && (
              <div className="pt-4 border-t border-border/40">
                <span className="text-xs font-semibold text-muted mb-2 block">Cab Exterior Photo</span>
                <div className="h-48 rounded-xl overflow-hidden border border-border bg-black/5">
                  <img src={cabReg.cabPic} alt={cabReg.cabName} className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>

          {/* Owner Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-4">
              <h3 className="font-heading font-bold text-ink text-sm border-b border-border/40 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Owner Profile
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted block">Owner Name</span>
                  <span className="font-bold text-ink">{cabReg.ownerName}</span>
                </div>
                <div>
                  <span className="text-muted block">Contact Phone</span>
                  <span className="font-semibold text-ink flex items-center gap-1">
                    <Phone className="w-3 h-3 text-primary" /> {cabReg.contactNo}
                  </span>
                </div>
                <div>
                  <span className="text-muted block">Email ID</span>
                  <span className="font-semibold text-ink flex items-center gap-1">
                    <Mail className="w-3 h-3 text-primary" /> {cabReg.email}
                  </span>
                </div>
                <div>
                  <span className="text-muted block">Registered Address</span>
                  <span className="text-ink leading-relaxed flex items-start gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                    {cabReg.address}, {cabReg.city}, {cabReg.state} - {cabReg.pincode}
                  </span>
                </div>
              </div>
            </div>

            {/* Registration Metadata */}
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
              <h4 className="text-xs font-bold text-ink mb-2">Registration ID</h4>
              <span className="font-mono text-xs text-muted block mb-4">{cabReg.id}</span>
              <span className="text-[11px] text-muted block">
                Submitted on: {new Date(cabReg.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VERIFICATION DOCUMENTS */}
      {activeTab === "documents" && (
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="font-heading font-bold text-ink text-base mb-1">
              Uploaded Document & Photo Copies
            </h3>
            <p className="text-muted text-xs">
              Click on any document card to view full size image preview.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {documentList.map((doc) => (
              <div
                key={doc.key}
                className="border border-border/60 rounded-xl p-4 bg-surface/50 space-y-3 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">{doc.title}</span>
                  {doc.src ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Missing
                    </span>
                  )}
                </div>

                {doc.src ? (
                  <div
                    onClick={() => setSelectedPreview({ title: doc.title, src: doc.src })}
                    className="relative group h-36 rounded-lg overflow-hidden border border-border bg-black/5 cursor-pointer"
                  >
                    <img src={doc.src} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                      <Eye className="w-4 h-4" /> View Full Image
                    </div>
                  </div>
                ) : (
                  <div className="h-36 rounded-lg border border-dashed border-border flex items-center justify-center text-muted text-xs">
                    No image uploaded
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DRIVER & BANK */}
      {activeTab === "driver" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Driver Details Card */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-4">
            <h3 className="font-heading font-bold text-ink text-base border-b border-border/40 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Assigned Driver Information
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-muted block">Driver Name</span>
                <span className="font-bold text-ink text-sm">{cabReg.driverName}</span>
              </div>
              <div>
                <span className="text-muted block">Driver Contact Number</span>
                <span className="font-semibold text-ink flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-primary" /> {cabReg.driverContactNo}
                </span>
              </div>
              <div>
                <span className="text-muted block">Driver Driving Licence (DL) No</span>
                <span className="font-mono font-bold text-ink uppercase">{cabReg.driverDlNo}</span>
              </div>
            </div>
          </div>

          {/* Bank Details Card */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-4">
            <h3 className="font-heading font-bold text-ink text-base border-b border-border/40 pb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Settlement Bank Details
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-muted block">Bank Name</span>
                <span className="font-bold text-ink text-sm">{cabReg.bankName}</span>
              </div>
              <div>
                <span className="text-muted block">Account Number</span>
                <span className="font-mono font-bold text-ink">{cabReg.accountNo}</span>
              </div>
              <div>
                <span className="text-muted block">IFSC Code</span>
                <span className="font-mono font-bold text-primary uppercase">{cabReg.ifscCode}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL PREVIEW */}
      {selectedPreview && (
        <div
          onClick={() => setSelectedPreview(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full p-4 overflow-hidden space-y-3 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4 className="font-bold text-sm text-ink">{selectedPreview.title}</h4>
              <button
                onClick={() => setSelectedPreview(null)}
                className="p-1 hover:bg-surface rounded-lg text-muted hover:text-ink cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-black/5 rounded-xl">
              <img
                src={selectedPreview.src}
                alt={selectedPreview.title}
                className="max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
