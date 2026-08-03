"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  GlassWater,
  LogOut,
  Globe,
  User,
  Menu,
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";

export default function BanquetOwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");

  const isLoginPage = pathname === "/banquet-owner/login";

  useEffect(() => {
    if (isLoginPage) return;
    const loggedIn = sessionStorage.getItem("banquetOwnerLoggedIn") === "true";
    const email = sessionStorage.getItem("banquetOwnerEmail") || "";
    if (!loggedIn) {
      router.push("/banquet-owner/login");
    } else {
      setIsAuthed(true);
      setOwnerEmail(email);
    }
  }, [router, isLoginPage]);

  const handleLogout = () => {
    sessionStorage.removeItem("banquetOwnerLoggedIn");
    sessionStorage.removeItem("banquetOwnerEmail");
    sessionStorage.removeItem("banquetOwnerId");
    router.push("/banquet-owner/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-muted text-sm font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      label: "Banquet Venue & Status",
      href: "/banquet-owner",
      icon: LayoutDashboard,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col lg:flex-row">
      {/* Mobile Top Bar */}
      <header className="lg:hidden h-16 bg-[#1A1A1A] border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="HR Trips Logo" className="w-8 h-8 object-contain rounded-lg bg-white p-0.5" />
          <span className="font-heading font-bold text-white text-base">Banquet Owner Portal</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-white/70 hover:text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-[#1A1A1A] text-white flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="h-20 px-6 border-b border-white/5 flex items-center gap-3">
            <img src="/logo.png" alt="HR Trips Logo" className="w-10 h-10 object-contain rounded-xl shadow-md bg-white p-1 shrink-0" />
            <div>
              <div className="font-heading font-black text-white text-base tracking-wide flex items-center gap-1.5">
                HR Trips <span className="text-[10px] font-semibold text-primary px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded">Banquet</span>
              </div>
              <p className="text-[11px] text-white/40 truncate max-w-[170px]">{ownerEmail}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/25 font-bold"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link
            href="/banquet-booking"
            className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
          >
            <Globe className="w-4 h-4" />
            <span>Public Banquet Booking</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
