"use client";

import { Search, MapPin, Calendar, Users } from "lucide-react";

export default function HotelSearchBar() {
  return (
    <div className="bg-white rounded-2xl border border-border/50 p-6 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* City */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-muted mb-1.5">
            City / Destination
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Where to?"
              className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
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
              className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
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
              className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
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
            <select className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors appearance-none">
              <option>1 Room, 2 Guests</option>
              <option>2 Rooms, 4 Guests</option>
              <option>3 Rooms, 6 Guests</option>
              <option>4+ Rooms</option>
            </select>
          </div>
        </div>

        {/* Search button */}
        <div className="flex items-end">
          <button className="w-full px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200">
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
