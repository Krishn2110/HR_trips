"use client";

import Image from "next/image";
import { Users, Check } from "lucide-react";
import type { RoomType } from "@/lib/types";

interface RoomTypeSelectorProps {
  rooms: RoomType[];
  selected?: string;
  onSelect?: (roomName: string) => void;
}

export default function RoomTypeSelector({
  rooms,
  selected,
  onSelect,
}: RoomTypeSelectorProps) {
  return (
    <div>
      <h3 className="font-heading font-semibold text-ink text-lg mb-4">
        Room Types
      </h3>
      <div className="space-y-4">
        {rooms.map((room) => {
          const isSelected = selected === room.name;
          return (
            <div
              key={room.name}
              onClick={() => onSelect?.(room.name)}
              className={`flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? "border-primary bg-primary-light/20 shadow-md"
                  : "border-border hover:border-primary/30 bg-white"
              }`}
            >
              {/* Room Image */}
              <div className="relative w-full sm:w-40 h-32 rounded-xl overflow-hidden shrink-0">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>

              {/* Room Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-heading font-semibold text-ink">
                    {room.name}
                  </h4>
                  {isSelected && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
                <p className="text-muted text-sm mb-3">{room.description}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Users className="w-3.5 h-3.5" />
                    Max {room.maxGuests} guests
                  </div>
                  <div className="font-heading font-bold text-lg text-primary">
                    ₹{room.pricePerNight.toLocaleString("en-IN")}
                    <span className="text-muted text-xs font-normal">
                      /night
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
