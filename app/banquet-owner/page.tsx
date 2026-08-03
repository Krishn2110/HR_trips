"use client";

import { useEffect, useState } from "react";
import {
  GlassWater,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
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
  RefreshCw,
  X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BanquetRegistration, BanquetBooking } from "@/lib/types";

export default function BanquetOwnerDashboardPage() {
  const router = useRouter();
  const [banquet, setBanquet] = useState<BanquetRegistration | null>(null);
  const [bookings, setBookings] = useState<BanquetBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "bookings">("details");
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const loadProfile = async () => {
    setIsLoading(true);
    const email = sessionStorage.getItem("banquetOwnerEmail");
    if (!email) {
      router.push("/banquet-owner/login");
      return;
    }

    let foundBanquet: BanquetRegistration | null = null;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banquets/owner/get_profile.php?email=${encodeURIComponent(email)}`, {
        cache: "no-store"
      });
      const rawText = await res.text();
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        const json = JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
        if (res.ok && json.status === "success" && json.data) {
          foundBanquet = json.data;
        }
      }
    } catch {
      // fallback
    }

    if (!foundBanquet) {
      const localData = localStorage.getItem("hr_trips_banquet_registrations");
      if (localData) {
        const regs: BanquetRegistration[] = JSON.parse(localData);
        const match = regs.find(r => r.email === email);
        if (match) foundBanquet = match;
      }
    }

    setBanquet(foundBanquet);
    setIsLoading(false);
  };

  const loadBookings = async () => {
    setIsLoadingBookings(true);
    const email = sessionStorage.getItem("banquetOwnerEmail");

    let foundBookings: BanquetBooking[] = [];
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banquets/owner/get_bookings.php?email=${encodeURIComponent(email || "")}`, {
        cache: "no-store"
      });
      const rawText = await res.text();
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        const json = JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
        if (res.ok && json.status === "success") {
          foundBookings = json.data || [];
        }
      }
    } catch {
      // fallback
    }

    if (foundBookings.length === 0) {
      const localData = localStorage.getItem("hr_trips_banquet_bookings");
      if (localData) {
        foundBookings = JSON.parse(localData);
      }
    }

    setBookings(foundBookings);
    setIsLoadingBookings(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab === "bookings") {
      loadBookings();
    }
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-3" />
        <p className="text-muted text-xs">Loading banquet owner profile...</p>
      </div>
    );
  }

  if (!banquet) {
    return (
      <div className="bg-white rounded-3xl border border-border/50 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="font-heading font-bold text-xl text-ink">No Registered Banquet Found</h2>
        <p className="text-muted text-xs leading-relaxed">
          We couldn't find a banquet venue associated with your login credentials. Please register your banquet hall to activate your portal.
        </p>
        <Link
          href="/banquet-registration"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs transition-colors"
        >
          Register Banquet Venue Now
        </Link>
      </div>
    );
  }

  const statusLower = banquet.status?.toLowerCase() || "pending";

  return (
    <div className="space-y-8">
      {/* STATUS NOTIFICATION BANNER */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-sm relative overflow-hidden ${
        statusLower === 'approved' ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white border-emerald-500/20' :
        statusLower === 'rejected' ? 'bg-gradient-to-br from-rose-950 via-slate-900 to-rose-950 text-white border-rose-500/20' :
        'bg-gradient-to-br from-amber-950 via-slate-900 to-amber-950 text-white border-amber-500/20'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-xs border border-white/10">
              {statusLower === 'approved' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> <span className="text-emerald-400">Approved & Verified Partner</span>
                </>
              ) : statusLower === 'rejected' ? (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" /> <span className="text-rose-400">Registration Declined</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-400" /> <span className="text-amber-400">Verification Under Admin Review</span>
                </>
              )}
            </div>

            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
              {banquet.banquetName}
            </h1>
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
              {statusLower === 'approved' ? (
                "Your banquet hall is active and verified by HR Trips Admin. Customers can browse and book event dates at your venue."
              ) : statusLower === 'rejected' ? (
                "Your registration request was declined during admin compliance inspection. Please review your GST, NOC & photo documents."
              ) : (
                "Our team is inspecting your banquet registration, GST, Fire Safety NOC & compliance photos. You will receive trip bookings once approved."
              )}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-right shrink-0">
            <span className="text-[10px] text-white/60 uppercase font-bold block">Venue Location</span>
            <span className="text-sm font-bold text-white block mt-0.5">{banquet.city}, {banquet.state}</span>
            <span className="text-[11px] text-white/70 block mt-0.5">{banquet.pincode}</span>
          </div>
        </div>
      </div>

      {/* DASHBOARD TABS */}
      <div className="flex border-b border-border/40 gap-6">
        <button
          onClick={() => setActiveTab("details")}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "details" ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Banquet Venue Details & Inspection
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "bookings" ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Event Bookings ({bookings.length})
        </button>
      </div>

      {/* TAB 1: VENUE DETAILS */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Owner & Compliance */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-border/50 p-6 space-y-4 shadow-sm">
              <h3 className="font-heading font-bold text-ink text-base border-b border-border/40 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Owner & Property Management Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-surface rounded-xl">
                  <span className="text-muted block text-[10px] uppercase font-bold">Owner Name</span>
                  <span className="font-bold text-ink text-sm block mt-0.5">{banquet.ownerName}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl">
                  <span className="text-muted block text-[10px] uppercase font-bold">Owner Contact</span>
                  <span className="font-bold text-ink text-sm block mt-0.5">{banquet.ownerContact}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl">
                  <span className="text-muted block text-[10px] uppercase font-bold">Property Manager</span>
                  <span className="font-bold text-ink text-sm block mt-0.5">{banquet.propertyManagerName}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl">
                  <span className="text-muted block text-[10px] uppercase font-bold">Manager Phone</span>
                  <span className="font-bold text-ink text-sm block mt-0.5">{banquet.propertyManagerPhone}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl sm:col-span-2">
                  <span className="text-muted block text-[10px] uppercase font-bold">Email Address</span>
                  <span className="font-bold text-ink text-sm block mt-0.5">{banquet.email}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border/50 p-6 space-y-4 shadow-sm">
              <h3 className="font-heading font-bold text-ink text-base border-b border-border/40 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Compliance & Registration Numbers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-surface rounded-xl">
                  <span className="text-muted block text-[10px] uppercase font-bold">GST Number</span>
                  <span className="font-mono font-bold text-ink text-sm block mt-0.5">{banquet.gst}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl">
                  <span className="text-muted block text-[10px] uppercase font-bold">Registration Number</span>
                  <span className="font-mono font-bold text-ink text-sm block mt-0.5">{banquet.banquetRegistrationNumber}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl">
                  <span className="text-muted block text-[10px] uppercase font-bold">Fire Safety NOC</span>
                  <span className="font-bold text-emerald-700 text-sm block mt-0.5">{banquet.fireSafetyNoc}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl">
                  <span className="text-muted block text-[10px] uppercase font-bold">CCTV Camera Setup</span>
                  <span className="font-bold text-emerald-700 text-sm block mt-0.5">{banquet.cctvCamera}</span>
                </div>
              </div>
            </div>

            {/* Inspection Photos */}
            <div className="bg-white rounded-2xl border border-border/50 p-6 space-y-4 shadow-sm">
              <h3 className="font-heading font-bold text-ink text-base border-b border-border/40 pb-3">
                Inspection Documents & Photos
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Hall Photo", img: banquet.hallPic || (banquet.hallPics?.[0]) },
                  { label: "Reception Photo", img: banquet.receptionPic || (banquet.receptionPics?.[0]) },
                  { label: "Bathroom Photo", img: banquet.bathroomPic || (banquet.bathroomPics?.[0]) },
                  { label: "Interior/Exterior", img: banquet.interiorExteriorPic || (banquet.interiorExteriorPics?.[0]) },
                ].map((item, idx) => (
                  <div key={idx} className="border border-border/60 rounded-xl p-3 bg-surface/40 space-y-2">
                    <span className="text-[11px] font-bold text-ink block">{item.label}</span>
                    {item.img ? (
                      <div
                        onClick={() => setLightboxImg(item.img!)}
                        className="relative group h-24 rounded-lg overflow-hidden border border-border bg-black/5 cursor-pointer"
                      >
                        <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 rounded-lg border border-dashed border-border flex items-center justify-center text-muted text-[11px]">
                        No Photo
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bank & Location Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border/50 p-6 space-y-4 shadow-sm">
              <h3 className="font-heading font-bold text-ink text-base border-b border-border/40 pb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" /> Settlement Bank Payouts
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-surface rounded-xl">
                  <span className="text-muted block text-[10px] uppercase font-bold">Bank Name</span>
                  <span className="font-bold text-ink text-sm block mt-0.5">{banquet.bankName}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl">
                  <span className="text-muted block text-[10px] uppercase font-bold">Account Holder</span>
                  <span className="font-bold text-ink text-sm block mt-0.5">{banquet.accountHolderName}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl">
                  <span className="text-muted block text-[10px] uppercase font-bold">Account Number</span>
                  <span className="font-mono font-bold text-ink text-sm block mt-0.5">{banquet.accountNo}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl">
                  <span className="text-muted block text-[10px] uppercase font-bold">IFSC Code</span>
                  <span className="font-mono font-bold text-ink text-sm block mt-0.5">{banquet.ifscCode}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border/50 p-6 space-y-4 shadow-sm">
              <h3 className="font-heading font-bold text-ink text-base border-b border-border/40 pb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Address & Landmark
              </h3>
              <div className="space-y-2 text-xs">
                <p className="text-ink font-medium leading-relaxed">{banquet.address}</p>
                <p className="text-muted">{banquet.city}, {banquet.state} - {banquet.pincode}</p>
                {banquet.location && (
                  <a
                    href={banquet.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary font-bold text-xs hover:underline pt-2"
                  >
                    <MapPin className="w-3.5 h-3.5" /> View on Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOOKINGS */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl text-ink">Assigned Event Bookings</h2>
            <button
              onClick={loadBookings}
              disabled={isLoadingBookings}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-surface border border-border rounded-xl text-xs font-semibold text-ink cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBookings ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {isLoadingBookings ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-3" />
              <p className="text-muted text-xs">Loading event bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <GlassWater className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No Event Bookings Yet</h3>
              <p className="text-muted text-xs mt-1">When customers book your banquet hall for weddings or events, they will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface border-b border-border/50 text-muted uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Booking ID & Customer</th>
                    <th className="px-6 py-4">Event Details</th>
                    <th className="px-6 py-4">Event Date</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-ink block">#{b.id} - {b.customer_name}</span>
                        <span className="text-xs text-muted flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3 text-primary" /> {b.customer_phone}</span>
                        <span className="text-xs text-muted flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3 text-primary" /> {b.customer_email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-primary block">{b.event_type}</span>
                        <span className="text-xs text-muted block mt-0.5">{b.guest_count} Guests • {b.food_preference}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-ink flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-primary" /> {b.event_date}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                          b.booking_status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                          b.booking_status === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {b.booking_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* LIGHTBOX */}
      {lightboxImg && (
        <div onClick={() => setLightboxImg(null)} className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-3xl w-full p-4 space-y-3 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-bold text-xs text-ink">Inspection Photo Preview</span>
              <button onClick={() => setLightboxImg(null)} className="p-1 hover:bg-surface rounded-lg text-muted hover:text-ink cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-black/5 rounded-xl">
              <img src={lightboxImg} alt="Inspection Photo" className="max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
