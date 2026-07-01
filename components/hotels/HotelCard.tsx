import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, ArrowRight } from "lucide-react";
import type { Hotel } from "@/lib/types";

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  return (
    <Link
      href={`/hotel-booking/${hotel.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-border/50 card-hover"
    >
      <div className="relative h-52 img-zoom">
        <Image
          src={hotel.image}
          alt={hotel.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1">
          {Array.from({ length: hotel.starRating }).map((_, i) => (
            <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
          ))}
        </div>
        {hotel.featured && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-primary text-white rounded-full text-[10px] font-bold uppercase tracking-wide">
            Featured
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-heading font-semibold text-ink text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {hotel.name}
        </h3>
        <div className="flex items-center gap-1.5 text-muted text-xs mb-3">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          {hotel.location}
        </div>

        {/* Amenities preview */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {hotel.amenities.slice(0, 4).map((a, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-surface text-muted text-[11px] rounded-md"
            >
              {a}
            </span>
          ))}
          {hotel.amenities.length > 4 && (
            <span className="px-2 py-0.5 bg-surface text-muted text-[11px] rounded-md">
              +{hotel.amenities.length - 4} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div>
            <span className="text-xs text-muted">Starting from</span>
            <div className="font-heading font-bold text-xl text-primary">
              ₹{hotel.startingPrice.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-muted">per night</span>
          </div>
          <span className="flex items-center gap-1 text-primary text-sm font-semibold group-hover:gap-2 transition-all">
            View
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
