"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import type { Package } from "@/lib/types";

import { MOCK_PACKAGES } from "@/lib/api";

const FEATURED: Package[] = MOCK_PACKAGES.filter((p) => p.featured);

export default function FeaturedPackages() {
  return (
    <section className="py-20 lg:py-24 bg-surface">
      <div className="container-wide">
        <SectionHeading
          badge="Top Destinations"
          title="Featured Holiday Packages"
          subtitle="Handpicked travel experiences designed for unforgettable memories. Book your dream vacation today."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={`/holiday-packages/${pkg.slug}`}
                className="group block bg-white rounded-2xl overflow-hidden border border-border/50 card-hover"
              >
                {/* Image */}
                <div className="relative h-48 img-zoom">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-ink">
                    {pkg.duration}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-muted text-xs mb-2">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {pkg.destination}
                  </div>
                  <h3 className="font-heading font-semibold text-ink text-base mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                    {pkg.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted">Starting from</span>
                      <div className="font-heading font-bold text-xl text-primary">
                        ₹{pkg.startingPrice.toLocaleString("en-IN")}
                      </div>
                      <span className="text-[11px] text-muted">per person</span>
                    </div>
                    <span className="flex items-center gap-1 text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                      View
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
            href="/holiday-packages"
            className="inline-flex items-center gap-2 px-7 py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-all duration-200"
          >
            View All Packages
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
