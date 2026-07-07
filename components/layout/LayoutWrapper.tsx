"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloatButton from "@/components/shared/WhatsAppFloatButton";
import Loading from "@/app/loading";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Reset transitioning state when route changes
  useEffect(() => {
    setIsTransitioning(false);
  }, [pathname]);

  // Intercept local link clicks to show loader immediately
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      let target = e.target as HTMLElement | null;

      // Bubble up to find <a> tag
      while (target && target.tagName !== "A") {
        target = target.parentElement;
      }

      if (target && target.tagName === "A") {
        const anchor = target as HTMLAnchorElement;
        const href = anchor.getAttribute("href");

        // Skip external, hash links, mailto/tel, and new tab links
        if (
          href &&
          !href.startsWith("http") &&
          !href.startsWith("#") &&
          !href.startsWith("mailto:") &&
          !href.startsWith("tel:") &&
          anchor.target !== "_blank" &&
          !e.defaultPrevented &&
          e.button === 0 && // Left click only
          !e.metaKey &&
          !e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey
        ) {
          const currentUrl = window.location.pathname;
          // Only transition if navigating to a different page
          if (href !== currentUrl) {
            setIsTransitioning(true);
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
    };
  }, []);

  const isAdmin = pathname?.startsWith("/admin");
  const isOwner = pathname?.startsWith("/hotel-owner");

  if (isAdmin || isOwner) {
    return (
      <div className="min-h-screen flex flex-col">
        {isTransitioning && <Loading />}
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {isTransitioning && <Loading />}
      <TopBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloatButton />
    </div>
  );
}
