"use client";

import { useEffect, useState } from "react";
import { 
  getAdminBookings, 
  updateBookingStatus, 
  getPackages, 
  createAdminBooking, 
  deleteAdminBooking 
} from "@/lib/api";
import type { Package } from "@/lib/types";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Palmtree, 
  Mail, 
  Phone, 
  Calendar, 
  RefreshCw,
  Plus,
  Trash2,
  X,
  Save
} from "lucide-react";

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

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

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
      alert("Failed to update status");
      console.error(e);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;
    try {
      const success = await deleteAdminBooking(id);
      if (success) {
        setBookings(prev => prev.filter(b => b.id !== id));
      }
    } catch (e) {
      alert("Failed to delete booking request");
      console.error(e);
    }
  };

  // Stats calculation
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter(b => b.status === "Pending").length;
  const approvedCount = bookings.filter(b => b.status === "Approved" || b.status === "Completed").length;

  const filteredBookings = bookings
    .filter(b => filterStatus === "all" || b.status === filterStatus)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200/50";
      case "Approved":
        return "bg-blue-100 text-blue-800 border-blue-200/50";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200/50";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200/50";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200/50";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink">
            Dashboard Overview
          </h1>
          <p className="text-muted text-xs mt-1">
            Real-time status of your website enquiries, package sales, and bookings.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-border bg-white rounded-xl text-xs font-semibold text-ink hover:bg-surface transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Panel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Requests",
            value: totalBookings,
            icon: Users,
            color: "text-ink bg-white border border-border/50",
            iconColor: "text-primary bg-primary-light"
          },
          {
            label: "Pending Approvals",
            value: pendingCount,
            icon: Clock,
            color: "text-ink bg-white border border-border/50",
            iconColor: "text-amber-500 bg-amber-50"
          },
          {
            label: "Approved & Completed",
            value: approvedCount,
            icon: CheckCircle,
            color: "text-ink bg-white border border-border/50",
            iconColor: "text-green-500 bg-green-50"
          },
          {
            label: "Active Packages",
            value: packages.length,
            icon: Palmtree,
            color: "text-ink bg-white border border-border/50",
            iconColor: "text-indigo-500 bg-indigo-50"
          }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`p-6 rounded-2xl ${stat.color} shadow-sm flex items-center justify-between`}>
              <div className="space-y-1">
                <span className="text-muted text-xs font-medium uppercase tracking-wider block">
                  {stat.label}
                </span>
                <span className="font-heading font-bold text-3xl tracking-tight block">
                  {stat.value}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.iconColor}`}>
                <Icon className="w-5.5 h-5.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Table card */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        {/* Table Filter Controls */}
        <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-heading font-bold text-lg text-ink">
              Recent Booking Requests
            </h2>
            <p className="text-muted text-xs">
              Manage status and track details of enquiries submitted by customers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted text-xs font-medium">Filter status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-surface rounded-xl border border-border text-xs text-ink outline-none cursor-pointer focus:border-primary transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Request Listings Table */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
            <p className="text-muted text-xs">Loading requests data...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-20 text-center text-muted">
            <p className="text-sm">No enquiries found matching this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/50 border-b border-border/50 text-[11px] font-bold text-muted uppercase tracking-wider">
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Booking Type</th>
                  <th className="px-6 py-4">Destination / Item</th>
                  <th className="px-6 py-4">Travel Date / Details</th>
                  <th className="px-6 py-4 text-center">Pax</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-surface/30 transition-colors">
                    {/* Customer */}
                    <td className="px-6 py-4.5">
                      <div className="space-y-1">
                        <span className="font-semibold text-ink block">{booking.name}</span>
                        <div className="flex flex-col gap-0.5 text-muted text-[10px]">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-primary/70 shrink-0" />
                            {booking.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-primary/70 shrink-0" />
                            {booking.phone}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Booking Type */}
                    <td className="px-6 py-4.5">
                      <span className="inline-block px-2.5 py-1 bg-surface border border-border/60 rounded-full font-medium text-[10px]">
                        {booking.type}
                      </span>
                    </td>

                    {/* Destination/Item */}
                    <td className="px-6 py-4.5 font-medium text-ink max-w-[200px] truncate">
                      {booking.itemName}
                    </td>

                    {/* Travel Details */}
                    <td className="px-6 py-4.5 text-muted">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                        {booking.date}
                      </div>
                    </td>

                    {/* Pax */}
                    <td className="px-6 py-4.5 text-center font-semibold text-ink">
                      {booking.guests}
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>

                    {/* Actions Status Selector + Delete */}
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-border rounded-lg text-xs text-ink outline-none cursor-pointer focus:border-primary transition-colors"
                        >
                          <option value="Pending">Set Pending</option>
                          <option value="Approved">Set Approved</option>
                          <option value="Completed">Set Completed</option>
                          <option value="Cancelled">Set Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="p-2 hover:bg-red-50 text-muted hover:text-red-500 rounded-lg border border-border/50 transition-all cursor-pointer"
                          title="Delete Request"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info counts */}
        <div className="bg-surface/30 px-6 py-4 border-t border-border/50 text-[10px] text-muted font-medium flex items-center justify-between">
          <span>Showing {filteredBookings.length} entries</span>
          <span>HR Trips Administration</span>
        </div>
      </div>

    </div>
  );
}
