import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import type { Package } from "@/lib/types";

interface PackageCardProps {
  pkg: Package;
}

export default function PackageCard({ pkg }: PackageCardProps) {
  return (
    <Link
      href={`/holiday-packages/${pkg.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-border/50 card-hover"
    >
      {/* Image */}
      <div className="relative h-52 img-zoom">
        <Image
          src={pkg.image}
          alt={pkg.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-ink flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {pkg.duration}
          </span>
        </div>
        {pkg.featured && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-primary text-white rounded-full text-[10px] font-bold uppercase tracking-wide">
            Popular
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-1.5 text-muted text-xs mb-2">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          {pkg.destination}
        </div>
        <h3 className="font-heading font-semibold text-ink text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {pkg.title}
        </h3>

        {/* Highlights preview */}
        {pkg.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {pkg.highlights.slice(0, 3).map((h, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-surface text-muted text-[11px] rounded-md"
              >
                {h.length > 25 ? h.substring(0, 25) + "..." : h}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div>
            <span className="text-xs text-muted">Starting from</span>
            <div className="font-heading font-bold text-xl text-primary">
              ₹{pkg.startingPrice.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-muted">per person</span>
          </div>
          <span className="flex items-center gap-1 text-primary text-sm font-semibold group-hover:gap-2 transition-all">
            Details
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
