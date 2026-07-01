import type { Metadata } from "next";
import {
  Award, Headphones, BadgeDollarSign, ShieldCheck,
  MapPin, Users, Globe, Calendar,
} from "lucide-react";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import SectionHeading from "@/components/shared/SectionHeading";
import { WHY_CHOOSE_US } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about HR Trips — a trusted travel and hospitality company based in Patna, Bihar. Years of experience, thousands of happy travelers, and 24/7 support.",
};

const iconMap: Record<string, React.ElementType> = {
  Award, Headphones, BadgeDollarSign, ShieldCheck,
};

const stats = [
  { icon: Users, value: "5,000+", label: "Happy Travelers" },
  { icon: Globe, value: "50+", label: "Destinations" },
  { icon: Calendar, value: "8+", label: "Years Experience" },
  { icon: MapPin, value: "200+", label: "Tour Packages" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <div className="relative h-52 lg:h-64 flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1400&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        </div>
        <div className="container-wide relative z-10 pb-8">
          <h1 
            style={{ color: '#ffffff' }}
            className="font-heading text-3xl lg:text-4xl font-bold !text-white mb-1"
          >
            About HR Trips
          </h1>
          <p className="text-white/70 text-sm lg:text-base">
            Your trusted travel partner since day one
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        <Breadcrumbs items={[{ label: "About" }]} />

        {/* Story */}
        <div className="max-w-3xl mx-auto mt-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-primary-light text-primary text-xs font-semibold rounded-full mb-4 tracking-wide uppercase">
              Our Story
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-ink mb-6">
              Making Travel Dreams Come True
            </h2>
            <div className="section-divider mx-auto" />
          </div>

          <div className="space-y-5 text-muted text-base leading-relaxed">
            <p>
              Founded in Patna, Bihar, <strong className="text-ink">HR Trips</strong> started
              with a simple mission — to make quality travel accessible and affordable for
              everyone. What began as a small team passionate about exploring India has grown
              into a full-service travel and hospitality company serving thousands of
              travelers every year.
            </p>
            <p>
              We specialize in curating holiday packages that combine the best destinations,
              comfortable hotels, reliable transport, and authentic experiences. From the
              snow-capped peaks of Nepal and Himachal to the sun-kissed beaches of Goa and
              the royal heritage of Rajasthan — we&apos;ve crafted itineraries that our
              travelers truly love.
            </p>
            <p>
              Beyond travel, our services extend to hotel bookings, banquet and event
              management, catering, cab services, and more. We believe in building lasting
              relationships with our clients through transparency, trust, and exceptional
              service at every touchpoint.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-border/50 p-6 text-center card-hover"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary-light flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="font-heading font-bold text-3xl text-ink mb-1">
                {value}
              </div>
              <p className="text-muted text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Why Choose Us */}
        <div className="mt-20">
          <SectionHeading
            badge="Why Us"
            title="Why Choose HR Trips"
            subtitle="We go above and beyond to deliver travel experiences that exceed expectations."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE_US.map((item) => {
              const Icon = iconMap[item.icon] || Award;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-7 text-center border border-border/50 card-hover"
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
