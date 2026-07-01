"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Palmtree,
  Hotel,
  PartyPopper,
  CalendarHeart,
  UtensilsCrossed,
  Car,
  Ticket,
  Users,
  ArrowRight,
} from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import { SERVICES } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
  Palmtree,
  Hotel,
  PartyPopper,
  CalendarHeart,
  UtensilsCrossed,
  Car,
  Ticket,
  Users,
};

export default function ServicesGrid() {
  return (
    <section className="py-20 lg:py-24">
      <div className="container-wide">
        <SectionHeading
          badge="What We Offer"
          title="Our Services"
          subtitle="From holiday planning to hospitality management — we cover every aspect of your travel and event needs."
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {SERVICES.map((service, index) => {
            const Icon = iconMap[service.icon] || Hotel;
            return (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  href={service.href}
                  className={`group block p-6 rounded-2xl border transition-all duration-300 h-full ${
                    service.active
                      ? "border-border/50 bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 card-hover"
                      : "border-border/30 bg-surface/50"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                      service.active
                        ? "bg-primary-light group-hover:bg-primary text-primary group-hover:text-white"
                        : "bg-border/50 text-muted"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-semibold text-ink text-[15px] mb-1.5">
                    {service.name}
                  </h3>
                  <p className="text-muted text-xs leading-relaxed mb-3 line-clamp-2">
                    {service.description}
                  </p>
                  {service.active ? (
                    <span className="inline-flex items-center gap-1 text-primary text-xs font-semibold group-hover:gap-2 transition-all">
                      Explore
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="inline-block px-2.5 py-1 bg-border/50 text-muted text-[10px] font-medium rounded-full">
                      Enquire Now
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
