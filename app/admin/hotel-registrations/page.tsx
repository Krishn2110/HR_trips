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
  Star,
  DoorOpen,
  Building2,
  Eye,
  X,
} from "lucide-react";

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
      r.hotelName.toLowerCase().includes(query) ||
      r.ownerName.toLowerCase().includes(query) ||
      r.city.toLowerCase().includes(query) ||
      r.email.toLowerCase().includes(query);

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink">
            Hotel Registrations
          </h1>
          <p className="text-muted text-xs mt-1">
            Manage hotel owner registration requests and approvals.
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
          { label: "Total", value: total, color: "bg-surface text-ink border border-border/40" },
          { label: "Pending", value: pending, color: "bg-amber-50/40 text-amber-800 border border-amber-100" },
          { label: "Approved", value: approved, color: "bg-emerald-50/40 text-emerald-800 border border-emerald-100" },
          { label: "Rejected", value: rejected, color: "bg-rose-50/40 text-rose-800 border border-rose-100" },
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
                  <th className="py-3.5 px-4">Hotel & Owner</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Details</th>
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
                          <Building2 className="w-3 h-3 text-primary" /> {r.ownerName}
                        </span>
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
                    <td className="py-4 px-4 text-muted">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500" /> {r.starRating} Star
                      </span>
                      <span className="flex items-center gap-1 mt-0.5">
                        <DoorOpen className="w-3.5 h-3.5" /> {r.totalRooms} Rooms
                      </span>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-border/50 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-heading font-bold text-ink text-lg">Registration Details</h3>
              <button
                onClick={() => setViewingReg(null)}
                className="p-1.5 hover:bg-surface rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted block">Owner Name</span>
                  <span className="text-ink font-medium">{viewingReg.ownerName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted block">Email</span>
                  <span className="text-ink font-medium">{viewingReg.email}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted block">Phone</span>
                  <span className="text-ink font-medium">{viewingReg.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted block">Status</span>
                  <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${getStatusBadgeClass(viewingReg.status)}`}>
                    {viewingReg.status}
                  </span>
                </div>
              </div>
              <hr className="border-border/30" />
              <div>
                <span className="text-[10px] uppercase font-bold text-muted block mb-1">Hotel Name</span>
                <span className="text-ink font-semibold text-base">{viewingReg.hotelName}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted block">City</span>
                  <span className="text-ink">{viewingReg.city}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted block">State</span>
                  <span className="text-ink">{viewingReg.state}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted block">Pincode</span>
                  <span className="text-ink">{viewingReg.pincode}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted block">Star Rating</span>
                  <span className="text-ink flex items-center gap-1">
                    {viewingReg.starRating} <Star className="w-3.5 h-3.5 text-amber-500" />
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted block">Full Address</span>
                <span className="text-ink">{viewingReg.hotelAddress}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted block">Total Rooms</span>
                <span className="text-ink">{viewingReg.totalRooms}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted block">Description</span>
                <p className="text-ink text-xs leading-relaxed">{viewingReg.description}</p>
              </div>
              {viewingReg.amenities.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted block mb-2">Amenities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingReg.amenities.map((a) => (
                      <span
                        key={a}
                        className="px-2.5 py-1 bg-primary/5 text-primary text-[10px] font-semibold rounded-lg border border-primary/10"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="text-[10px] uppercase font-bold text-muted block">Registered On</span>
                <span className="text-ink text-xs">
                  {new Date(viewingReg.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
