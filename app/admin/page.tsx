"use client";

import { useEffect, useState } from "react";
import { getAdminBookings, getPackages } from "@/lib/api";
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
  Briefcase
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
        case "ticketing": return item.includes("ticketing") || item.includes("ticket") || item.includes("flight") || item.includes("train") || item.includes("bus");
        case "manpower": return item.includes("manpower") || item.includes("staff") || item.includes("security") || item.includes("housekeeping") || item.includes("guard");
        default: return false;
      }
    }).length;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink">
            Executive Dashboard
          </h1>
          <p className="text-muted text-xs mt-1">
            Real-time request metrics board across all active website services.
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
        </div>
      )}
    </div>
  );
}
