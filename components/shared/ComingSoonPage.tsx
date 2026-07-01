"use client";

import Link from "next/link";
import { MessageCircle, ArrowLeft, Phone, ShieldCheck, Mail, Send, Calendar } from "lucide-react";
import { CONTACT } from "@/lib/constants";
import Breadcrumbs from "@/components/shared/Breadcrumbs";

interface ComingSoonPageProps {
  serviceName: string;
  serviceDescription: string;
}

export default function ComingSoonPage({
  serviceName,
  serviceDescription,
}: ComingSoonPageProps) {
  return (
    <>
      <div className="relative h-52 lg:h-64 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        <div className="container-wide relative z-10 pb-8">
          <h1 
            style={{ color: '#ffffff' }}
            className="font-heading text-3xl lg:text-4xl font-bold !text-white mb-1"
          >
            {serviceName}
          </h1>
          <p className="text-white/70 text-sm lg:text-base">
            Professional travel & hospitality solutions
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        <Breadcrumbs
          items={[
            { label: "Services", href: "/services" },
            { label: serviceName },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-border/50 p-6 lg:p-8">
              <h2 className="font-heading text-2xl font-bold text-ink mb-4">
                Service Overview
              </h2>
              <p className="text-muted text-base leading-relaxed mb-6">
                {serviceDescription}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div className="flex items-start gap-3 p-4 bg-surface rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-semibold text-ink text-sm">Quality Guarantee</h4>
                    <p className="text-muted text-xs mt-1">We partner with only verified vendors to deliver premium experiences.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-surface rounded-xl">
                  <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-semibold text-ink text-sm">Custom Planning</h4>
                    <p className="text-muted text-xs mt-1">Get tailored packages structured around your budget and timing needs.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary-light/35 rounded-2xl p-6 lg:p-8 border border-primary/10">
              <h3 className="font-heading text-lg font-bold text-ink mb-2">
                Need a Custom Quote?
              </h3>
              <p className="text-muted text-sm mb-6">
                Contact our customer support team to get direct packages, customizable itineraries, and transparent rates.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white text-sm font-semibold rounded-xl hover:bg-[#20bd5a] hover:shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Enquiry
                </a>
                <a
                  href={`tel:${CONTACT.phone}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-ink border border-border text-sm font-semibold rounded-xl hover:border-primary hover:text-primary transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Call Support
                </a>
              </div>
            </div>
          </div>

          {/* Quick Contact Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-border/50 p-6">
              <h3 className="font-heading font-semibold text-ink text-lg mb-4">
                Quick Enquiry
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Enquiry submitted successfully! Our team will contact you shortly.");
                  (e.target as HTMLFormElement).reset();
                }}
                className="space-y-4"
              >
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Your Name *"
                    className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number *"
                    className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <textarea
                    rows={4}
                    placeholder="Describe your requirements..."
                    className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.98] transition-all"
                >
                  <Send className="w-4 h-4" />
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
