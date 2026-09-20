"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Users, Filter, X } from "lucide-react";

export default function BanquetSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams?.get("query") || "");
  const [location, setLocation] = useState(searchParams?.get("location") || "");
  const [capacity, setCapacity] = useState(searchParams?.get("capacity") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (location.trim()) params.set("location", location.trim());
    if (capacity.trim()) params.set("capacity", capacity.trim());

    router.push(`/banquet-booking?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery("");
    setLocation("");
    setCapacity("");
    router.push("/banquet-booking");
  };

  const hasFilters = query || location || capacity;

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-2xl sm:rounded-full border border-border/60 shadow-lg p-2.5 sm:p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-4xl mx-auto -mt-8 relative z-20"
    >
      {/* Name / Keyword Search */}
      <div className="flex-1 flex items-center px-4 py-2 border-b sm:border-b-0 sm:border-r border-border/40">
        <Search className="w-4 h-4 text-primary shrink-0 mr-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by banquet hall name..."
          className="w-full text-xs text-ink placeholder:text-muted outline-none bg-transparent"
        />
      </div>

      {/* Location / City Search */}
      <div className="flex-1 flex items-center px-4 py-2 border-b sm:border-b-0 sm:border-r border-border/40">
        <MapPin className="w-4 h-4 text-primary shrink-0 mr-3" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City or Area (e.g. Patna, Danapur)"
          className="w-full text-xs text-ink placeholder:text-muted outline-none bg-transparent"
        />
      </div>

      {/* Guest Capacity Filter */}
      <div className="sm:w-44 flex items-center px-4 py-2">
        <Users className="w-4 h-4 text-primary shrink-0 mr-3" />
        <select
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="w-full text-xs text-ink outline-none bg-transparent cursor-pointer"
        >
          <option value="">Any Capacity</option>
          <option value="100">100+ Guests</option>
          <option value="250">250+ Guests</option>
          <option value="500">500+ Guests</option>
          <option value="1000">1000+ Guests</option>
        </select>
      </div>

      <div className="flex items-center gap-2 px-1">
        {hasFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="p-2.5 hover:bg-surface rounded-full text-muted hover:text-ink transition-colors cursor-pointer"
            title="Clear filters"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl sm:rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Find Venues</span>
        </button>
      </div>
    </form>
  );
}
