"use client";

import { Search, SlidersHorizontal } from "lucide-react";

interface PackageFiltersProps {
  onFilterChange?: (filters: Record<string, string>) => void;
}

export default function PackageFilters({ onFilterChange }: PackageFiltersProps) {
  return (
    <div className="bg-white rounded-2xl border border-border/50 p-6 mb-8">
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
            className="w-full px-4 py-2.5 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
            onChange={(e) =>
              onFilterChange?.({ destination: e.target.value })
            }
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
            className="w-full px-4 py-2.5 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
            onChange={(e) =>
              onFilterChange?.({ duration: e.target.value })
            }
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
            className="w-full px-4 py-2.5 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
            onChange={(e) =>
              onFilterChange?.({ budget: e.target.value })
            }
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
              placeholder="Search packages..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
              onChange={(e) =>
                onFilterChange?.({ search: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
