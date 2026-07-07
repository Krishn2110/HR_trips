"use client";

import { useEffect, useState } from "react";
import { getHotelRegistrationByEmail } from "@/lib/api";
import type { HotelRegistration } from "@/lib/types";
import {
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Star,
  DoorOpen,
  Users,
  Calendar,
  IndianRupee,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function HotelOwnerDashboard() {
  const [registration, setRegistration] = useState<HotelRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const email = sessionStorage.getItem("hotelOwnerEmail");
    if (!email) {
      setIsLoading(false);
      return;
    }

    const fetchReg = async () => {
      try {
        const reg = await getHotelRegistrationByEmail(email);
        setRegistration(reg);
      } catch (e) {
        console.error("Failed to load hotel owner registration", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReg();
    
    // Set up polling to check if admin updates status
    const interval = setInterval(fetchReg, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
        <p className="text-muted text-xs">Loading dashboard data...</p>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-border/50 shadow-sm p-8 max-w-md mx-auto">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="font-heading font-bold text-xl text-ink mb-2">No Active Session</h2>
        <p className="text-muted text-xs mb-6">
          Could not retrieve your hotel registration session details. Please try logging in again.
        </p>
        <Link
          href="/hotel-owner/login"
          className="inline-flex px-6 py-2.5 bg-primary text-white font-semibold rounded-xl text-xs hover:shadow-lg transition-all"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const renderPendingStatus = () => (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-8 max-w-2xl mx-auto text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto animate-pulse">
        <Clock className="w-10 h-10 text-amber-500" />
      </div>
      <div>
        <h2 className="font-heading font-bold text-2xl text-ink">Registration Under Review</h2>
        <p className="text-muted text-sm mt-2 max-w-md mx-auto leading-relaxed">
          Thank you for registering <strong>{registration.hotelName}</strong>! Your application is currently being verified by our administrators.
        </p>
      </div>
      <div className="bg-surface rounded-xl p-5 border border-border/40 text-left max-w-md mx-auto space-y-2">
        <div className="text-[10px] uppercase font-bold text-muted">Submitted Details</div>
        <div className="text-xs text-ink"><span className="font-semibold">Hotel:</span> {registration.hotelName}</div>
        <div className="text-xs text-ink"><span className="font-semibold">Address:</span> {registration.hotelAddress}, {registration.city}</div>
        <div className="text-xs text-ink"><span className="font-semibold">Owner:</span> {registration.ownerName} ({registration.phone})</div>
      </div>
      <div className="text-xs text-muted flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        Checking status automatically. Once approved, this dashboard will unlock.
      </div>
    </div>
  );

  const renderRejectedStatus = () => (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-8 max-w-2xl mx-auto text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
        <XCircle className="w-10 h-10 text-rose-500" />
      </div>
      <div>
        <h2 className="font-heading font-bold text-2xl text-ink">Application Declined</h2>
        <p className="text-muted text-sm mt-2 max-w-md mx-auto leading-relaxed">
          We regret to inform you that your registration application for <strong>{registration.hotelName}</strong> was not approved at this time.
        </p>
      </div>
      <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
        If you believe this was an error or would like to re-submit with updated information, please contact our support desk or submit a new registration.
      </p>
      <div className="flex items-center justify-center gap-4 pt-2">
        <Link
          href="/contact"
          className="inline-flex px-6 py-2.5 border border-border rounded-xl text-xs font-semibold text-ink hover:bg-surface transition-colors"
        >
          Contact Support
        </Link>
        <Link
          href="/hotel-registration"
          className="inline-flex px-6 py-2.5 bg-primary text-white font-semibold rounded-xl text-xs hover:shadow-lg transition-all"
        >
          Submit New Registration
        </Link>
      </div>
    </div>
  );

  const renderApprovedStatus = () => {
    // Mock Statistics for Approved Hotels
    const stats = [
      { label: "Total Bookings", value: "34", change: "+12% this month", icon: Calendar, color: "text-blue-600 bg-blue-50" },
      { label: "Active Guests", value: "12", change: "6 rooms occupied", icon: Users, color: "text-emerald-600 bg-emerald-50" },
      { label: "Monthly Revenue", value: "₹1,42,800", change: "+8% growth rate", icon: IndianRupee, color: "text-primary bg-primary-light" },
      { label: "Average Occupancy", value: "78%", change: "+4% vs last week", icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
    ];

    const mockRecentBookings = [
      { id: "B-2931", guest: "Aarav Sharma", rooms: "1 Room", checkin: "10 Jul 2026", checkout: "12 Jul 2026", amount: "₹8,400", status: "Upcoming" },
      { id: "B-2904", guest: "Neha Verma", rooms: "2 Rooms", checkin: "04 Jul 2026", checkout: "06 Jul 2026", amount: "₹16,200", status: "Checked In" },
      { id: "B-2882", guest: "Rohan Gupta", rooms: "1 Room", checkin: "28 Jun 2026", checkout: "01 Jul 2026", amount: "₹12,600", status: "Completed" },
    ];

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-2xl lg:text-3xl text-ink">
              Welcome back, {registration.ownerName}!
            </h1>
            <p className="text-muted text-xs mt-1">
              Here is what is happening at <strong>{registration.hotelName}</strong> today.
            </p>
          </div>
          <span className="self-start md:self-center inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200/50">
            <CheckCircle className="w-3.5 h-3.5" /> Approved Partner
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                    {s.label}
                  </span>
                  <span className="font-heading font-black text-xl text-ink block">
                    {s.value}
                  </span>
                  <span className="text-[10px] text-green-500 font-semibold block">
                    {s.change}
                  </span>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-ink text-base">Recent Booking Orders</h3>
              <button className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                View all bookings <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 text-[10px] uppercase font-bold text-muted bg-surface/30">
                      <th className="py-3 px-4">Booking ID</th>
                      <th className="py-3 px-4">Guest Name</th>
                      <th className="py-3 px-4">Stay Dates</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-xs">
                    {mockRecentBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-surface/20 transition-colors">
                        <td className="py-4 px-4 font-bold text-ink">{b.id}</td>
                        <td className="py-4 px-4 font-semibold text-ink">
                          {b.guest}
                          <span className="block text-[10px] text-muted font-normal mt-0.5">{b.rooms}</span>
                        </td>
                        <td className="py-4 px-4 text-muted font-medium">
                          {b.checkin} to {b.checkout}
                        </td>
                        <td className="py-4 px-4 font-bold text-ink">{b.amount}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${
                            b.status === "Checked In"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                              : b.status === "Upcoming"
                              ? "bg-blue-50 text-blue-700 border-blue-200/50"
                              : "bg-gray-50 text-gray-700 border-gray-200/50"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Hotel Details Card */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-ink text-base">Your Hotel Info</h3>
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-4">
              <div>
                <h4 className="font-heading font-black text-ink text-lg">{registration.hotelName}</h4>
                <p className="text-muted text-xs flex items-center gap-1 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" /> {registration.hotelAddress}, {registration.city}, {registration.state} - {registration.pincode}
                </p>
              </div>

              <hr className="border-border/30" />

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase block">Star Rating</span>
                  <span className="text-ink font-semibold flex items-center gap-1 mt-0.5">
                    {registration.starRating} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase block">Total Rooms</span>
                  <span className="text-ink font-semibold flex items-center gap-1 mt-0.5">
                    <DoorOpen className="w-3.5 h-3.5" /> {registration.totalRooms} Rooms
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase block">Contact Name</span>
                  <span className="text-ink font-medium block mt-0.5">{registration.ownerName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase block">Contact Phone</span>
                  <span className="text-ink font-medium block mt-0.5">{registration.phone}</span>
                </div>
              </div>

              {registration.amenities.length > 0 && (
                <>
                  <hr className="border-border/30" />
                  <div>
                    <span className="text-[10px] font-bold text-muted uppercase block mb-2">Listed Amenities</span>
                    <div className="flex flex-wrap gap-1">
                      {registration.amenities.slice(0, 6).map((a) => (
                        <span key={a} className="px-2 py-0.5 bg-surface text-muted text-[9px] font-semibold border border-border/50 rounded-md">
                          {a}
                        </span>
                      ))}
                      {registration.amenities.length > 6 && (
                        <span className="px-2 py-0.5 bg-surface text-primary text-[9px] font-bold border border-border/50 rounded-md">
                          +{registration.amenities.length - 6} More
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  switch (registration.status) {
    case "Pending":
      return renderPendingStatus();
    case "Rejected":
      return renderRejectedStatus();
    case "Approved":
      return renderApprovedStatus();
    default:
      return renderPendingStatus();
  }
}
