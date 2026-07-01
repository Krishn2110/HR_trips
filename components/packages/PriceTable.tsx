import { Star, Check } from "lucide-react";
import type { PricingTier } from "@/lib/types";

interface PriceTableProps {
  pricing: PricingTier[];
}

export default function PriceTable({ pricing }: PriceTableProps) {
  return (
    <div>
      <h3 className="font-heading font-semibold text-ink text-lg mb-4">
        Package Pricing
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pricing.map((tier, index) => (
          <div
            key={index}
            className={`relative rounded-2xl p-6 border-2 transition-all ${
              tier.recommended
                ? "border-primary bg-primary-light/30 shadow-lg shadow-primary/10"
                : "border-border bg-white"
            }`}
          >
            {tier.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-bold rounded-full">
                Recommended
              </div>
            )}

            <div className="flex items-center gap-2 mb-4">
              <Star
                className={`w-5 h-5 ${
                  tier.recommended
                    ? "text-primary fill-primary"
                    : "text-muted"
                }`}
              />
              <h4 className="font-heading font-semibold text-ink">
                {tier.hotelCategory}
              </h4>
            </div>

            <div className="mb-4">
              <span className="text-xs text-muted uppercase tracking-wide">
                {tier.plan} Plan
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-heading font-bold text-3xl text-primary">
                  ₹{tier.pricePerPerson.toLocaleString("en-IN")}
                </span>
                <span className="text-muted text-sm">/ person</span>
              </div>
            </div>

            <ul className="space-y-2">
              {[
                "Hotel accommodation",
                tier.plan === "MAP"
                  ? "Breakfast & dinner"
                  : tier.plan === "AP"
                  ? "All meals included"
                  : "Breakfast included",
                "All transfers",
                "Sightseeing as per itinerary",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-ink/70">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
