import type { Metadata } from "next";
import Link from "next/link";
import {
  Palmtree, Hotel, PartyPopper, CalendarHeart,
  UtensilsCrossed, Car, Ticket, Users, ArrowRight,
} from "lucide-react";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import SectionHeading from "@/components/shared/SectionHeading";
import { SERVICES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "HR Trips offers 8 comprehensive travel and hospitality services including holiday packages, hotel booking, banquet booking, catering, cab services, and more.",
};

const iconMap: Record<string, React.ElementType> = {
  Palmtree, Hotel, PartyPopper, CalendarHeart,
  UtensilsCrossed, Car, Ticket, Users,
};

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <div className="relative h-52 lg:h-64 flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        </div>
        <div className="container-wide relative z-10 pb-8">
          <h1 
            style={{ color: '#ffffff' }}
            className="font-heading text-3xl lg:text-4xl font-bold !text-white mb-1"
          >
            Our Services
          </h1>
          <p className="text-white/70 text-sm lg:text-base">
            Comprehensive travel and hospitality solutions
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        <Breadcrumbs items={[{ label: "Services" }]} />

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => {
            const Icon = iconMap[service.icon] || Hotel;
            return (
              <div
                key={service.slug}
                className={`rounded-2xl border p-8 transition-all ${
                  service.active
                    ? "border-border/50 bg-white card-hover"
                    : "border-border/30 bg-surface/50"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                    service.active
                      ? "bg-primary-light text-primary"
                      : "bg-border/50 text-muted"
                  }`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-bold text-ink text-xl mb-2">
                  {service.name}
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  {service.description}
                </p>
                {service.active ? (
                  <Link
                    href={service.href}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all"
                  >
                    Explore
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href={service.href}
                    className="inline-flex items-center gap-2 px-6 py-2.5 border border-border text-muted text-sm font-medium rounded-xl hover:border-primary hover:text-primary transition-all"
                  >
                    Enquire Now
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
