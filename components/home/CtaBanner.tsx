"use client";

import { motion } from "framer-motion";
import { Phone, MessageCircle } from "lucide-react";
import { CONTACT } from "@/lib/constants";

export default function CtaBanner() {
  return (
    <section className="py-20 lg:py-24">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=80')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-primary/40" />
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 py-16 lg:px-16 lg:py-20 text-center lg:text-left">
            <div className="max-w-2xl mx-auto lg:mx-0">
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Plan Your Next Trip
                <br />
                <span className="text-primary">with HR Trips</span>
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-xl">
                Ready for an unforgettable journey? Get in touch with our
                travel experts and let us craft the perfect itinerary for
                you.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <a
                  href={CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#20bd5a] hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat on WhatsApp
                </a>
                <a
                  href={`tel:${CONTACT.phone}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 active:scale-[0.98] transition-all duration-200"
                >
                  <Phone className="w-5 h-5" />
                  Call Us Now
                </a>
              </div>
            </div>
          </div>

          {/* Decorative glow */}
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-[100px]" />
        </motion.div>
      </div>
    </section>
  );
}
