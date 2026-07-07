"use client";

import { useEffect, useState } from "react";
import { getAdminBookings, getPackages, updateBookingStatus, deleteAdminBooking } from "@/lib/api";
import type { Package } from "@/lib/types";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Palmtree, 
  RefreshCw,
  Hotel,
  Car,
  GlassWater,
  Sparkles,
  Utensils,
  Ticket,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  Trash2
} from "lucide-react";

interface BookingRequest {
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

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminBookings();
      setBookings(data);
      const pkgs = await getPackages();
      setPackages(pkgs);
    } catch (e) {
      console.error("Failed to load admin dashboard data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const success = await updateBookingStatus(id, newStatus);
      if (success) {
        setBookings(prev => 
          prev.map(b => b.id === id ? { ...b, status: newStatus } : b)
        );
      }
    } catch (e) {
      alert("Failed to update booking status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking request?")) return;
    try {
      const success = await deleteAdminBooking(id);
      if (success) {
        setBookings(prev => prev.filter(b => b.id !== id));
      }
    } catch (e) {
      alert("Failed to delete booking request");
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

  // Stats calculation (case-insensitive and maps approved/confirmed/approve to Approved)
  const totalBookings = bookings.length;
  
  const pendingCount = bookings.filter(b => {
    const s = b.status?.toLowerCase();
    return s === "pending";
  }).length;

  const approvedCount = bookings.filter(b => {
    const s = b.status?.toLowerCase();
    return s === "approved" || s === "confirmed" || s === "approve";
  }).length;

  const completedCount = bookings.filter(b => {
    const s = b.status?.toLowerCase();
    return s === "completed";
  }).length;

  const cancelledCount = bookings.filter(b => {
    const s = b.status?.toLowerCase();
    return s === "cancelled";
  }).length;

  // Department-specific count helpers
  const getDeptCount = (filterType: string) => {
    return bookings.filter(b => {
      const item = (b.itemName || "").toLowerCase();
      const type = (b.type || "").toLowerCase();
      switch (filterType) {
        case "packages": return type.includes("package");
        case "hotels": return type.includes("hotel") || item.includes("hotel") || item.includes("inn") || item.includes("resort");
        case "banquets": return item.includes("banquet") || item.includes("celebration") || item.includes("ballroom") || item.includes("hall");
        case "cabs": return item.includes("cab") || item.includes("taxi") || item.includes("swift") || item.includes("innova") || item.includes("traveller");
        case "catering": return item.includes("catering") || item.includes("feast") || item.includes("mughlai") || item.includes("buffet");
        case "events": return item.includes("event") || item.includes("wedding") || item.includes("corporate") || item.includes("birthday");
        case "ticketing": return type.includes("ticketing") || item.includes("ticketing") || item.includes("ticket") || item.includes("flight") || item.includes("train") || item.includes("bus");
        case "manpower": return type.includes("manpower") || item.includes("manpower") || item.includes("staff") || item.includes("security") || item.includes("housekeeping") || item.includes("guard");
        default: return false;
      }
    }).length;
  };

  // Filter list of bookings for the table view
  const filteredList = bookings.filter(b => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (b.name || "").toLowerCase().includes(query) ||
      (b.email || "").toLowerCase().includes(query) ||
      (b.phone || "").toLowerCase().includes(query) ||
      (b.itemName || "").toLowerCase().includes(query) ||
      (b.type || "").toLowerCase().includes(query);
      
    const matchesStatus = statusFilter === "all" || b.status?.toLowerCase() === statusFilter?.toLowerCase() || (statusFilter === "Approved" && (b.status === "confirmed" || b.status === "Approved" || b.status === "Approved Plans"));
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink">
            Executive Dashboard
          </h1>
          <p className="text-muted text-xs mt-1">
            Real-time request metrics and active booking control board.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-border bg-white rounded-xl text-xs font-semibold text-ink hover:bg-surface transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Overview
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
          <p className="text-muted text-xs">Loading analytics data...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Status Metrics Section */}
          <div>
            <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted mb-4 block">Request Status Board</h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: "Total Bookings", value: totalBookings, icon: Users, color: "bg-white border border-border/50", iconColor: "text-primary bg-primary-light" },
                { label: "Pending Review", value: pendingCount, icon: Clock, color: "bg-amber-50/50 border border-amber-200/40 text-amber-900", iconColor: "text-amber-600 bg-amber-100/60" },
                { label: "Approved Plans", value: approvedCount, icon: CheckCircle, color: "bg-emerald-50/50 border border-emerald-200/40 text-emerald-900", iconColor: "text-emerald-600 bg-emerald-100/60" },
                { label: "Completed", value: completedCount, icon: CheckCircle, color: "bg-blue-50/50 border border-blue-200/40 text-blue-900", iconColor: "text-blue-600 bg-blue-100/60" },
                { label: "Cancelled", value: cancelledCount, icon: CheckCircle, color: "bg-rose-50/50 border border-rose-200/40 text-rose-900", iconColor: "text-rose-600 bg-rose-100/60" },
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
          </div>

          {/* Department breakdown */}
          <div>
            <h2 className="text-[11px] uppercase tracking-wider font-bold text-muted mb-4 block">Active Bookings by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Tour Packages", count: getDeptCount("packages"), icon: Palmtree, color: "bg-white border border-border/50" },
                { name: "Hotel Rooms", count: getDeptCount("hotels"), icon: Hotel, color: "bg-white border border-border/50" },
                { name: "Cab Services", count: getDeptCount("cabs"), icon: Car, color: "bg-white border border-border/50" },
                { name: "Banquet Halls", count: getDeptCount("banquets"), icon: GlassWater, color: "bg-white border border-border/50" },
                { name: "Event Decorations", count: getDeptCount("events"), icon: Sparkles, color: "bg-white border border-border/50" },
                { name: "Catering Services", count: getDeptCount("catering"), icon: Utensils, color: "bg-white border border-border/50" },
                { name: "Travel Ticketing", count: getDeptCount("ticketing"), icon: Ticket, color: "bg-white border border-border/50" },
                { name: "Manpower staff", count: getDeptCount("manpower"), icon: Briefcase, color: "bg-white border border-border/50" },
              ].map((dept, idx) => {
                const Icon = dept.icon;
                return (
                  <div key={idx} className="bg-white rounded-2xl p-5 border border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-semibold text-ink text-xs block">{dept.name}</span>
                        <span className="text-[10px] text-muted block">Bookings requested</span>
                      </div>
                    </div>
                    <span className="font-heading font-black text-lg text-ink bg-surface px-3 py-1 rounded-lg">
                      {dept.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Master Booking Requests & Statuses Table */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-heading font-black text-lg text-ink">
                  Master Booking Registry
                </h3>
                <p className="text-muted text-xs mt-0.5">
                  Manage and monitor the dynamic statuses of all customer inquiries.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2.5 bg-surface border border-border rounded-xl text-xs text-ink focus:border-primary outline-none min-w-[200px]"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2.5 bg-surface rounded-xl border border-border text-xs text-ink outline-none cursor-pointer focus:border-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {filteredList.length === 0 ? (
              <div className="py-12 text-center text-muted text-xs border border-dashed border-border rounded-xl">
                No matching bookings or enquiries found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 text-[10px] uppercase font-bold text-muted bg-surface/30">
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Requested Item & Service</th>
                      <th className="py-3 px-4">Travel Date / Details</th>
                      <th className="py-3 px-4">Guests</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-xs">
                    {filteredList.map((b) => (
                      <tr key={b.id} className="hover:bg-surface/20 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-ink">{b.name}</div>
                          <div className="text-[10px] text-muted space-y-0.5 mt-1">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-primary" /> {b.email}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-primary" /> {b.phone}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-medium text-ink max-w-[220px] truncate">
                          {b.itemName}
                          <span className="block text-[9px] font-bold text-primary mt-1 uppercase">{b.type}</span>
                        </td>
                        <td className="py-4 px-4 text-muted">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {b.date}</span>
                        </td>
                        <td className="py-4 px-4 text-ink font-semibold">
                          <span className="text-[11px] flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-muted shrink-0" />
                            {typeof b.guests === "number" ? `${b.guests} Pax` : b.guests}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <select
                            value={b.status === "confirmed" ? "Approved" : b.status}
                            onChange={(e) => handleStatusChange(b.id, e.target.value)}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border outline-none cursor-pointer transition-colors ${getStatusBadgeClass(b.status)}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="p-1.5 hover:bg-rose-50 text-muted hover:text-rose-600 rounded-lg border border-border/40 hover:border-rose-200/50 cursor-pointer transition-all"
                            title="Delete Request"
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
