"use client";

import { useEffect, useState } from "react";
import { 
  X, Image as ImageIcon, CheckCircle2, XCircle, 
  Eye, FileText, Phone, Mail, User, Car, CreditCard, Loader2,
  MapPin, Calendar, Clock, Edit, Save, IndianRupee
} from "lucide-react";

// --- INTERFACES ---
interface CabRegistration {
  id: string | number;
  owner_name: string;
  contact_no: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  cab_name: string;
  cab_no: string;
  engine_no: string;
  chassis_no: string;
  cab_type: string;
  insurance_details: string;
  fitness_details: string;
  permit_details: string;
  fire_safety_status: string;
  bank_name: string;
  account_no: string;
  ifsc_code: string;
  driver_name: string;
  driver_contact: string;
  owner_dl_no: string;
  driver_dl_no: string;
  cab_pic: string;
  interior_pic: string;
  rc_pic: string;
  dl_pic: string;
  insurance_pic: string;
  permit_pic: string;
  puc_pic: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

interface CabBooking {
  id: number;
  name: string;
  email: string;
  phone: string;
  pickup: string;
  dropoff: string;
  pickup_date: string;
  pickup_time: string;
  trip_type: string;
  cab_type: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  amount: string | null;
  assigned_cab_id: number | null;
  created_at: string;
  // Joined fields from registrations
  assigned_cab_name?: string;
  assigned_cab_no?: string;
  assigned_owner_name?: string;
  assigned_driver_name?: string;
  assigned_driver_contact?: string;
}

interface ApprovedCab {
  id: number;
  cab_name: string;
  cab_no: string;
  owner_name: string;
  cab_type: string;
}

// --- HELPER FUNCTION ---
const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path; 
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost/hr/api";
  apiUrl = apiUrl.replace(/\/$/, ""); 
  if (path.startsWith('/api') && apiUrl.endsWith('/api')) {
    apiUrl = apiUrl.substring(0, apiUrl.length - 4);
  }
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${apiUrl}${safePath}`;
};

export default function AdminCabsPage() {
  const [activeTab, setActiveTab] = useState<"registrations" | "bookings">("registrations");

  // ==========================================
  // STATE: REGISTRATIONS
  // ==========================================
  const [registrations, setRegistrations] = useState<CabRegistration[]>([]);
  const [isLoadingRegs, setIsLoadingRegs] = useState(false);
  const [viewingReg, setViewingReg] = useState<CabRegistration | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // ==========================================
  // STATE: BOOKINGS
  // ==========================================
  const [bookings, setBookings] = useState<CabBooking[]>([]);
  const [approvedCabs, setApprovedCabs] = useState<ApprovedCab[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [managingBooking, setManagingBooking] = useState<CabBooking | null>(null);
  const [updateData, setUpdateData] = useState({ amount: "", assigned_cab_id: "", status: "pending" });
  const [isUpdatingBooking, setIsUpdatingBooking] = useState(false);

  // ==========================================
  // API: LOAD REGISTRATIONS
  // ==========================================
  const loadRegistrations = async () => {
    setIsLoadingRegs(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cabs/list_registrations.php`, { cache: "no-store" });
      const rawText = await response.text();
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonText = rawText.substring(firstBrace, lastBrace + 1);
        const result = JSON.parse(jsonText);
        if (response.ok && result.status === "success") setRegistrations(result.data || []);
      }
    } catch (e) {
      console.error("Failed to load cab registrations", e);
    } finally {
      setIsLoadingRegs(false);
    }
  };

  const updateRegistrationStatus = async (id: string | number, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this registration as ${newStatus.toUpperCase()}?`)) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cabs/update_registration_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      const result = await response.json();
      if (response.ok && result.status === "success") {
        setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
        if (viewingReg && viewingReg.id === id) setViewingReg({ ...viewingReg, status: newStatus as any });
      } else {
        alert(result.message || "Failed to update status");
      }
    } catch (e) {
      alert("Network error updating status");
    }
  };

  // ==========================================
  // API: LOAD BOOKINGS & APPROVED CABS
  // ==========================================
  const loadBookingsData = async () => {
    setIsLoadingBookings(true);
    try {
      // Fetch Bookings
      const resBookings = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cabs/bookings/list.php`, { cache: "no-store" });
      const textBookings = await resBookings.text();
      const fbBookings = textBookings.indexOf('{');
      const lbBookings = textBookings.lastIndexOf('}');
      if (fbBookings !== -1 && lbBookings !== -1) {
        const json = JSON.parse(textBookings.substring(fbBookings, lbBookings + 1));
        if (json.status === "success") setBookings(json.data || []);
      }

      // Fetch Approved Cabs for Dropdown
      const resCabs = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cabs/list_approved.php`, { cache: "no-store" });
      const textCabs = await resCabs.text();
      const fbCabs = textCabs.indexOf('{');
      const lbCabs = textCabs.lastIndexOf('}');
      if (fbCabs !== -1 && lbCabs !== -1) {
        const json = JSON.parse(textCabs.substring(fbCabs, lbCabs + 1));
        if (json.status === "success") setApprovedCabs(json.data || []);
      }
    } catch (e) {
      console.error("Failed to load bookings", e);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const openManageModal = (booking: CabBooking) => {
    setUpdateData({
      amount: booking.amount || "",
      assigned_cab_id: booking.assigned_cab_id ? booking.assigned_cab_id.toString() : "",
      status: booking.status
    });
    setManagingBooking(booking);
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingBooking) return;
    setIsUpdatingBooking(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cabs/bookings/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: managingBooking.id,
          amount: updateData.amount || null,
          assigned_cab_id: updateData.assigned_cab_id || null,
          status: updateData.status
        })
      });

      const result = await response.json();
      if (response.ok && result.status === "success") {
        setManagingBooking(null);
        loadBookingsData(); // Refresh list to get updated join data
      } else {
        alert(result.message || "Failed to update booking");
      }
    } catch (e) {
      alert("Network error updating booking");
    } finally {
      setIsUpdatingBooking(false);
    }
  };

  // ==========================================
  // EFFECT HOOKS
  // ==========================================
  useEffect(() => {
    if (activeTab === "registrations") loadRegistrations();
    if (activeTab === "bookings") loadBookingsData();
  }, [activeTab]);


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink">Manage Cab Fleet</h1>
          <p className="text-muted text-xs mt-1">Review owner registrations and monitor cab booking requests.</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-border/40 gap-4 mb-6">
        <button
          onClick={() => setActiveTab("registrations")}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${activeTab === "registrations" ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}
        >
          Owner Registrations
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${activeTab === "bookings" ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}
        >
          Booking Requests
        </button>
      </div>

      {/* ==========================================
          TAB 1: OWNER REGISTRATIONS 
          ========================================== */}
      {activeTab === "registrations" && (
        <div className="space-y-6">
          {isLoadingRegs ? (
            <div className="py-20 flex flex-col items-center justify-center text-center"><Loader2 className="w-8 h-8 animate-spin text-primary mb-3" /><p className="text-muted text-xs">Loading registrations...</p></div>
          ) : registrations.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <FileText className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No Registrations Found</h3>
              <p className="text-muted text-xs mt-1">When cab owners apply, their applications will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface border-b border-border/50 text-muted uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">ID & Date</th>
                    <th className="px-6 py-4">Owner Info</th>
                    <th className="px-6 py-4">Vehicle Details</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-ink block">#{reg.id}</span>
                        <span className="text-[10px] text-muted">{new Date(reg.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-ink block">{reg.owner_name}</span>
                        <span className="text-xs text-muted flex items-center gap-1 mt-1"><Mail className="w-3 h-3"/> {reg.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-primary block">{reg.cab_name}</span>
                        <span className="text-xs text-muted block mt-1">{reg.cab_no} ({reg.cab_type})</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          reg.status === 'approved' ? 'bg-green-100 text-green-700' :
                          reg.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setViewingReg(reg)} className="px-3 py-1.5 bg-surface hover:bg-blue-50 text-ink hover:text-blue-600 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors">
                          <Eye className="w-3.5 h-3.5" /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 2: BOOKING REQUESTS 
          ========================================== */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          {isLoadingBookings ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-muted text-xs">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white p-8">
              <FileText className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-ink text-lg">No Booking Requests</h3>
              <p className="text-muted text-xs mt-1">Cab booking requests from customers will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface border-b border-border/50 text-muted uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">ID & Customer</th>
                    <th className="px-6 py-4">Trip Route</th>
                    <th className="px-6 py-4">Req. Details</th>
                    <th className="px-6 py-4">Assigned Info</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-ink block">#{b.id} - {b.name}</span>
                        <span className="text-xs text-muted block mt-1">{b.phone}</span>
                        <span className="text-[10px] text-muted block mt-0.5">{new Date(b.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-500" /> {b.pickup}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-red-500" /> {b.dropoff}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-primary block text-xs">{b.trip_type}</span>
                        <span className="text-xs text-muted block mt-1">Req: {b.cab_type}</span>
                        <span className="text-[10px] text-muted block mt-1">{b.pickup_date} at {b.pickup_time}</span>
                      </td>
                      <td className="px-6 py-4">
                        {b.assigned_cab_id ? (
                          <div>
                            <span className="font-semibold text-ink block text-xs">{b.assigned_cab_no}</span>
                            <span className="text-[10px] text-muted block mt-0.5">{b.assigned_cab_name}</span>
                            <span className="font-bold text-emerald-600 block mt-1">₹{b.amount}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          b.status === 'completed' ? 'bg-green-100 text-green-700' :
                          b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openManageModal(b)} className="px-3 py-1.5 bg-surface hover:bg-primary/10 text-ink hover:text-primary rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors">
                          <Edit className="w-3.5 h-3.5" /> Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}


      {/* ==========================================
          MODALS & LIGHTBOX
          ========================================== */}
      
      {/* 1. Registration Verification Modal */}
      {viewingReg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border max-w-5xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-white z-10 sticky top-0">
              <div>
                <h2 className="font-heading font-bold text-xl text-ink">Application #{viewingReg.id}</h2>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="text-muted">Status:</span>
                  <span className={`px-2 py-0.5 font-bold uppercase tracking-wider rounded-md ${
                    viewingReg.status === 'approved' ? 'bg-green-100 text-green-700' :
                    viewingReg.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {viewingReg.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setViewingReg(null)} className="p-2 hover:bg-surface rounded-xl text-muted cursor-pointer"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-surface/30">
              {/* Owner & Bank Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-border/50 shadow-sm">
                  <h4 className="font-bold text-sm text-ink mb-4 flex items-center gap-2 border-b border-border/40 pb-2"><User className="w-4 h-4 text-primary"/> Owner Details</h4>
                  <div className="space-y-3 text-xs">
                    <p><span className="text-muted w-24 inline-block">Name:</span> <strong className="text-ink">{viewingReg.owner_name}</strong></p>
                    <p><span className="text-muted w-24 inline-block">Email:</span> <strong className="text-ink">{viewingReg.email}</strong></p>
                    <p><span className="text-muted w-24 inline-block">Phone:</span> <strong className="text-ink">{viewingReg.contact_no}</strong></p>
                    <p><span className="text-muted w-24 inline-block">Address:</span> <strong className="text-ink">{viewingReg.address}, {viewingReg.city}, {viewingReg.state} - {viewingReg.pincode}</strong></p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-border/50 shadow-sm">
                  <h4 className="font-bold text-sm text-ink mb-4 flex items-center gap-2 border-b border-border/40 pb-2"><CreditCard className="w-4 h-4 text-primary"/> Bank Details</h4>
                  <div className="space-y-3 text-xs">
                    <p><span className="text-muted w-24 inline-block">Bank Name:</span> <strong className="text-ink">{viewingReg.bank_name}</strong></p>
                    <p><span className="text-muted w-24 inline-block">Account No:</span> <strong className="text-ink">{viewingReg.account_no}</strong></p>
                    <p><span className="text-muted w-24 inline-block">IFSC Code:</span> <strong className="text-ink">{viewingReg.ifsc_code}</strong></p>
                  </div>
                </div>
              </div>

              {/* Vehicle & Driver Info */}
              <div className="bg-white p-5 rounded-2xl border border-border/50 shadow-sm">
                <h4 className="font-bold text-sm text-ink mb-4 flex items-center gap-2 border-b border-border/40 pb-2"><Car className="w-4 h-4 text-primary"/> Vehicle & Technical Specs</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                  <p><span className="text-muted block mb-0.5">Cab Name</span> <strong className="text-ink text-sm">{viewingReg.cab_name}</strong></p>
                  <p><span className="text-muted block mb-0.5">Cab Number</span> <strong className="text-ink bg-surface px-2 py-1 rounded border border-border/60">{viewingReg.cab_no}</strong></p>
                  <p><span className="text-muted block mb-0.5">Cab Type</span> <strong className="text-ink">{viewingReg.cab_type}</strong></p>
                  <p><span className="text-muted block mb-0.5">Engine Number</span> <strong className="text-ink">{viewingReg.engine_no}</strong></p>
                  <p><span className="text-muted block mb-0.5">Chassis Number</span> <strong className="text-ink">{viewingReg.chassis_no}</strong></p>
                  <p><span className="text-muted block mb-0.5">Fire Safety</span> <strong className="text-ink">{viewingReg.fire_safety_status}</strong></p>
                  <p><span className="text-muted block mb-0.5">Insurance Info</span> <strong className="text-ink">{viewingReg.insurance_details}</strong></p>
                  <p><span className="text-muted block mb-0.5">Fitness Info</span> <strong className="text-ink">{viewingReg.fitness_details}</strong></p>
                  <p><span className="text-muted block mb-0.5">Permit Info</span> <strong className="text-ink">{viewingReg.permit_details}</strong></p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                  <p><span className="text-muted block mb-0.5">Driver Name</span> <strong className="text-ink">{viewingReg.driver_name}</strong></p>
                  <p><span className="text-muted block mb-0.5">Driver Phone</span> <strong className="text-ink">{viewingReg.driver_contact}</strong></p>
                  <p><span className="text-muted block mb-0.5">Driver DL No</span> <strong className="text-ink uppercase">{viewingReg.driver_dl_no}</strong></p>
                  <p><span className="text-muted block mb-0.5">Owner DL No</span> <strong className="text-ink uppercase">{viewingReg.owner_dl_no}</strong></p>
                </div>
              </div>

              {/* Uploaded Documents Grid */}
              <div className="bg-white p-5 rounded-2xl border border-border/50 shadow-sm">
                <h4 className="font-bold text-sm text-ink mb-4 flex items-center gap-2 border-b border-border/40 pb-2"><ImageIcon className="w-4 h-4 text-primary"/> Document Verification</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[
                    { label: "Cab Exterior", url: viewingReg.cab_pic },
                    { label: "Interior", url: viewingReg.interior_pic },
                    { label: "RC Copy", url: viewingReg.rc_pic },
                    { label: "Owner DL", url: viewingReg.dl_pic },
                    { label: "Insurance", url: viewingReg.insurance_pic },
                    { label: "Permit", url: viewingReg.permit_pic },
                    { label: "PUC", url: viewingReg.puc_pic }
                  ].map((doc, i) => (
                    <div key={i} className="border border-border/50 rounded-xl overflow-hidden group cursor-pointer" onClick={() => setLightboxImage(doc.url)}>
                      <div className="h-24 bg-surface relative">
                        {doc.url ? (
                          <img src={getImageUrl(doc.url)} alt={doc.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted"><ImageIcon className="w-5 h-5"/></div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="p-2 text-center bg-white border-t border-border/50">
                        <span className="text-[10px] font-bold text-ink block">{doc.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border/50 bg-white sticky bottom-0 flex items-center justify-end gap-3">
              {viewingReg.status === "pending" && (
                <>
                  <button onClick={() => updateRegistrationStatus(viewingReg.id, 'approved')} className="px-6 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Approve Registration
                  </button>
                  <button onClick={() => updateRegistrationStatus(viewingReg.id, 'rejected')} className="px-6 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </>
              )}
              {viewingReg.status !== "pending" && (
                <button onClick={() => updateRegistrationStatus(viewingReg.id, 'pending')} className="px-6 py-2.5 bg-amber-50 text-amber-600 hover:bg-amber-100 font-bold rounded-xl text-xs transition-colors flex items-center gap-2">
                  Revert to Pending
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Manage Booking Modal */}
      {managingBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border max-w-lg w-full shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center justify-between bg-white z-10 sticky top-0">
              <div>
                <h2 className="font-heading font-bold text-lg text-ink">Manage Booking #{managingBooking.id}</h2>
                <p className="text-xs text-muted mt-0.5">{managingBooking.name} ({managingBooking.phone})</p>
              </div>
              <button onClick={() => setManagingBooking(null)} className="p-1.5 hover:bg-surface rounded-xl text-muted cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleUpdateBooking} className="p-6 space-y-5 bg-surface/30">
              
              {/* Trip Context Card */}
              <div className="bg-white p-4 rounded-xl border border-border/50 shadow-sm text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2">
                  <span className="font-bold text-ink">{managingBooking.trip_type}</span>
                  <span className="text-primary font-medium">Req: {managingBooking.cab_type}</span>
                </div>
                <p><span className="text-muted w-16 inline-block">From:</span> <strong className="text-ink">{managingBooking.pickup}</strong></p>
                <p><span className="text-muted w-16 inline-block">To:</span> <strong className="text-ink">{managingBooking.dropoff}</strong></p>
                <p><span className="text-muted w-16 inline-block">When:</span> <strong className="text-ink">{managingBooking.pickup_date} at {managingBooking.pickup_time}</strong></p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">Trip Status</label>
                <select 
                  value={updateData.status} 
                  onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                  className="w-full px-4 py-3 bg-white rounded-xl text-sm text-ink border border-border focus:border-primary outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">Assign Cab</label>
                <select 
                  value={updateData.assigned_cab_id} 
                  onChange={(e) => setUpdateData({...updateData, assigned_cab_id: e.target.value})}
                  className="w-full px-4 py-3 bg-white rounded-xl text-sm text-ink border border-border focus:border-primary outline-none"
                >
                  <option value="">-- No Cab Assigned --</option>
                  {approvedCabs.map(cab => (
                    <option key={cab.id} value={cab.id}>
                      {cab.cab_no} - {cab.cab_name} ({cab.owner_name})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted mt-1">Only shows cabs with "Approved" status.</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">Final Trip Amount (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input 
                    type="number" 
                    value={updateData.amount} 
                    onChange={(e) => setUpdateData({...updateData, amount: e.target.value})}
                    placeholder="e.g. 1500"
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-sm text-ink border border-border focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-border/50 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setManagingBooking(null)} className="px-5 py-2.5 text-ink font-semibold rounded-xl hover:bg-surface transition-colors text-xs cursor-pointer">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdatingBooking}
                  className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl flex items-center gap-2 hover:bg-primary-dark transition-colors text-xs disabled:opacity-70 cursor-pointer"
                >
                  {isUpdatingBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Image Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setLightboxImage(null)}>
          <button className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer" onClick={() => setLightboxImage(null)}>
            <X className="w-6 h-6" />
          </button>
          <img src={getImageUrl(lightboxImage)} alt="Fullscreen Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}