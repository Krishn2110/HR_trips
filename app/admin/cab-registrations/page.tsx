"use client";

import { useEffect, useState } from "react";
import type { CabRegistration } from "@/lib/types";
import { getCabRegistrations, updateCabRegistrationStatus, deleteCabRegistration } from "@/lib/api";
import {
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Eye,
  X,
  ShieldCheck,
  CreditCard,
  Image as ImageIcon,
  User,
  Search,
  Filter,
  FileCheck,
  FileText
} from "lucide-react";

export default function AdminCabRegistrationsPage() {
  const [registrations, setRegistrations] = useState<CabRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [viewingReg, setViewingReg] = useState<CabRegistration | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // --- FETCH REGISTRATIONS ---
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Try remote API first
      let remoteSuccess = false;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cabs/list.php`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store"
        });
        const rawText = await response.text();
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          const jsonText = rawText.substring(firstBrace, lastBrace + 1);
          const result = JSON.parse(jsonText);
          if (response.ok && result.status === "success") {
            setRegistrations(result.data);
            remoteSuccess = true;
          }
        }
      } catch {
        // ignore
      }

      if (!remoteSuccess) {
        const localRegs = await getCabRegistrations();
        setRegistrations(localRegs);
      }
    } catch (e) {
      console.error("Error loading cab registrations", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- UPDATE STATUS ---
  const handleStatusChange = async (
    id: string,
    newStatus: "Pending" | "Approved" | "Rejected"
  ) => {
    if (!confirm(`Are you sure you want to mark this vehicle as ${newStatus}?`)) return;

    try {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cabs/update_status.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: newStatus })
        });
      } catch {
        // ignore
      }

      await updateCabRegistrationStatus(id, newStatus);

      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );

      if (viewingReg && viewingReg.id === id) {
        setViewingReg({ ...viewingReg, status: newStatus });
      }
    } catch {
      alert("Failed to update status");
    }
  };

  // --- DELETE REGISTRATION ---
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cab registration request?")) return;

    try {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cabs/delete.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
        });
      } catch {
        // ignore
      }

      await deleteCabRegistration(id);
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      if (viewingReg?.id === id) setViewingReg(null);
    } catch {
      alert("Failed to delete registration");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  // Filtering
  const filteredRegs = registrations.filter((r) => {
    const matchesSearch =
      r.cabName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cabNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contactNo.includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" || r.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalCount = registrations.length;
  const pendingCount = registrations.filter((r) => r.status === "Pending").length;
  const approvedCount = registrations.filter((r) => r.status === "Approved").length;
  const rejectedCount = registrations.filter((r) => r.status === "Rejected").length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-ink">
            Cab Registrations & Vehicle Verifications
          </h1>
          <p className="text-muted text-xs">
            Review cab owner requests, inspect 7 verification document copies, and approve active fleet vehicles.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface hover:bg-border/40 border border-border text-ink font-semibold rounded-xl text-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted">Total Cab Applications</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl text-ink">{totalCount}</p>
        </div>

        <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted">Pending Verification</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl text-amber-600">{pendingCount}</p>
        </div>

        <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted">Approved & Active</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl text-emerald-600">{approvedCount}</p>
        </div>

        <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted">Declined</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl text-rose-600">{rejectedCount}</p>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white rounded-2xl border border-border/50 p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by cab name, vehicle no, owner..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary transition-colors outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-surface border border-border rounded-xl text-xs text-ink font-semibold outline-none"
          >
            <option value="all">All Verification Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* REGISTRATIONS TABLE */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface border-b border-border text-muted font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Vehicle / Cab Name</th>
                <th className="py-4 px-6">Owner & Contact</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Type & Specs</th>
                <th className="py-4 px-6">Verification Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading cab registration requests...
                  </td>
                </tr>
              ) : filteredRegs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    No cab owner registrations found matching filters.
                  </td>
                </tr>
              ) : (
                filteredRegs.map((reg) => (
                  <tr key={reg.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-ink text-sm">{reg.cabName}</p>
                          <span className="font-mono font-bold text-primary text-[11px] uppercase">
                            {reg.cabNo}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-semibold text-ink">{reg.ownerName}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-primary" /> {reg.contactNo}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-primary" /> {reg.email}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <p className="text-ink font-medium">{reg.city}, {reg.state}</p>
                      <span className="text-muted text-[11px]">{reg.pincode}</span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary inline-block mb-1">
                        {reg.cabType}
                      </span>
                      <p className="text-[11px] text-muted font-mono">DL: {reg.drivingLicenceNo}</p>
                    </td>

                    <td className="py-4 px-6">
                      <select
                        value={reg.status}
                        onChange={(e) =>
                          handleStatusChange(
                            reg.id,
                            e.target.value as "Pending" | "Approved" | "Rejected"
                          )
                        }
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${getStatusBadgeClass(
                          reg.status
                        )}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingReg(reg)}
                          className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Details
                        </button>

                        <button
                          onClick={() => handleDelete(reg.id)}
                          className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL DETAILS DRAWER MODAL */}
      {viewingReg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-heading font-bold text-xl text-ink">
                    {viewingReg.cabName}
                  </h2>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary uppercase">
                    {viewingReg.cabNo}
                  </span>
                </div>
                <p className="text-muted text-xs mt-1">
                  Submitted on {new Date(viewingReg.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setViewingReg(null)}
                className="p-2 hover:bg-surface rounded-xl text-muted hover:text-ink cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted">Status:</span>
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold border ${getStatusBadgeClass(
                    viewingReg.status
                  )}`}
                >
                  {viewingReg.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatusChange(viewingReg.id, "Approved")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve Vehicle
                </button>
                <button
                  onClick={() => handleStatusChange(viewingReg.id, "Rejected")}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" /> Reject Request
                </button>
              </div>
            </div>

            {/* Grid Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Vehicle Technical Specs */}
              <div className="bg-surface/50 border border-border/60 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-ink text-sm flex items-center gap-2 border-b border-border/40 pb-2">
                  <Car className="w-4 h-4 text-primary" /> Technical Specifications
                </h3>
                <div className="grid grid-cols-2 gap-y-2.5">
                  <div>
                    <span className="text-muted block">Cab Type</span>
                    <span className="font-bold text-ink">{viewingReg.cabType}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Engine No</span>
                    <span className="font-mono font-semibold text-ink uppercase">{viewingReg.engineNo}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Chassis No</span>
                    <span className="font-mono font-semibold text-ink uppercase">{viewingReg.chassisNo}</span>
                  </div>
                  <div>
                    <span className="text-muted block">DL Number</span>
                    <span className="font-mono font-semibold text-ink uppercase">{viewingReg.drivingLicenceNo}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Insurance Policy</span>
                    <span className="font-semibold text-ink">{viewingReg.insurance}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Fitness Validity</span>
                    <span className="font-semibold text-ink">{viewingReg.fitness}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Permit</span>
                    <span className="font-semibold text-ink">{viewingReg.permit}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Fire Safety</span>
                    <span className="font-semibold text-emerald-700">{viewingReg.fireSafety}</span>
                  </div>
                </div>
              </div>

              {/* Owner Info & Address */}
              <div className="bg-surface/50 border border-border/60 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-ink text-sm flex items-center gap-2 border-b border-border/40 pb-2">
                  <User className="w-4 h-4 text-primary" /> Owner & Address Details
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-muted block">Owner Name</span>
                    <span className="font-bold text-ink text-sm">{viewingReg.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Contact Phone</span>
                    <span className="font-semibold text-ink">{viewingReg.contactNo}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Email ID</span>
                    <span className="font-semibold text-ink">{viewingReg.email}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Full Address</span>
                    <span className="text-ink leading-relaxed">
                      {viewingReg.address}, {viewingReg.city}, {viewingReg.state} - {viewingReg.pincode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Driver Details */}
              <div className="bg-surface/50 border border-border/60 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-ink text-sm flex items-center gap-2 border-b border-border/40 pb-2">
                  <User className="w-4 h-4 text-primary" /> Assigned Driver
                </h3>
                <div className="grid grid-cols-2 gap-y-2.5">
                  <div>
                    <span className="text-muted block">Driver Name</span>
                    <span className="font-bold text-ink">{viewingReg.driverName}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Driver Contact</span>
                    <span className="font-semibold text-ink">{viewingReg.driverContactNo}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted block">Driver DL No</span>
                    <span className="font-mono font-bold text-primary uppercase">{viewingReg.driverDlNo}</span>
                  </div>
                </div>
              </div>

              {/* Bank Settlement Info */}
              <div className="bg-surface/50 border border-border/60 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-ink text-sm flex items-center gap-2 border-b border-border/40 pb-2">
                  <CreditCard className="w-4 h-4 text-primary" /> Bank Details
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-muted block">Bank Name</span>
                    <span className="font-bold text-ink">{viewingReg.bankName}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Account Number</span>
                    <span className="font-mono font-bold text-ink">{viewingReg.accountNo}</span>
                  </div>
                  <div>
                    <span className="text-muted block">IFSC Code</span>
                    <span className="font-mono font-bold text-primary uppercase">{viewingReg.ifscCode}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Image Copies Checklist Gallery */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="font-bold text-ink text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" /> Uploaded Document Copies & Vehicle Photos (7 Required)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { title: "Cab Exterior", src: viewingReg.cabPic },
                  { title: "Interior Photo", src: viewingReg.interiorPic },
                  { title: "RC Certificate", src: viewingReg.rcPic },
                  { title: "Driving Licence", src: viewingReg.dlPic },
                  { title: "Insurance Paper", src: viewingReg.insurancePic },
                  { title: "Permit Certificate", src: viewingReg.permitPic },
                  { title: "Pollution (PUC)", src: viewingReg.pucPic },
                ].map((doc, idx) => (
                  <div key={idx} className="border border-border/60 rounded-xl p-3 bg-surface/40 space-y-2">
                    <span className="text-[11px] font-bold text-ink block truncate">{doc.title}</span>
                    {doc.src ? (
                      <div
                        onClick={() => setLightboxImage(doc.src)}
                        className="relative group h-28 rounded-lg overflow-hidden border border-border bg-black/5 cursor-pointer"
                      >
                        <img src={doc.src} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </div>
                      </div>
                    ) : (
                      <div className="h-28 rounded-lg border border-dashed border-border flex items-center justify-center text-muted text-[11px]">
                        Not provided
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-3xl w-full p-4 space-y-3 relative shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-bold text-xs text-ink">Document Preview</span>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1 hover:bg-surface rounded-lg text-muted hover:text-ink cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-black/5 rounded-xl">
              <img src={lightboxImage} alt="Document" className="max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
