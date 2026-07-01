"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Palmtree, 
  Globe, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X, 
  User,
  Hotel,
  Car,
  GlassWater,
  Sparkles,
  Utensils,
  Ticket,
  Briefcase
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  // Check auth status on mount
  useEffect(() => {
    if (isLoginPage) return;
    const isLoggedIn = sessionStorage.getItem("isAdminLoggedIn") === "true";
    if (!isLoggedIn) {
      router.push("/admin/login");
    } else {
      setIsAuthed(true);
    }
  }, [router, isLoginPage]);

  const handleLogout = () => {
    sessionStorage.removeItem("isAdminLoggedIn");
    router.push("/admin/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Packages",
      href: "/admin/packages",
      icon: Palmtree,
    },
    {
      label: "Hotels",
      href: "/admin/hotels",
      icon: Hotel,
    },
    {
      label: "Cabs",
      href: "/admin/cabs",
      icon: Car,
    },
    {
      label: "Banquets",
      href: "/admin/banquets",
      icon: GlassWater,
    },
    {
      label: "Events",
      href: "/admin/events",
      icon: Sparkles,
    },
    {
      label: "Catering",
      href: "/admin/catering",
      icon: Utensils,
    },
    {
      label: "Ticketing",
      href: "/admin/ticketing",
      icon: Ticket,
    },
    {
      label: "Manpower",
      href: "/admin/manpower",
      icon: Briefcase,
    },
  ];

  // If we are on the login page, render children directly without dashboard container
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

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col lg:flex-row">
      {/* Mobile Top Bar */}
      <header className="lg:hidden h-16 bg-[#1A1A1A] border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
            HR
          </div>
          <span className="font-heading font-bold text-white text-base">Admin Panel</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-white/70 hover:text-white rounded-lg transition-colors"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#1A1A1A] text-white flex flex-col transform transition-transform duration-300 z-50 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand logo */}
        <div className="h-20 border-b border-white/5 px-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-black text-lg">
            HR
          </div>
          <div>
            <span className="font-heading font-black text-white text-lg tracking-tight block">
              HR Trips
            </span>
            <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">
              Management Portal
            </span>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
            <User className="w-5 h-5 text-white/70" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white block">HR Administrator</span>
            <span className="text-[10px] text-green-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Session Active
            </span>
          </div>
        </div>

        {/* Nav links */}
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

        {/* Footer actions */}
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
            Logout Session
          </button>
        </div>
      </aside>

      {/* Overlay backdrop on mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Main dashboard content area */}
      <main className="flex-1 overflow-y-auto h-screen p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
