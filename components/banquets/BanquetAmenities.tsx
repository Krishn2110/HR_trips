import {
  Wind,
  Sparkles,
  Car,
  Volume2,
  Zap,
  ShieldCheck,
  Utensils,
  Video,
  Flame,
  Check,
  Building2,
  Wifi,
  Users
} from "lucide-react";

const AMENITY_ICON_MAP: Record<string, any> = {
  "ac hall": Wind,
  "air conditioning": Wind,
  "decor": Sparkles,
  "stage decor": Sparkles,
  "parking": Car,
  "valet parking": Car,
  "dj sound": Volume2,
  "dj": Volume2,
  "power backup": Zap,
  "generator": Zap,
  "cctv": Video,
  "cctv security": Video,
  "fire safety": Flame,
  "in-house catering": Utensils,
  "catering": Utensils,
  "wi-fi": Wifi,
  "dressing room": Users,
  "bridal room": Users,
};

interface BanquetAmenitiesProps {
  amenities: string[] | string;
}

export default function BanquetAmenities({ amenities }: BanquetAmenitiesProps) {
  let list: string[] = [];
  if (Array.isArray(amenities)) {
    list = amenities;
  } else if (typeof amenities === "string") {
    try {
      list = JSON.parse(amenities);
    } catch {
      list = amenities.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  if (list.length === 0) {
    list = ["Air Conditioned Hall", "Stage Decoration", "Parking Facility", "Power Backup", "CCTV Security", "Fire Safety Compliance"];
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {list.map((item, index) => {
        const IconComponent =
          AMENITY_ICON_MAP[item.toLowerCase().trim()] || Check;

        return (
          <div
            key={index}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-surface border border-border/40 text-xs text-ink font-medium"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <IconComponent className="w-3.5 h-3.5" />
            </div>
            <span className="line-clamp-1">{item}</span>
          </div>
        );
      })}
    </div>
  );
}
