"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, ChevronDown, Menu } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md"
            : "bg-white"
        }`}
      >
        <div className="container-wide flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="HR Trips Logo" className="w-10 h-10 object-contain rounded-xl" />
            <div className="hidden sm:block">
              <span className="font-heading font-bold text-xl text-ink leading-none">
                HR Trips
              </span>
              <span className="block text-[11px] text-muted leading-tight -mt-0.5">
                Travel & Hospitality
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <div key={link.href} className="relative">
                {link.children ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setServicesOpen(true)}
                    onMouseLeave={() => setServicesOpen(false)}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center gap-1 px-4 py-2 text-[15px] font-medium text-ink/80 hover:text-primary rounded-lg transition-colors"
                    >
                      {link.label}
                      <ChevronDown className="w-4 h-4" />
                    </Link>

                    {/* Dropdown */}
                    {servicesOpen && (
                      <div className="absolute top-full left-0 pt-2 w-56 animate-slide-down">
                        <div className="bg-white rounded-xl shadow-xl border border-border/50 py-2 overflow-hidden">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-4 py-2.5 text-sm text-ink/80 hover:text-primary hover:bg-primary-light/50 transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className="px-4 py-2 text-[15px] font-medium text-ink/80 hover:text-primary rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Right — CTA + Phone */}
          <div className="flex items-center gap-3">
            <a
              href="tel:7992481351"
              className="hidden md:flex items-center gap-1.5 text-sm font-medium text-ink/70 hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>7992481351</span>
            </a>
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200"
            >
              Book Now
            </Link>

            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-ink" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
