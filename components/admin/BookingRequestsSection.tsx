"use client";

import { useEffect, useState } from "react";
import { getAdminBookings, updateBookingStatus, deleteAdminBooking } from "@/lib/api";
import { Clock, CheckCircle, RefreshCw, Trash2, Mail, Phone, Calendar, Users, Eye } from "lucide-react";

interface BookingRequest {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  itemName: string;
  date: string;
  guests: number;
  status: string;
  createdAt: string;
}

interface BookingRequestsSectionProps {
  filterType: "packages" | "hotels" | "cabs" | "banquets" | "events" | "catering" | "ticketing" | "manpower";
}

export default function BookingRequestsSection({ filterType }: BookingRequestsSectionProps) {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const all = await getAdminBookings();
      
      // Filter bookings based on the tab's service type
      const filtered = all.filter((b: BookingRequest) => {
        const item = (b.itemName || "").toLowerCase();
        const type = (b.type || "").toLowerCase();
        
        switch (filterType) {
          case "packages":
            return type.includes("package");
          case "hotels":
            return type.includes("hotel") || item.includes("hotel") || item.includes("inn") || item.includes("resort");
          case "banquets":
            return item.includes("banquet") || item.includes("celebration") || item.includes("ballroom") || item.includes("hall");
          case "cabs":
            return item.includes("cab") || item.includes("taxi") || item.includes("swift") || item.includes("innova") || item.includes("traveller");
          case "catering":
            return item.includes("catering") || item.includes("feast") || item.includes("mughlai") || item.includes("buffet");
          case "events":
            return item.includes("event") || item.includes("wedding") || item.includes("corporate") || item.includes("birthday");
          case "ticketing":
            return item.includes("ticketing") || item.includes("ticket") || item.includes("flight") || item.includes("train") || item.includes("bus");
          case "manpower":
            return item.includes("manpower") || item.includes("staff") || item.includes("security") || item.includes("housekeeping") || item.includes("guard");
          default:
            return true;
        }
      });

      setBookings(filtered);
    } catch (e) {
      console.error("Failed to load bookings", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [filterType]);

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
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200/50";
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/50";
      case "Completed":
        return "bg-blue-50 text-blue-700 border-blue-200/50";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200/50";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200/50";
    }
  };

  // Stats calculation
  const total = bookings.length;
  const pending = bookings.filter(b => b.status === "Pending").length;
  const approved = bookings.filter(b => b.status === "Approved").length;
  const completed = bookings.filter(b => b.status === "Completed").length;

  const filteredList = bookings.filter(b => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (b.name || "").toLowerCase().includes(query) ||
      (b.email || "").toLowerCase().includes(query) ||
      (b.phone || "").toLowerCase().includes(query) ||
      (b.itemName || "").toLowerCase().includes(query);
      
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Mini Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings", value: total, color: "bg-surface text-ink border border-border/40" },
          { label: "Pending Requests", value: pending, color: "bg-amber-50/40 text-amber-800 border border-amber-100" },
          { label: "Approved Tours", value: approved, color: "bg-emerald-50/40 text-emerald-800 border border-emerald-100" },
          { label: "Completed", value: completed, color: "bg-blue-50/40 text-blue-800 border border-blue-100" },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-xl shadow-sm ${s.color} flex flex-col`}>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-85">{s.label}</span>
            <span className="font-heading font-black text-2xl mt-1">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filter and Search board */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by customer name, phone, item name..."
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
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button
              onClick={loadBookings}
              className="p-2 border border-border hover:bg-surface rounded-xl text-ink transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
            <p className="text-muted text-xs">Fetching bookings...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center text-muted text-xs">
            No bookings or enquiries found matching this service category.
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-[10px] uppercase font-bold text-muted bg-surface/30">
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Requested Item / Service</th>
                  <th className="py-3.5 px-4">Travel Date / Details</th>
                  <th className="py-3.5 px-4">Guests</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
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
                    <td className="py-4 px-4 font-medium text-ink max-w-[200px] truncate">
                      {b.itemName}
                      <span className="block text-[9px] font-bold text-primary mt-1 uppercase">{b.type}</span>
                    </td>
                    <td className="py-4 px-4 text-muted">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {b.date}</span>
                    </td>
                    <td className="py-4 px-4 text-ink font-semibold">
                      <span className="text-[11px] flex items-center gap-1"><Users className="w-3.5 h-3.5 text-muted shrink-0" /> {typeof b.guests === "number" ? `${b.guests} Pax` : b.guests}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <select
                        value={b.status}
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
  );
}
