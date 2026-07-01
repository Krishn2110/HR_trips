"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Phone, Mail, ChevronRight } from "lucide-react";
import { NAV_LINKS, CONTACT } from "@/lib/constants";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[300px] max-w-[85vw] bg-white z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="HR Trips Logo" className="w-8 h-8 object-contain rounded-lg" />
            <span className="font-heading font-bold text-lg text-ink">
              HR Trips
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-ink" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col p-4 gap-1 overflow-y-auto max-h-[calc(100vh-200px)]">
          {NAV_LINKS.map((link) => (
            <div key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between px-4 py-3 text-[15px] font-medium text-ink/80 hover:text-primary hover:bg-primary-light/50 rounded-xl transition-colors"
              >
                {link.label}
                <ChevronRight className="w-4 h-4 text-muted" />
              </Link>
              {link.children && (
                <div className="ml-4 border-l-2 border-primary-light">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onClose}
                      className="block px-4 py-2 text-sm text-muted hover:text-primary transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Contact footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-surface">
          <a
            href={`tel:${CONTACT.phone}`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-ink/70 hover:text-primary transition-colors"
          >
            <Phone className="w-4 h-4" />
            {CONTACT.phoneFormatted}
          </a>
          <a
            href={`mailto:${CONTACT.email}`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-ink/70 hover:text-primary transition-colors"
          >
            <Mail className="w-4 h-4" />
            {CONTACT.email}
          </a>
          <Link
            href="/contact"
            onClick={onClose}
            className="mt-2 w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold rounded-xl"
          >
            Book Now
          </Link>
        </div>
      </div>
    </>
  );
}
