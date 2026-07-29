"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, Sparkles, Check } from "lucide-react";

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi (NCT)", "Jammu and Kashmir",
  "Ladakh", "Chandigarh", "Puducherry", "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu"
];

export const POPULAR_INDIAN_CITIES = [
  { city: "Patna", state: "Bihar" },
  { city: "New Delhi", state: "Delhi (NCT)" },
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Bengaluru", state: "Karnataka" },
  { city: "Kolkata", state: "West Bengal" },
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Hyderabad", state: "Telangana" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Ahmedabad", state: "Gujarat" },
  { city: "Jaipur", state: "Rajasthan" },
  { city: "Lucknow", state: "Uttar Pradesh" },
  { city: "Varanasi", state: "Uttar Pradesh" },
  { city: "Agra", state: "Uttar Pradesh" },
  { city: "Chandigarh", state: "Chandigarh" },
  { city: "Dehradun", state: "Uttarakhand" },
  { city: "Shimla", state: "Himachal Pradesh" },
  { city: "Manali", state: "Himachal Pradesh" },
  { city: "Srinagar", state: "Jammu and Kashmir" },
  { city: "Ranchi", state: "Jharkhand" },
  { city: "Gaya", state: "Bihar" },
  { city: "Muzaffarpur", state: "Bihar" },
  { city: "Darbhanga", state: "Bihar" },
  { city: "Bhagalpur", state: "Bihar" },
  { city: "Guwahati", state: "Assam" },
  { city: "Bhubaneswar", state: "Odisha" },
  { city: "Indore", state: "Madhya Pradesh" },
  { city: "Bhopal", state: "Madhya Pradesh" },
  { city: "Goa (Panaji)", state: "Goa" },
  { city: "Kochi", state: "Kerala" },
  { city: "Trivandrum", state: "Kerala" }
];

interface LocationAutoSuggestProps {
  value: string;
  onChange: (val: string) => void;
  onSelectState?: (stateVal: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  type?: "city" | "state";
  error?: string;
}

export default function LocationAutoSuggest({
  value,
  onChange,
  onSelectState,
  placeholder = "Enter city or location...",
  label,
  className = "",
  type = "city",
  error,
}: LocationAutoSuggestProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = type === "state"
    ? INDIAN_STATES.filter((s) => s.toLowerCase().includes((value || "").toLowerCase()))
    : POPULAR_INDIAN_CITIES.filter(
        (c) =>
          c.city.toLowerCase().includes((value || "").toLowerCase()) ||
          c.state.toLowerCase().includes((value || "").toLowerCase())
      );

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label && <label className="block text-xs font-semibold text-muted mb-1.5">{label}</label>}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-surface rounded-xl text-xs text-ink border border-border focus:border-primary outline-none transition-all ${className}`}
        />
        <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
      </div>

      {error && <p className="text-red-500 text-[10px] mt-1">{error}</p>}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-border/80 rounded-2xl shadow-xl max-h-56 overflow-y-auto p-1.5 divide-y divide-border/20">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" /> Suggested {type === "state" ? "States" : "Cities"}
          </div>
          {type === "state"
            ? (suggestions as string[]).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onChange(item);
                    setIsOpen(false);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-ink hover:bg-primary/10 hover:text-primary rounded-xl cursor-pointer transition-colors flex items-center justify-between"
                >
                  <span>{item}</span>
                  {value.toLowerCase() === item.toLowerCase() && <Check className="w-3.5 h-3.5 text-primary" />}
                </div>
              ))
            : (suggestions as typeof POPULAR_INDIAN_CITIES).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onChange(item.city);
                    if (onSelectState) onSelectState(item.state);
                    setIsOpen(false);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-ink hover:bg-primary/10 hover:text-primary rounded-xl cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="block font-bold">{item.city}</span>
                    <span className="text-[10px] text-muted">{item.state}</span>
                  </div>
                  {value.toLowerCase() === item.city.toLowerCase() && <Check className="w-3.5 h-3.5 text-primary" />}
                </div>
              ))}
        </div>
      )}
    </div>
  );
}

// Auto Pincode Fetcher Helper Function
export async function fetchCityStateFromPincode(pincode: string): Promise<{ city: string; state: string } | null> {
  const cleanPincode = pincode.replace(/\D/g, "");
  if (cleanPincode.length !== 6) return null;

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPincode}`);
    const data = await response.json();

    if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
      const po = data[0].PostOffice[0];
      const city = po.District || po.Name || po.Block || "";
      const state = po.State || "";
      return { city, state };
    }
  } catch (err) {
    console.error("Pincode lookup error:", err);
  }
  return null;
}
