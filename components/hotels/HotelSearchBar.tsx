"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Calendar, Users } from "lucide-react";

export default function HotelSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from the URL so filters persist on refresh
  const [locationQuery, setLocationQuery] = useState(searchParams.get("location") || "");
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
  const [guests, setGuests] = useState(searchParams.get("guests") || "1 Room, 2 Guests");

  // Get today's date in YYYY-MM-DD format to prevent booking in the past
  const today = new Date().toISOString().split("T")[0];

  // The minimum check-out date should be the check-in date (or today if check-in isn't selected)
  const minCheckOut = checkIn ? checkIn : today;

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setCheckIn(selectedDate);
    
    // Automatically clear the check-out date if it is now earlier than the new check-in date
    if (checkOut && selectedDate > checkOut) {
      setCheckOut("");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Grab current URL parameters
    const params = new URLSearchParams(searchParams.toString());

    // Set or remove parameters based on input
    if (locationQuery.trim()) params.set("location", locationQuery.trim());
    else params.delete("location");

    if (checkIn) params.set("checkIn", checkIn);
    else params.delete("checkIn");

    if (checkOut) params.set("checkOut", checkOut);
    else params.delete("checkOut");

    if (guests) params.set("guests", guests);
    else params.delete("guests");

    // Push the new URL to trigger server-side filtering
    router.push(`/hotel-booking?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-border/50 p-6 mb-8 shadow-sm">
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* City / Destination */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-muted mb-1.5">
            City / Destination
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="Where to?"
              className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary outline-none transition-colors"
            />
          </div>
        </div>

        {/* Check-in */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            Check-in
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={handleCheckInChange}
              className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary outline-none transition-colors cursor-pointer"
            />
          </div>
        </div>

        {/* Check-out */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            Check-out
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="date"
              min={minCheckOut} // Dynamically prevents selecting a date before Check-in
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary outline-none transition-colors cursor-pointer"
            />
          </div>
        </div>

        {/* Guests */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            Rooms & Guests
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <select 
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="1 Room, 2 Guests">1 Room, 2 Guests</option>
              <option value="2 Rooms, 4 Guests">2 Rooms, 4 Guests</option>
              <option value="3 Rooms, 6 Guests">3 Rooms, 6 Guests</option>
              <option value="4+ Rooms">4+ Rooms</option>
            </select>
          </div>
        </div>

        {/* Search button */}
        <div className="flex items-end">
          <button 
            type="submit" 
            className="w-full px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </form>
    </div>
  );
}