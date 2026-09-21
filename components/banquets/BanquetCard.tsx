import Link from "next/link";
import { MapPin, Users, ArrowRight, IndianRupee, GlassWater, CalendarClock } from "lucide-react";

interface BanquetCardProps {
  banquet: {
    id: string | number;
    slug?: string;
    name: string;
    location?: string;
    city?: string;
    state?: string;
    capacity?: number;
    pricePerPlateVeg?: number;
    price_per_plate_veg?: number;
    pricePerPlateNonVeg?: number;
    price_per_plate_non_veg?: number;
    pricePerDay?: number;
    price_per_day?: number;
    image?: string;
    images?: string[] | string;
    description?: string;
    amenities?: string[] | string;
    featured?: boolean | number;
  };
}

export default function BanquetCard({ banquet }: BanquetCardProps) {
  const slug = banquet.slug || banquet.id.toString();
  const locationText = banquet.city
    ? banquet.location && !banquet.location.toLowerCase().includes(banquet.city.toLowerCase())
      ? `${banquet.location}, ${banquet.city}`
      : banquet.city
    : banquet.location || "India";

  let amenitiesList: string[] = [];
  if (Array.isArray(banquet.amenities)) {
    amenitiesList = banquet.amenities;
  } else if (typeof banquet.amenities === "string") {
    try {
      amenitiesList = JSON.parse(banquet.amenities);
    } catch {
      amenitiesList = banquet.amenities ? banquet.amenities.split(",").map((s) => s.trim()) : [];
    }
  }

  let coverImage = banquet.image;
  if (!coverImage && banquet.images) {
    if (Array.isArray(banquet.images)) coverImage = banquet.images[0];
    else if (typeof banquet.images === "string") {
      try {
        const parsed = JSON.parse(banquet.images);
        if (Array.isArray(parsed) && parsed.length > 0) coverImage = parsed[0];
        else coverImage = banquet.images;
      } catch {
        coverImage = banquet.images;
      }
    }
  }
  if (!coverImage) {
    coverImage = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80";
  }

  const vegRate = Number(banquet.price_per_plate_veg ?? banquet.pricePerPlateVeg ?? 0);
  const nonVegRate = Number(banquet.price_per_plate_non_veg ?? banquet.pricePerPlateNonVeg ?? 0);
  const perDayRate = Number(banquet.price_per_day ?? banquet.pricePerDay ?? 0);
  const capacity = Number(banquet.capacity || 500);

  return (
    <Link
      href={`/banquet-booking/${slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-border/50 card-hover shadow-sm hover:shadow-md transition-all flex flex-col"
    >
      <div className="relative h-56 img-zoom bg-surface overflow-hidden shrink-0">
        <img
          src={coverImage}
          alt={banquet.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Strong protection scrim so text is always 100% visible on any background */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />

        {/* Guest Capacity Badge */}
        <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-md !text-white rounded-full flex items-center gap-1.5 text-xs font-bold shadow-md border border-white/10">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span className="!text-white">{capacity} Guests</span>
        </div>

        {Boolean(Number(banquet.featured)) && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-primary !text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
            Featured Venue
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 z-10">
          <h3 className="font-heading font-black text-lg sm:text-xl leading-snug line-clamp-1 !text-white group-hover:!text-primary-light drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] transition-colors">
            {banquet.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs mt-1 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="line-clamp-1 !text-white/90">{locationText}</span>
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Amenities Badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {amenitiesList.slice(0, 4).map((a, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-surface text-muted text-[11px] font-medium rounded-lg border border-border/40"
              >
                {a}
              </span>
            ))}
            {amenitiesList.length > 4 && (
              <span className="px-2 py-1 bg-surface text-muted text-[11px] font-medium rounded-lg">
                +{amenitiesList.length - 4} more
              </span>
            )}
          </div>

          {banquet.description && (
            <p className="text-muted text-xs line-clamp-2 leading-relaxed mb-4">
              {banquet.description}
            </p>
          )}
        </div>

        {/* Pricing & CTA Section */}
        <div className="pt-4 border-t border-border/50 flex flex-col gap-4 mt-auto">
          
          {/* HIGHLIGHTED PER DAY CHARGE */}
          {perDayRate > 0 && (
            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl px-3 py-2.5">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <CalendarClock className="w-4 h-4" /> Per Day Hall Rent
              </span>
              <div className="font-heading font-black text-sm text-primary flex items-center">
                <IndianRupee className="w-3.5 h-3.5" />
                {perDayRate.toLocaleString("en-IN")}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">
                Veg Plate
              </span>
              <div className="font-heading font-bold text-base text-ink flex items-center">
                <IndianRupee className="w-3.5 h-3.5" />
                {vegRate.toLocaleString("en-IN")}
                <span className="text-[10px] font-normal text-muted ml-1">/ plate</span>
              </div>
            </div>

            {nonVegRate > 0 ? (
              <div className="text-right">
                <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">
                  Non-Veg
                </span>
                <div className="font-heading font-bold text-base text-ink flex items-center justify-end">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {nonVegRate.toLocaleString("en-IN")}
                  <span className="text-[10px] font-normal text-muted ml-1">/ plate</span>
                </div>
              </div>
            ) : (
              <div className="text-right flex items-center justify-end h-full">
                 <span className="flex items-center gap-1 text-primary text-xs font-bold group-hover:gap-1.5 transition-all">
                  View Details <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}