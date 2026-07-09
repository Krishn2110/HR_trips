"use client";

import { useEffect, useState } from "react";
import {
  getHotelRegistrations,
  updateHotelRegistrationStatus,
  deleteHotelRegistration,
} from "@/lib/api";
import type { HotelRegistration } from "@/lib/types";
import {
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building2,
  Eye,
  X,
  ShieldCheck,
  CreditCard,
  Image as ImageIcon,
  Map,
  UserCheck
} from "lucide-react";
import Image from "next/image";

export default function AdminHotelRegistrationsPage() {
  const [registrations, setRegistrations] = useState<HotelRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingReg, setViewingReg] = useState<HotelRegistration | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getHotelRegistrations();
      setRegistrations(data);
    } catch (e) {
      console.error("Failed to load hotel registrations", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (
    id: string,
    newStatus: "Pending" | "Approved" | "Rejected"
  ) => {
    try {
      const success = await updateHotelRegistrationStatus(id, newStatus);
      if (success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch {
      alert("Failed to update registration status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hotel registration?")) return;
    try {
      const success = await deleteHotelRegistration(id);
      if (success) {
        setRegistrations((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      alert("Failed to delete registration");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200/50";
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/50";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200/50";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200/50";
    }
  };

  const total = registrations.length;
  const pending = registrations.filter((r) => r.status === "Pending").length;
  const approved = registrations.filter((r) => r.status === "Approved").length;
  const rejected = registrations.filter((r) => r.status === "Rejected").length;

  const filteredList = registrations.filter((r) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (r.hotelName || "").toLowerCase().includes(query) ||
      (r.ownerName || "").toLowerCase().includes(query) ||
      (r.city || "").toLowerCase().includes(query) ||
      (r.email || "").toLowerCase().includes(query);

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink">
            Hotel Partner Applications
          </h1>
          <p className="text-muted text-xs mt-1">
            Review documents, bank details, and approve registration accounts.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-border bg-white rounded-xl text-xs font-semibold text-ink hover:bg-surface transition-colors cursor-pointer disabled:opacity-50 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Applications", value: total, color: "bg-white text-ink border border-border/50" },
          { label: "Pending Review", value: pending, color: "bg-amber-50/40 text-amber-800 border border-amber-200/40" },
          { label: "Approved Partners", value: approved, color: "bg-emerald-50/40 text-emerald-800 border border-emerald-200/40" },
          { label: "Rejected Applications", value: rejected, color: "bg-rose-50/40 text-rose-800 border border-rose-200/40" },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-xl shadow-sm ${s.color} flex flex-col`}>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-85">{s.label}</span>
            <span className="font-heading font-black text-2xl mt-1">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by hotel name, owner, city, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-xs text-ink focus:border-primary outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted text-xs font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 bg-surface rounded-xl border border-border text-xs text-ink outline-none cursor-pointer focus:border-primary"
            >
              <option value="all">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
            <p className="text-muted text-xs">Fetching registrations...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center text-muted text-xs">
            No hotel registrations found.
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-[10px] uppercase font-bold text-muted bg-surface/30">
                  <th className="py-3.5 px-4">Hotel & GST</th>
                  <th className="py-3.5 px-4">Owner & Manager</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {filteredList.map((r) => (
                  <tr key={r.id} className="hover:bg-surface/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-ink">{r.hotelName}</div>
                      <div className="text-[10px] text-muted space-y-0.5 mt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-primary" /> GST: {r.gst}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-ink">{r.ownerName}</div>
                      <div className="text-[10px] text-muted space-y-0.5 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-primary" /> {r.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-primary" /> {r.phone}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {r.city}, {r.state}
                      </span>
                      <span className="text-[10px] block mt-0.5">{r.pincode}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <select
                        value={r.status}
                        onChange={(e) =>
                          handleStatusChange(r.id, e.target.value as "Pending" | "Approved" | "Rejected")
                        }
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border outline-none cursor-pointer transition-colors ${getStatusBadgeClass(r.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingReg(r)}
                          className="p-1.5 hover:bg-blue-50 text-muted hover:text-blue-600 rounded-lg border border-border/40 hover:border-blue-200/50 cursor-pointer transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 hover:bg-rose-50 text-muted hover:text-rose-600 rounded-lg border border-border/40 hover:border-rose-200/50 cursor-pointer transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {viewingReg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white border-b border-border/50 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-bold text-ink text-lg">Partner Registration Details</h3>
              </div>
              <button
                onClick={() => setViewingReg(null)}
                className="p-1.5 hover:bg-surface rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 text-xs flex-1 overflow-y-auto">
              {/* Hotel Main Profile Info */}
              <div>
                <span className="text-[9px] uppercase font-bold text-primary tracking-wider">Hotel Trade Name</span>
                <h4 className="font-heading font-black text-ink text-2xl mt-0.5">{viewingReg.hotelName}</h4>
                <p className="text-muted text-xs mt-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> {viewingReg.hotelAddress}, {viewingReg.city}, {viewingReg.state} - {viewingReg.pincode}
                </p>
              </div>

              <hr className="border-border/30" />

              {/* Legal & Operations Section */}
              <div className="space-y-3.5">
                <h5 className="font-heading font-bold text-ink text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Legal & Compliance Profile
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface p-4 border border-border/40 rounded-2xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted block">GST Number</span>
                    <span className="text-ink font-semibold mt-0.5 block">{viewingReg.gst}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted block">Hotel Registration Number</span>
                    <span className="text-ink font-semibold mt-0.5 block">{viewingReg.hotelRegistrationNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted block">Fire Safety NOC Details</span>
                    <span className="text-ink font-medium mt-0.5 block">{viewingReg.fireSafetyNoc}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted block">CCTV Configuration</span>
                    <span className="text-ink font-medium mt-0.5 block">{viewingReg.cctvCamera}</span>
                  </div>
                </div>
              </div>

              {/* Financial Section */}
              <div className="space-y-3.5">
                <h5 className="font-heading font-bold text-ink text-xs flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-primary" /> Settlement Bank Details
                </h5>
                <div className="bg-surface p-4 border border-border/40 rounded-2xl whitespace-pre-line text-ink font-medium leading-relaxed">
                  {viewingReg.bankDetails}
                </div>
              </div>

              {/* People Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-border/30 pt-6">
                <div className="space-y-2">
                  <h6 className="font-heading font-bold text-ink text-xs flex items-center gap-1">
                    <UserCheck className="w-4 h-4 text-primary" /> Owner Details
                  </h6>
                  <div className="space-y-1 mt-1 text-muted">
                    <div className="text-ink font-semibold">{viewingReg.ownerName}</div>
                    <div>Phone: <span className="text-ink font-medium">{viewingReg.ownerContact}</span></div>
                    <div>Contact Desk Phone: <span className="text-ink font-medium">{viewingReg.phone}</span></div>
                    <div>Email: <span className="text-ink font-medium">{viewingReg.email}</span></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h6 className="font-heading font-bold text-ink text-xs flex items-center gap-1">
                    <UserCheck className="w-4 h-4 text-primary" /> Property Manager
                  </h6>
                  <div className="space-y-1 mt-1 text-muted">
                    <div className="text-ink font-semibold">{viewingReg.propertyManagerName}</div>
                    <div>Phone: <span className="text-ink font-medium">{viewingReg.propertyManagerPhone}</span></div>
                    {viewingReg.location && (
                      <div className="pt-2">
                        <a 
                          href={viewingReg.location} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/10 rounded-lg font-semibold transition-colors"
                        >
                          <Map className="w-3.5 h-3.5" /> View on Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Photos Section */}
              <div className="space-y-4 border-t border-border/30 pt-6">
                <h5 className="font-heading font-bold text-ink text-xs flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-primary" /> Property Photo Previews
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Room", url: viewingReg.roomPic },
                    { label: "Reception", url: viewingReg.receptionPic },
                    { label: "Bathroom", url: viewingReg.bathroomPic },
                    { label: "Interior/Exterior", url: viewingReg.interiorExteriorPic }
                  ].map((img, i) => (
                    <div key={i} className="border border-border/40 rounded-xl overflow-hidden bg-surface flex flex-col">
                      <div className="relative h-24 bg-surface/30">
                        {img.url ? (
                          <img 
                            src={img.url} 
                            alt={img.label} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="p-2 border-t border-border/30 text-center font-semibold text-[10px] text-ink uppercase">
                        {img.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Creation metadata */}
              <div className="border-t border-border/30 pt-6 text-[10px] text-muted flex items-center justify-between">
                <span>Application ID: #{viewingReg.id}</span>
                <span>Submitted: {new Date(viewingReg.createdAt).toLocaleString("en-IN")}</span>
              </div>
            </div>
            
            {/* Quick Status actions */}
            <div className="sticky bottom-0 bg-white border-t border-border/50 px-6 py-4 flex gap-3 rounded-b-3xl">
              {viewingReg.status === "Pending" && (
                <>
                  <button
                    onClick={() => {
                      handleStatusChange(viewingReg.id, "Approved");
                      setViewingReg(null);
                    }}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition-colors"
                  >
                    Approve Application
                  </button>
                  <button
                    onClick={() => {
                      handleStatusChange(viewingReg.id, "Rejected");
                      setViewingReg(null);
                    }}
                    className="px-6 py-3 border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Decline
                  </button>
                </>
              )}
              {viewingReg.status !== "Pending" && (
                <button
                  onClick={() => setViewingReg(null)}
                  className="w-full py-3 bg-surface hover:bg-border/20 text-ink font-semibold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Close Details
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
