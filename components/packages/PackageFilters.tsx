"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function PackageFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Update the URL Query parameters when a filter is selected
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Use transition to keep the UI smooth while the server re-fetches
    startTransition(() => {
      // { scroll: false } prevents the page from jumping to the top when filtering
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className={`bg-white rounded-2xl border border-border/50 p-6 mb-8 transition-opacity ${isPending ? 'opacity-60' : 'opacity-100'}`}>
      <div className="flex items-center gap-2 mb-5">
        <SlidersHorizontal className="w-5 h-5 text-primary" />
        <h3 className="font-heading font-semibold text-ink">Filter Packages</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Destination */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            Destination
          </label>
          <select
            defaultValue={searchParams.get("destination") || ""}
            className="w-full px-4 py-2.5 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors cursor-pointer"
            onChange={(e) => handleFilterChange("destination", e.target.value)}
          >
            <option value="">All Destinations</option>
            <option value="nepal">Nepal</option>
            <option value="goa">Goa</option>
            <option value="himachal">Himachal Pradesh</option>
            <option value="rajasthan">Rajasthan</option>
            <option value="kashmir">Kashmir</option>
            <option value="sikkim">Sikkim & West Bengal</option>
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            Duration
          </label>
          <select
            defaultValue={searchParams.get("duration") || ""}
            className="w-full px-4 py-2.5 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors cursor-pointer"
            onChange={(e) => handleFilterChange("duration", e.target.value)}
          >
            <option value="">Any Duration</option>
            <option value="3">Up to 3 Nights</option>
            <option value="5">3–5 Nights</option>
            <option value="7">5–7 Nights</option>
            <option value="10">7+ Nights</option>
          </select>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            Budget (per person)
          </label>
          <select
            defaultValue={searchParams.get("budget") || ""}
            className="w-full px-4 py-2.5 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors cursor-pointer"
            onChange={(e) => handleFilterChange("budget", e.target.value)}
          >
            <option value="">Any Budget</option>
            <option value="7000">Under ₹7,000</option>
            <option value="10000">₹7,000 – ₹10,000</option>
            <option value="15000">₹10,000 – ₹15,000</option>
            <option value="999999">₹15,000+</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              defaultValue={searchParams.get("search") || ""}
              placeholder="Search packages..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}