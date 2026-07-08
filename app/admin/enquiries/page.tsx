"use client";

import { useEffect, useState } from "react";
import { getAdminEnquiries, updateEnquiryStatus, deleteAdminEnquiry } from "@/lib/api";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Trash2,
  HelpCircle,
  Search,
  MessageSquare
} from "lucide-react";

interface EnquiryRequest {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  itemName: string;
  date: string;
  guests: any;
  status: string;
  createdAt: string;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminEnquiries();
      setEnquiries(data);
    } catch (e) {
      console.error("Failed to load admin enquiries data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const success = await updateEnquiryStatus(id, newStatus);
      if (success) {
        setEnquiries(prev => 
          prev.map(e => e.id === id ? { ...e, status: newStatus } : e)
        );
      }
    } catch (e) {
      alert("Failed to update enquiry status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry request?")) return;
    try {
      const success = await deleteAdminEnquiry(id);
      if (success) {
        setEnquiries(prev => prev.filter(e => e.id !== id));
      }
    } catch (e) {
      alert("Failed to delete enquiry request");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200/50";
      case "approved":
      case "confirmed":
      case "approve":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/50";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200/50";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200/50";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200/50";
    }
  };

  // Stats calculation
  const totalEnquiries = enquiries.length;
  const pendingCount = enquiries.filter(e => e.status?.toLowerCase() === "pending").length;
  const approvedCount = enquiries.filter(e => {
    const s = e.status?.toLowerCase();
    return s === "approved" || s === "confirmed" || s === "approve";
  }).length;
  const cancelledCount = enquiries.filter(e => e.status?.toLowerCase() === "cancelled").length;

  // Filter list of enquiries for the table view
  const filteredList = enquiries.filter(e => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (e.name || "").toLowerCase().includes(query) ||
      (e.email || "").toLowerCase().includes(query) ||
      (e.phone || "").toLowerCase().includes(query) ||
      (e.itemName || "").toLowerCase().includes(query) ||
      (e.type || "").toLowerCase().includes(query);
      
    const matchesStatus = statusFilter === "all" || e.status?.toLowerCase() === statusFilter?.toLowerCase() || (statusFilter === "Approved" && (e.status === "confirmed" || e.status === "Approved"));
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink">
            Customer Enquiries
          </h1>
          <p className="text-muted text-xs mt-1">
            Manage packages tour requests and contact form submissions.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-border bg-white rounded-xl text-xs font-semibold text-ink hover:bg-surface transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Enquiries
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
          <p className="text-muted text-xs">Loading enquiries...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Enquiry Metrics Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Enquiries", value: totalEnquiries, icon: MessageSquare, color: "bg-white border border-border/50", iconColor: "text-primary bg-primary-light" },
              { label: "Pending Review", value: pendingCount, icon: Clock, color: "bg-amber-50/50 border border-amber-200/40 text-amber-900", iconColor: "text-amber-600 bg-amber-100/60" },
              { label: "Approved/Confirmed", value: approvedCount, icon: CheckCircle, color: "bg-emerald-50/50 border border-emerald-200/40 text-emerald-900", iconColor: "text-emerald-600 bg-emerald-100/60" },
              { label: "Cancelled", value: cancelledCount, icon: Trash2, color: "bg-rose-50/50 border border-rose-200/40 text-rose-900", iconColor: "text-rose-600 bg-rose-100/60" },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={`p-5 rounded-2xl ${stat.color} shadow-sm flex items-center justify-between`}>
                  <div className="space-y-1">
                    <span className="text-muted text-[10px] font-bold uppercase tracking-wider block">
                      {stat.label}
                    </span>
                    <span className="font-heading font-black text-2xl block">
                      {stat.value}
                    </span>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enquiries List Table */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-heading font-black text-lg text-ink">
                  Enquiry Registry
                </h3>
                <p className="text-muted text-xs mt-0.5">
                  Check, verify status, and respond to incoming package enquiries.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search enquiries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2.5 bg-surface border border-border rounded-xl text-xs text-ink focus:border-primary outline-none min-w-[200px]"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2.5 bg-surface rounded-xl border border-border text-xs text-ink outline-none cursor-pointer focus:border-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {filteredList.length === 0 ? (
              <div className="py-12 text-center text-muted text-xs border border-dashed border-border rounded-xl">
                No matching enquiries found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 text-[10px] uppercase font-bold text-muted bg-surface/30">
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Requested Tour/Service</th>
                      <th className="py-3 px-4">Travel Date / Details</th>
                      <th className="py-3 px-4">Guests/Pax</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-xs">
                    {filteredList.map((e) => (
                      <tr key={e.id} className="hover:bg-surface/20 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-ink">{e.name}</div>
                          <div className="text-[10px] text-muted space-y-0.5 mt-1">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-primary" /> {e.email}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-primary" /> {e.phone}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-medium text-ink max-w-[220px] truncate">
                          {e.itemName}
                          <span className="block text-[9px] font-bold text-primary mt-1 uppercase">{e.type}</span>
                        </td>
                        <td className="py-4 px-4 text-muted">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {e.date}</span>
                        </td>
                        <td className="py-4 px-4 text-ink font-semibold">
                          <span className="text-[11px] flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-muted shrink-0" />
                            {e.guests} Pax
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <select
                            value={e.status === "confirmed" ? "Approved" : e.status}
                            onChange={(evt) => handleStatusChange(e.id, evt.target.value)}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border outline-none cursor-pointer transition-colors ${getStatusBadgeClass(e.status)}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleDelete(e.id)}
                            className="p-1.5 hover:bg-rose-50 text-muted hover:text-rose-600 rounded-lg border border-border/40 hover:border-rose-200/50 cursor-pointer transition-all"
                            title="Delete Enquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
