"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Star, ArrowRight } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";

const FEATURED_HOTELS = [
  {
    slug: "hotel-royal-patna",
    name: "Hotel Royal Inn",
    city: "Patna",
    location: "Fraser Road, Patna",
    starRating: 3,
    startingPrice: 1899,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  },
  {
    slug: "hotel-paradise-goa",
    name: "Paradise Beach Resort",
    city: "Goa",
    location: "Calangute Beach Road",
    starRating: 4,
    startingPrice: 3499,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
  },
  {
    slug: "mountain-view-shimla",
    name: "Mountain View Resort",
    city: "Shimla",
    location: "Mall Road, Shimla",
    starRating: 3,
    startingPrice: 2499,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80",
  },
  {
    slug: "lake-palace-udaipur",
    name: "Lake Palace Heritage",
    city: "Udaipur",
    location: "Lake Pichola, Udaipur",
    starRating: 5,
    startingPrice: 5999,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80",
  },
];

export default function FeaturedHotels() {
  return (
    <section className="py-20 lg:py-24">
      <div className="container-wide">
        <SectionHeading
          badge="Top Stays"
          title="Featured Hotels"
          subtitle="Handpicked hotels offering exceptional comfort, service, and value across India."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_HOTELS.map((hotel, index) => (
            <motion.div
              key={hotel.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={`/hotel-booking/${hotel.slug}`}
                className="group block bg-white rounded-2xl overflow-hidden border border-border/50 card-hover"
              >
                <div className="relative h-48 img-zoom">
                  <Image
                    src={hotel.image}
                    alt={hotel.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1">
                    {Array.from({ length: hotel.starRating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-heading font-semibold text-ink text-base mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-muted text-xs mb-4">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {hotel.location}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div>
                      <span className="text-xs text-muted">From</span>
                      <div className="font-heading font-bold text-xl text-primary">
                        ₹{hotel.startingPrice.toLocaleString("en-IN")}
                      </div>
                      <span className="text-[11px] text-muted">per night</span>
                    </div>
                    <span className="flex items-center gap-1 text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                      Book
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/hotel-booking"
            className="inline-flex items-center gap-2 px-7 py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-all duration-200"
          >
            View All Hotels
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
