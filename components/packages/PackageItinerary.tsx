"use client";

import { motion } from "framer-motion";
import { MapPin, Sunrise, Sunset, Moon } from "lucide-react";
import type { ItineraryDay } from "@/lib/types";

interface PackageItineraryProps {
  itinerary: ItineraryDay[];
}

const timeIcons = [Sunrise, MapPin, Sunset, Moon];

export default function PackageItinerary({ itinerary }: PackageItineraryProps) {
  if (itinerary.length === 0) return null;

  return (
    <div>
      <h3 className="font-heading font-semibold text-ink text-lg mb-6">
        Day-wise Itinerary
      </h3>
      <div className="space-y-4">
        {itinerary.map((day, index) => {
          const Icon = timeIcons[index % timeIcons.length];
          return (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="relative pl-8 pb-6 last:pb-0"
            >
              {/* Timeline line */}
              {index < itinerary.length - 1 && (
                <div className="absolute left-[14px] top-10 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 to-border" />
              )}

              {/* Timeline dot */}
              <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-primary-light flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>

              {/* Content */}
              <div className="bg-white rounded-xl p-5 border border-border/50 hover:border-primary/20 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-0.5 bg-primary text-white text-xs font-bold rounded-md">
                    Day {day.day}
                  </span>
                  <h4 className="font-heading font-semibold text-ink text-base">
                    {day.title}
                  </h4>
                </div>
                <p className="text-muted text-sm leading-relaxed">
                  {day.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
