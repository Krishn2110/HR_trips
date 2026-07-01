import {
  Wifi,
  Car,
  UtensilsCrossed,
  Dumbbell,
  Waves,
  Sparkles,
  ShieldCheck,
  Clock,
  BatteryFull,
  Shirt,
  Baby,
  Mountain,
  Beer,
  ConciergeBell,
  Check,
} from "lucide-react";

interface HotelAmenitiesProps {
  amenities: string[];
}

const amenityIcons: Record<string, React.ElementType> = {
  "Free WiFi": Wifi,
  WiFi: Wifi,
  Parking: Car,
  Restaurant: UtensilsCrossed,
  "Multi-Cuisine Restaurant": UtensilsCrossed,
  Gym: Dumbbell,
  "Swimming Pool": Waves,
  "Spa & Wellness": Sparkles,
  Spa: Sparkles,
  "AC Rooms": ShieldCheck,
  "24/7 Front Desk": Clock,
  "Room Service": ConciergeBell,
  "Power Backup": BatteryFull,
  Laundry: Shirt,
  "Kids Play Area": Baby,
  "Mountain View": Mountain,
  "Lake View": Mountain,
  "Beach Access": Waves,
  "Bar & Lounge": Beer,
  "Fine Dining": UtensilsCrossed,
  "Cultural Evenings": Sparkles,
  "Butler Service": ConciergeBell,
  "Heritage Architecture": ShieldCheck,
  "Room Heater": ShieldCheck,
  Bonfire: Sparkles,
};

export default function HotelAmenities({ amenities }: HotelAmenitiesProps) {
  return (
    <div>
      <h3 className="font-heading font-semibold text-ink text-lg mb-4">
        Amenities & Facilities
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {amenities.map((amenity, index) => {
          const Icon = amenityIcons[amenity] || Check;
          return (
            <div
              key={index}
              className="flex items-center gap-3 px-4 py-3 bg-surface rounded-xl"
            >
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm text-ink/80">{amenity}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
