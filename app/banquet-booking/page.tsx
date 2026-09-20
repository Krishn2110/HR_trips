import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import BanquetCard from "@/components/banquets/BanquetCard";
import BanquetSearchBar from "@/components/banquets/BanquetSearchBar";
import { GlassWater, ArrowRight, UserCheck, ShieldCheck, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Banquet Hall Booking",
  description:
    "Find and book luxury banquet halls, marriage lawns, and party venues for weddings, receptions, and corporate events across India with HR Trips.",
};

const getImageUrl = (path: string) => {
  if (!path) return "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80";
  if (path.startsWith("http")) return path;
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost/hr/api";
  apiUrl = apiUrl.replace(/\/$/, "");
  if (path.startsWith('/api') && apiUrl.endsWith('/api')) {
    apiUrl = apiUrl.substring(0, apiUrl.length - 4);
  }
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${apiUrl}${safePath}`;
};

async function getApprovedBanquets() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const endpoint = apiUrl.endsWith("/")
      ? `${apiUrl}banquets/get_catalog.php`
      : `${apiUrl}/banquets/get_catalog.php`;

    const res = await fetch(endpoint, {
      next: { revalidate: 60 },
    });

    const rawText = await res.text();
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) return [];

    const result = JSON.parse(match[0]);
    if (res.ok && result.status === "success" && Array.isArray(result.data)) {
      // Return only approved banquets
      const approved = result.data.filter((b: any) => Number(b.is_approved) === 1);
      return approved.map((b: any) => ({
        ...b,
        slug: b.slug || b.id.toString(),
        image: getImageUrl(b.image || (Array.isArray(b.images) ? b.images[0] : b.images)),
      }));
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch approved banquets:", err);
    return [];
  }
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BanquetBookingPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const searchQuery = (resolvedSearchParams?.query as string) || "";
  const locationQuery = (resolvedSearchParams?.location as string) || "";
  const capacityQuery = (resolvedSearchParams?.capacity as string) || "";

  let banquets = await getApprovedBanquets();

  if (searchQuery || locationQuery || capacityQuery) {
    banquets = banquets.filter((b: any) => {
      const matchesName = b.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = b.city?.toLowerCase().includes(locationQuery.toLowerCase()) ||
                          b.state?.toLowerCase().includes(locationQuery.toLowerCase()) ||
                          b.location?.toLowerCase().includes(locationQuery.toLowerCase());
      const matchesCapacity = capacityQuery ? Number(b.capacity || 0) >= Number(capacityQuery) : true;

      if (searchQuery && locationQuery) {
        return matchesName && matchesCity && matchesCapacity;
      }
      if (searchQuery) return matchesName && matchesCapacity;
      if (locationQuery) return matchesCity && matchesCapacity;
      return matchesCapacity;
    });
  }

  return (
    <>
      {/* Hero Banner */}
      <div className="relative h-60 sm:h-72 flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=85')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        </div>
        <div className="container-wide relative z-10 pb-12">
          <h1
            style={{ color: "#ffffff" }}
            className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold !text-white mb-2"
          >
            Banquet Booking & Venues
          </h1>
          <p
            style={{ color: "rgba(255, 255, 255, 0.85)" }}
            className="text-sm sm:text-base max-w-2xl !text-white/85"
          >
            Find and book air-conditioned luxury banquet halls and wedding lawns with verified catering and stage decoration.
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        <Breadcrumbs items={[{ label: "Services", href: "/services" }, { label: "Banquet Booking" }]} />

        {/* Search Bar */}
        <BanquetSearchBar />

        {/* Venues Grid */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-ink">
                Verified Banquet Halls
              </h2>
              <p className="text-muted text-xs mt-0.5">
                Showing {banquets.length} active venue{banquets.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {banquets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {banquets.map((banquet: any) => (
                <BanquetCard key={banquet.id} banquet={banquet} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-surface/60 rounded-3xl border border-dashed border-border mt-4 p-8 space-y-3">
              <GlassWater className="w-12 h-12 text-muted/60 mx-auto" />
              <h3 className="font-heading font-bold text-lg text-ink">
                No banquet venues found matching your criteria.
              </h3>
              <p className="text-muted text-xs max-w-sm mx-auto">
                Try adjusting your search location or guest capacity filters.
              </p>
              <Link
                href="/banquet-booking"
                className="inline-block px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl transition-colors"
              >
                Reset Filters
              </Link>
            </div>
          )}
        </div>

        {/* Banquet Owner Registration CTA Banner */}
        <div className="mt-16 bg-gradient-to-r from-[#1A1A1A] via-[#262626] to-[#1A1A1A] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-white/10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-xs font-bold text-primary">
              <GlassWater className="w-3.5 h-3.5" /> PARTNER NETWORK
            </div>
            <h3
              style={{ color: "#ffffff" }}
              className="font-heading font-black text-2xl sm:text-3xl !text-white"
            >
              Are You a Banquet Hall or Lawn Owner?
            </h3>
            <p
              style={{ color: "rgba(255, 255, 255, 0.85)" }}
              className="text-xs sm:text-sm !text-white/85 leading-relaxed"
            >
              Partner your banquet hall with HR Trips. Get listed on our portal, manage client inquiries, and view confirmed event bookings on your personalized Owner Dashboard.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/banquet-registration"
                className="px-6 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl text-xs hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center gap-2"
              >
                Register Your Banquet Hall <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/banquet-owner/login"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl text-xs transition-colors flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" /> Banquet Owner Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
