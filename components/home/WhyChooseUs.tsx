"use client";

import { motion } from "framer-motion";
import {
  Award,
  Headphones,
  BadgeDollarSign,
  ShieldCheck,
} from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import { WHY_CHOOSE_US } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
  Award,
  Headphones,
  BadgeDollarSign,
  ShieldCheck,
};

export default function WhyChooseUs() {
  return (
    <section className="py-20 lg:py-24 bg-surface">
      <div className="container-wide">
        <SectionHeading
          badge="Why HR Trips"
          title="Why Travelers Choose Us"
          subtitle="We combine expertise, affordability, and trust to deliver travel experiences that exceed expectations."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {WHY_CHOOSE_US.map((item, index) => {
            const Icon = iconMap[item.icon] || Award;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-7 text-center card-hover border border-border/50"
              >
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary-light flex items-center justify-center">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg text-ink mb-1">
                  {item.title}
                </h3>
                <p className="text-primary text-sm font-semibold mb-3">
                  {item.subtitle}
                </p>
                <p className="text-muted text-sm leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
