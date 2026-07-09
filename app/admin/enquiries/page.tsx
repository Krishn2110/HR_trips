"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Trash2,
  MessageSquare,
  Eye
} from "lucide-react";

interface EnquiryRequest {
  id: string | number;
  package_id: string | number;
  package_title: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  travel_date: string | null;
  pax_count: number;
  message: string;
  status: "unread" | "read" | "replied";
  created_at: string;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // --- API: FETCH ALL ENQUIRIES ---
  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enquiries/list.php`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store"
      });
      const result = await response.json();
      
      if (response.ok && result.status === "success") {
        setEnquiries(result.data);
      } else {
        console.error("Failed to load enquiries:", result.message);
      }
    } catch (e) {
      console.error("Network error while loading enquiries:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- API: UPDATE STATUS ---
  const handleStatusChange = async (id: string | number, newStatus: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enquiries/update_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        setEnquiries(prev => 
          prev.map(e => e.id === id ? { ...e, status: newStatus as any } : e)
        );
      } else {
        alert(result.message || "Failed to update enquiry status");
      }
    } catch (e) {
      alert("Network Error: Could not update status");
    }
  };

  // --- API: DELETE ENQUIRY ---
  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this enquiry request?")) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enquiries/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        setEnquiries(prev => prev.filter(e => e.id !== id));
      } else {
        alert(result.message || "Failed to delete enquiry request");
      }
    } catch (e) {
      alert("Network Error: Could not delete enquiry");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "unread":
        return "bg-rose-50 text-rose-700 border-rose-200/50";
      case "read":
        return "bg-blue-50 text-blue-700 border-blue-200/50";
      case "replied":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/50";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200/50";
    }
  };

  // Stats calculation based on new enums
  const totalEnquiries = enquiries.length;
  const unreadCount = enquiries.filter(e => e.status === "unread").length;
  const readCount = enquiries.filter(e => e.status === "read").length;
  const repliedCount = enquiries.filter(e => e.status === "replied").length;

  // Filter list of enquiries for the table view
  const filteredList = enquiries.filter(e => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (e.customer_name || "").toLowerCase().includes(query) ||
      (e.customer_email || "").toLowerCase().includes(query) ||
      (e.customer_phone || "").toLowerCase().includes(query) ||
      (e.package_title || "").toLowerCase().includes(query) ||
      String(e.id).includes(query);
      
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
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
              { label: "Unread", value: unreadCount, icon: Clock, color: "bg-rose-50/50 border border-rose-200/40 text-rose-900", iconColor: "text-rose-600 bg-rose-100/60" },
              { label: "Read", value: readCount, icon: Eye, color: "bg-blue-50/50 border border-blue-200/40 text-blue-900", iconColor: "text-blue-600 bg-blue-100/60" },
              { label: "Replied", value: repliedCount, icon: CheckCircle, color: "bg-emerald-50/50 border border-emerald-200/40 text-emerald-900", iconColor: "text-emerald-600 bg-emerald-100/60" },
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
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
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
                      <th className="py-3 px-4">Date & ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Package / Details</th>
                      <th className="py-3 px-4 max-w-[250px]">Message</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-xs">
                    {filteredList.map((e) => (
                      <tr key={e.id} className="hover:bg-surface/20 transition-colors align-top">
                        <td className="py-4 px-4">
                          <span className="font-semibold text-ink block">#{e.id}</span>
                          <span className="text-[10px] text-muted">
                            {new Date(e.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-ink">{e.customer_name}</div>
                          <div className="text-[10px] text-muted space-y-0.5 mt-1">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-primary shrink-0" /> {e.customer_email}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-primary shrink-0" /> {e.customer_phone}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-medium text-ink max-w-[200px] truncate">
                          {e.package_title || `Package ID: ${e.package_id}`}
                          
                          {/* Only show travel date/pax if the customer provided them */}
                          {(e.travel_date || e.pax_count > 0) && (
                            <div className="text-[10px] text-muted mt-1 space-y-0.5 font-normal">
                              {e.travel_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {e.travel_date}</span>}
                              {e.pax_count > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {e.pax_count} Travelers</span>}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-muted max-w-[250px] whitespace-normal break-words">
                          <span className="line-clamp-3 text-[11px]" title={e.message}>
                            {e.message || <i className="text-muted/50">No additional message provided.</i>}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <select
                            value={e.status}
                            onChange={(evt) => handleStatusChange(e.id, evt.target.value)}
                            className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border outline-none cursor-pointer transition-colors uppercase tracking-wider ${getStatusBadgeClass(e.status)}`}
                          >
                            <option value="unread">Unread</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
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