"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Hotel,
  LogOut,
  Globe,
  User,
  Menu,
  X,
} from "lucide-react";

export default function HotelOwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");

  const isLoginPage = pathname === "/hotel-owner/login";

  useEffect(() => {
    if (isLoginPage) return;
    const loggedIn = sessionStorage.getItem("hotelOwnerLoggedIn") === "true";
    const email = sessionStorage.getItem("hotelOwnerEmail") || "";
    if (!loggedIn) {
      router.push("/hotel-owner/login");
    } else {
      setIsAuthed(true);
      setOwnerEmail(email);
    }
  }, [router, isLoginPage]);

  const handleLogout = () => {
    sessionStorage.removeItem("hotelOwnerLoggedIn");
    sessionStorage.removeItem("hotelOwnerEmail");
    sessionStorage.removeItem("hotelOwnerId");
    router.push("/hotel-owner/login");
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
      label: "Dashboard",
      href: "/hotel-owner",
      icon: LayoutDashboard,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col lg:flex-row">
      {/* Mobile Top Bar */}
      <header className="lg:hidden h-16 bg-[#1A1A1A] border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
            <Hotel className="w-4 h-4" />
          </div>
          <span className="font-heading font-bold text-white text-base">Owner Portal</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-white/70 hover:text-white rounded-lg transition-colors"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#1A1A1A] text-white flex flex-col transform transition-transform duration-300 z-50 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="h-20 border-b border-white/5 px-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
            <Hotel className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-heading font-black text-white text-lg tracking-tight block">
              Owner Portal
            </span>
            <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">
              Hotel Dashboard
            </span>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
            <User className="w-5 h-5 text-white/70" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white block">Hotel Owner</span>
            <span className="text-[10px] text-white/40 block truncate max-w-[140px]">{ownerEmail}</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01] space-y-1.5">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <Globe className="w-4 h-4" />
            Public Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
