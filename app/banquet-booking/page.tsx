import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import BanquetCard from "@/components/banquets/BanquetCard";
import BanquetSearchBar from "@/components/banquets/BanquetSearchBar";
import { GlassWater, ArrowRight, UserCheck, Sparkles, MapPin, Users, IndianRupee } from "lucide-react";

export const metadata: Metadata = {
  title: "Banquet Hall Booking",
  description:
    "Find and book luxury banquet halls, marriage lawns, and party venues for weddings, receptions, and corporate events across India with HR Trips.",
};

// 1. ROBUST IMAGE URL HELPER
const getImageUrl = (path: string) => {
  if (!path) return "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80";
  if (path.startsWith("http") || path.startsWith("data:")) return path; 
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost/hr/api";
  const baseUrl = apiUrl;
  
  return `${baseUrl}/${path.replace(/^\//, "")}`;
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
      
      return approved.map((b: any) => {
        // EXTRACT IMAGE SAFELY
        let imagePath = "";
        if (b.hall_pic) {
            imagePath = b.hall_pic;
        } else if (b.images) {
            try {
                const parsed = typeof b.images === "string" ? JSON.parse(b.images) : b.images;
                if (Array.isArray(parsed) && parsed.length > 0) {
                    imagePath = parsed[0];
                } else if (typeof b.images === "string") {
                    imagePath = b.images;
                }
            } catch {
                imagePath = b.images;
            }
        } else if (b.image) {
            imagePath = b.image;
        }

        // MAP ALL PRICING AND DATA FIELDS
        return {
          ...b,
          slug: b.slug || b.id.toString(),
          image: getImageUrl(imagePath),
          pricePerPlateVeg: b.price_per_plate_veg || b.pricePerPlateVeg || 0,
          pricePerPlateNonVeg: b.price_per_plate_non_veg || b.pricePerPlateNonVeg || 0,
          pricePerDay: b.price_per_day || b.pricePerDay || 0,
          capacity: b.capacity || 0,
          featured: b.featured == 1 || b.featured === "1" || b.featured === true,
          description: b.description || "",
        };
      });
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
                          b.location?.toLowerCase().includes(locationQuery.toLowerCase()) ||
                          b.address?.toLowerCase().includes(locationQuery.toLowerCase());
                          
      const matchesCapacity = capacityQuery ? Number(b.capacity || 0) >= Number(capacityQuery) : true;

      const isNameMatch = searchQuery ? matchesName : true;
      const isLocMatch = locationQuery ? matchesCity : true;

      return isNameMatch && isLocMatch && matchesCapacity;
    });
  }

  // Separate Featured / Highlighted banquets from standard ones
  const featuredBanquets = banquets.filter((b: any) => b.featured);
  const standardBanquets = banquets.filter((b: any) => !b.featured);

  return (
    <>
      {/* Hero Banner */}
      <div className="relative h-60 sm:h-72 flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=85')" }}
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

        <div className="mt-10">
          {/* ================= HIGHLIGHTED / FEATURED SECTION ================= */}
          {featuredBanquets.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-amber-500" />
                <h2 className="font-heading font-bold text-xl sm:text-2xl text-ink">
                  Highlighted Premium Venues
                </h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {featuredBanquets.map((banquet: any) => (
                  <Link href={`/banquet-booking/${banquet.slug}`} key={banquet.id} className="group block bg-gradient-to-br from-amber-50 to-white border border-amber-200/60 rounded-3xl overflow-hidden shadow-lg shadow-amber-900/5 hover:shadow-xl hover:shadow-amber-900/10 transition-all">
                    <div className="flex flex-col sm:flex-row h-full">
                      {/* Image */}
                      <div className="relative w-full sm:w-2/5 h-48 sm:h-auto shrink-0 overflow-hidden">
                        <img src={banquet.image} alt={banquet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                          Featured
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-heading font-bold text-xl text-ink group-hover:text-primary transition-colors line-clamp-1">
                            {banquet.name}
                          </h3>
                          <p className="text-muted text-xs flex items-center gap-1 mt-1.5 line-clamp-1">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> {banquet.city}, {banquet.state}
                          </p>
                          <p className="text-xs text-ink/70 mt-3 line-clamp-2 leading-relaxed">
                            {banquet.description || "Premium air-conditioned banquet hall perfect for weddings, corporate events, and grand celebrations."}
                          </p>
                        </div>
                        
                        <div className="mt-5 pt-4 border-t border-amber-200/50 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                            <Users className="w-4 h-4 text-primary" /> {banquet.capacity} Guests
                          </div>
                          
                          {/* HIGHLIGHTED PER DAY CHARGES */}
                          <div className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold shadow-sm">
                            <IndianRupee className="w-4 h-4" /> 
                            {banquet.pricePerDay > 0 ? (
                              <span className="text-sm">{Number(banquet.pricePerDay).toLocaleString("en-IN")} <span className="text-[10px] font-semibold text-primary/70">/ Day Rent</span></span>
                            ) : (
                              <span className="text-sm">Price on Request</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ================= REGULAR VENUES GRID ================= */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-ink">
                All Verified Banquet Halls
              </h2>
              <p className="text-muted text-xs mt-0.5">
                Showing {banquets.length} active venue{banquets.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {banquets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Map all non-featured standard banquets */}
              {(standardBanquets.length > 0 ? standardBanquets : banquets).map((banquet: any) => (
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