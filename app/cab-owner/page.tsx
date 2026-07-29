"use client";

import { useEffect, useState } from "react";
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
  RefreshCw,
  Route,
  X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Interface for Cab Registration
interface FormattedCabRegistration {
  id: string;
  cabName: string;
  cabNo: string;
  cabType: string;
  engineNo: string;
  chassisNo: string;
  drivingLicenceNo: string;
  permit: string;
  insurance: string;
  fitness: string;
  fireSafety: string;
  ownerName: string;
  contactNo: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  driverName: string;
  driverContactNo: string;
  driverDlNo: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  status: string;
  createdAt: string;
  cabPic: string;
  interiorPic: string;
  rcPic: string;
  dlPic: string;
  insurancePic: string;
  permitPic: string;
  pucPic: string;
}

// Interface for Assigned Bookings
interface OwnerBooking {
  id: number;
  name: string;
  phone: string;
  pickup: string;
  dropoff: string;
  pickup_date: string;
  pickup_time: string;
  trip_type: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  amount: string;
}

// Image URL Helper to fix broken paths
const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path; 
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost/hr/api";
  apiUrl = apiUrl.replace(/\/$/, ""); 
  if (path.startsWith('/api') && apiUrl.endsWith('/api')) {
    apiUrl = apiUrl.substring(0, apiUrl.length - 4);
  }
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${apiUrl}${safePath}`;
};

export default function CabOwnerDashboardPage() {
  const router = useRouter();
  
  // States
  const [cabReg, setCabReg] = useState<FormattedCabRegistration | null>(null);
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "driver" | "trips">("overview");
  const [selectedPreview, setSelectedPreview] = useState<{ title: string; src: string } | null>(null);

  // Load Owner Profile
  const fetchCabReg = async () => {
    setIsLoading(true);
    const email = sessionStorage.getItem("cabOwnerEmail");
    if (!email) {
      setIsLoading(false);
      return;
    }

    try {
      let mappedReg = null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cabs/get_profile.php?email=${encodeURIComponent(email)}`, {
        cache: "no-store",
      });
      
      const rawText = await res.text();
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonText = rawText.substring(firstBrace, lastBrace + 1);
        const result = JSON.parse(jsonText);
        
        if (res.ok && result.status === "success" && result.data) {
          const dbData = result.data;
          
          mappedReg = {
            id: dbData.id,
            cabName: dbData.cab_name,
            cabNo: dbData.cab_no,
            cabType: dbData.cab_type,
            engineNo: dbData.engine_no,
            chassisNo: dbData.chassis_no,
            drivingLicenceNo: dbData.owner_dl_no || dbData.driving_licence_no || "",
            permit: dbData.permit_details || dbData.permit || "",
            insurance: dbData.insurance_details || dbData.insurance || "",
            fitness: dbData.fitness_details || dbData.fitness || "",
            fireSafety: dbData.fire_safety_status || dbData.fire_safety || "",
            ownerName: dbData.owner_name,
            contactNo: dbData.contact_no,
            email: dbData.email,
            address: dbData.address,
            city: dbData.city,
            state: dbData.state,
            pincode: dbData.pincode,
            driverName: dbData.driver_name,
            driverContactNo: dbData.driver_contact || dbData.driver_contact_no || "",
            driverDlNo: dbData.driver_dl_no,
            bankName: dbData.bank_name,
            accountNo: dbData.account_no,
            ifscCode: dbData.ifsc_code,
            status: dbData.status ? dbData.status.charAt(0).toUpperCase() + dbData.status.slice(1) : "Pending",
            createdAt: dbData.created_at,
            cabPic: getImageUrl(dbData.cab_pic),
            interiorPic: getImageUrl(dbData.interior_pic),
            rcPic: getImageUrl(dbData.rc_pic),
            dlPic: getImageUrl(dbData.dl_pic),
            insurancePic: getImageUrl(dbData.insurance_pic),
            permitPic: getImageUrl(dbData.permit_pic),
            pucPic: getImageUrl(dbData.puc_pic),
          };
        }
      }
      setCabReg(mappedReg);
    } catch (e) {
      console.error("Failed to load cab registration", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Owner Bookings
  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    const email = sessionStorage.getItem("cabOwnerEmail");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cabs/owner/get_bookings.php?email=${encodeURIComponent(email || "")}`, {
        cache: "no-store"
      });
      const rawText = await res.text();
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonText = rawText.substring(firstBrace, lastBrace + 1);
        const result = JSON.parse(jsonText);
        if (res.ok && result.status === "success") {
          setBookings(result.data || []);
        }
      }
    } catch (e) {
      console.error("Failed to load bookings", e);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Update Booking Status
  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    const email = sessionStorage.getItem("cabOwnerEmail");
    if (!confirm(`Are you sure you want to mark this trip as ${newStatus}?`)) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cabs/owner/update_booking_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId, status: newStatus, email })
      });
      const result = await res.json();
      if (res.ok && result.status === "success") {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus as any } : b));
      } else {
        alert(result.message || "Failed to update status.");
      }
    } catch (e) {
      alert("Network error.");
    }
  };

  useEffect(() => {
    fetchCabReg();
  }, []);

  useEffect(() => {
    if (activeTab === "trips") fetchBookings();
  }, [activeTab]);

  const handleLogout = () => {
    sessionStorage.clear();
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
      <div className="text-center py-20 bg-white rounded-2xl border border-border/50 shadow-sm p-8 max-w-md mx-auto mt-10">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="font-heading font-bold text-xl text-ink mb-2">No Active Cab Session</h2>
        <p className="text-muted text-xs mb-6">Could not retrieve your cab registration session details. Please login again.</p>
        <button onClick={handleLogout} className="inline-flex px-6 py-2.5 bg-primary text-white font-semibold rounded-xl text-xs hover:shadow-lg transition-all cursor-pointer">
          Go to Owner Login
        </button>
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
    <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
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
          <button onClick={fetchCabReg} className="p-2.5 bg-surface hover:bg-border/50 border border-border rounded-xl text-muted hover:text-ink transition-colors cursor-pointer" title="Refresh Status">
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button onClick={handleLogout} className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>

          {isApproved && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified & Active
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

      {/* DASHBOARD TABS */}
      <div className="flex border-b border-border/60 gap-8 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 text-xs font-bold transition-all relative ${activeTab === "overview" ? "text-primary border-b-2 border-primary" : "text-muted hover:text-ink"}`}
        >
          Vehicle & Specs
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 ${activeTab === "documents" ? "text-primary border-b-2 border-primary" : "text-muted hover:text-ink"}`}
        >
          Documents ({documentList.filter(d => d.src).length}/7)
        </button>
        <button
          onClick={() => setActiveTab("driver")}
          className={`pb-3 text-xs font-bold transition-all relative ${activeTab === "driver" ? "text-primary border-b-2 border-primary" : "text-muted hover:text-ink"}`}
        >
          Driver & Bank Info
        </button>
        <button
          onClick={() => setActiveTab("trips")}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${activeTab === "trips" ? "text-primary border-b-2 border-primary" : "text-muted hover:text-ink"}`}
        >
          <Route className="w-4 h-4" /> My Assigned Trips
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SPECS */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
            <h3 className="font-heading font-bold text-ink text-base border-b border-border/40 pb-3 flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" /> Technical Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
              <div><span className="text-muted block mb-0.5">Registration No</span><span className="font-mono font-bold text-primary text-sm uppercase">{cabReg.cabNo}</span></div>
              <div><span className="text-muted block mb-0.5">Engine Number</span><span className="font-mono font-semibold text-ink uppercase">{cabReg.engineNo}</span></div>
              <div><span className="text-muted block mb-0.5">Chassis Number</span><span className="font-mono font-semibold text-ink uppercase">{cabReg.chassisNo}</span></div>
              <div><span className="text-muted block mb-0.5">Permit Details</span><span className="font-semibold text-ink">{cabReg.permit}</span></div>
              <div><span className="text-muted block mb-0.5">Insurance Policy</span><span className="font-semibold text-ink">{cabReg.insurance}</span></div>
              <div><span className="text-muted block mb-0.5">Fitness Validity</span><span className="font-semibold text-ink">{cabReg.fitness}</span></div>
            </div>

            {cabReg.cabPic && (
              <div className="pt-4 border-t border-border/40">
                <span className="text-xs font-semibold text-muted mb-2 block">Cab Exterior Photo</span>
                <div className="h-48 rounded-xl overflow-hidden border border-border bg-black/5">
                  <img src={cabReg.cabPic} alt={cabReg.cabName} className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-4">
              <h3 className="font-heading font-bold text-ink text-sm border-b border-border/40 pb-3 flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Owner Profile</h3>
              <div className="space-y-3 text-xs">
                <div><span className="text-muted block">Owner Name</span><span className="font-bold text-ink">{cabReg.ownerName}</span></div>
                <div><span className="text-muted block">Contact Phone</span><span className="font-semibold text-ink flex items-center gap-1"><Phone className="w-3 h-3 text-primary" /> {cabReg.contactNo}</span></div>
                <div><span className="text-muted block">Email ID</span><span className="font-semibold text-ink flex items-center gap-1"><Mail className="w-3 h-3 text-primary" /> {cabReg.email}</span></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
              <h4 className="text-xs font-bold text-ink mb-2">Registration ID</h4>
              <span className="font-mono text-xs text-muted block mb-4">#{cabReg.id}</span>
              <span className="text-[11px] text-muted block">Submitted on: {new Date(cabReg.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VERIFICATION DOCUMENTS */}
      {activeTab === "documents" && (
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="font-heading font-bold text-ink text-base mb-1">Uploaded Document & Photo Copies</h3>
            <p className="text-muted text-xs">Click on any document card to view full size preview.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {documentList.map((doc) => (
              <div key={doc.key} className="border border-border/60 rounded-xl p-4 bg-surface/50 space-y-3 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">{doc.title}</span>
                  {doc.src ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Uploaded</span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Missing</span>
                  )}
                </div>

                {doc.src ? (
                  <div onClick={() => setSelectedPreview({ title: doc.title, src: doc.src })} className="relative group h-36 rounded-lg overflow-hidden border border-border bg-black/5 cursor-pointer">
                    <img src={doc.src} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                      <Eye className="w-4 h-4" /> View Full Image
                    </div>
                  </div>
                ) : (
                  <div className="h-36 rounded-lg border border-dashed border-border flex items-center justify-center text-muted text-xs">No image uploaded</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DRIVER & BANK */}
      {activeTab === "driver" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-4">
            <h3 className="font-heading font-bold text-ink text-base border-b border-border/40 pb-3 flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Assigned Driver Information</h3>
            <div className="space-y-3 text-xs">
              <div><span className="text-muted block">Driver Name</span><span className="font-bold text-ink text-sm">{cabReg.driverName}</span></div>
              <div><span className="text-muted block">Contact Number</span><span className="font-semibold text-ink flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-primary" /> {cabReg.driverContactNo}</span></div>
              <div><span className="text-muted block">Driving Licence (DL) No</span><span className="font-mono font-bold text-ink uppercase">{cabReg.driverDlNo}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-4">
            <h3 className="font-heading font-bold text-ink text-base border-b border-border/40 pb-3 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Settlement Bank Details</h3>
            <div className="space-y-3 text-xs">
              <div><span className="text-muted block">Bank Name</span><span className="font-bold text-ink text-sm">{cabReg.bankName}</span></div>
              <div><span className="text-muted block">Account Number</span><span className="font-mono font-bold text-ink">{cabReg.accountNo}</span></div>
              <div><span className="text-muted block">IFSC Code</span><span className="font-mono font-bold text-primary uppercase">{cabReg.ifscCode}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MY TRIPS */}
      {activeTab === "trips" && (
        <div className="space-y-6">
          {!isApproved && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" /> 
              You will only receive trip assignments once your cab is verified and approved by the admin.
            </div>
          )}

          {isLoadingBookings ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
              <p className="text-muted text-xs">Loading your assigned trips...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-2xl border border-border/50 shadow-sm p-8 max-w-lg mx-auto">
              <Route className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No Trips Assigned Yet</h3>
              <p className="text-muted text-xs mt-1">When an admin assigns a booking to your vehicle, it will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {bookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 md:p-6 hover:border-primary/30 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-border/40 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">Trip #{b.id}</span>
                        <span className="text-sm font-bold text-ink">{b.trip_type}</span>
                      </div>
                      <p className="text-xs text-muted flex items-center gap-2">
                        <Calendar className="w-3 h-3"/> {b.pickup_date} <Clock className="w-3 h-3 ml-1"/> {b.pickup_time}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <span className="text-xs text-muted block">Settlement Amount</span>
                      <span className="text-lg font-black text-emerald-600 flex items-center md:justify-end">
                        <IndianRupee className="w-4 h-4"/> {b.amount || "TBD"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3 relative">
                      <div className="absolute left-[9px] top-5 bottom-4 w-px bg-border border-dashed"></div>
                      <div className="flex gap-3 relative z-10">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-white"><MapPin className="w-3 h-3"/></div>
                        <div><p className="text-[10px] text-muted font-bold uppercase">Pickup Location</p><p className="text-xs font-medium text-ink">{b.pickup}</p></div>
                      </div>
                      <div className="flex gap-3 relative z-10">
                        <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-white"><MapPin className="w-3 h-3"/></div>
                        <div><p className="text-[10px] text-muted font-bold uppercase">Dropoff Location</p><p className="text-xs font-medium text-ink">{b.dropoff}</p></div>
                      </div>
                    </div>

                    <div className="bg-surface rounded-xl p-4 space-y-2">
                      <h4 className="text-[10px] uppercase font-bold text-muted mb-2">Customer Details</h4>
                      <p className="text-xs flex items-center gap-2"><User className="w-3 h-3 text-primary"/> <strong className="text-ink">{b.name}</strong></p>
                      <p className="text-xs flex items-center gap-2"><Phone className="w-3 h-3 text-primary"/> <a href={`tel:${b.phone}`} className="text-blue-600 hover:underline">{b.phone}</a></p>
                    </div>
                  </div>

                  {/* Status Action Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/40">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted">Current Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        b.status === 'completed' ? 'bg-green-100 text-green-700' :
                        b.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {b.status.replace("_", " ")}
                      </span>
                    </div>

                    {b.status !== 'completed' && b.status !== 'cancelled' && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        {b.status === 'confirmed' && (
                          <button 
                            onClick={() => updateBookingStatus(b.id, 'in_progress')}
                            className="flex-1 sm:flex-none px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Mark as Picked Up
                          </button>
                        )}
                        {(b.status === 'confirmed' || b.status === 'in_progress') && (
                          <button 
                            onClick={() => updateBookingStatus(b.id, 'completed')}
                            className="flex-1 sm:flex-none px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Mark as Completed
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LIGHTBOX MODAL PREVIEW */}
      {selectedPreview && (
        <div onClick={() => setSelectedPreview(null)} className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-3xl w-full p-4 overflow-hidden space-y-3 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4 className="font-bold text-sm text-ink">{selectedPreview.title}</h4>
              <button onClick={() => setSelectedPreview(null)} className="p-1 hover:bg-surface rounded-lg text-muted hover:text-ink cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-black/5 rounded-xl border border-border">
              <img src={selectedPreview.src} alt={selectedPreview.title} className="max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}