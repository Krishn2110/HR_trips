import type { Metadata } from "next";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import PackageCard from "@/components/packages/PackageCard";
import PackageFilters from "@/components/packages/PackageFilters";

export const metadata: Metadata = {
  title: "Holiday Packages",
  description:
    "Explore curated holiday packages to Nepal, Goa, Shimla, Manali, Rajasthan, Kashmir and more. Affordable tour packages with hotels, meals, and transport included.",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

// --- API HELPER FUNCTION ---
async function getPackages() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/list.php`, {
      next: { revalidate: 60 }
    });
    const result = await res.json();
    
    if (res.ok && result.status === 'success') {
      return result.data.map((pkg: any) => ({
        ...pkg,
        slug: pkg.slug || pkg.id.toString(),
        images: pkg.images || (pkg.image ? [pkg.image] : []),
        overview: pkg.overview || "",
        highlights: pkg.highlights || [],
        placesCovered: pkg.placesCovered || [],
        pricing: pkg.pricing || [],
        itinerary: pkg.itinerary || []
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    return [];
  }
}
// ----------------------------

export default async function HolidayPackagesPage({ searchParams }: PageProps) {
  const packages = await getPackages();
  const params = await searchParams; // Wait for search parameters (Next.js 15 required)

  // --- SERVER-SIDE FILTERING LOGIC ---
  let filteredPackages = packages;

  if (params.destination) {
    filteredPackages = filteredPackages.filter((pkg: any) => 
      pkg.destination.toLowerCase().includes(params.destination!.toLowerCase())
    );
  }

  if (params.search) {
    filteredPackages = filteredPackages.filter((pkg: any) => 
      pkg.title.toLowerCase().includes(params.search!.toLowerCase()) ||
      pkg.destination.toLowerCase().includes(params.search!.toLowerCase())
    );
  }

  if (params.duration) {
    const dur = parseInt(params.duration);
    filteredPackages = filteredPackages.filter((pkg: any) => {
      const nights = pkg.nights || 0;
      if (dur === 3) return nights <= 3;
      if (dur === 5) return nights > 3 && nights <= 5;
      if (dur === 7) return nights > 5 && nights <= 7;
      if (dur === 10) return nights > 7;
      return true;
    });
  }

  if (params.budget) {
    const budget = parseInt(params.budget);
    filteredPackages = filteredPackages.filter((pkg: any) => {
      const price = pkg.startingPrice || 0;
      if (budget === 7000) return price <= 7000;
      if (budget === 10000) return price > 7000 && price <= 10000;
      if (budget === 15000) return price > 10000 && price <= 15000;
      if (budget === 999999) return price > 15000;
      return true;
    });
  }
  // -----------------------------------

  return (
    <>
      {/* Hero Banner */}
      <div className="relative h-52 lg:h-64 flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        </div>
        <div className="container-wide relative z-10 pb-8">
          <h1 
            style={{ color: '#ffffff' }}
            className="font-heading text-3xl lg:text-4xl font-bold !text-white mb-1"
          >
            Holiday Packages
          </h1>
          <p 
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            className="text-sm lg:text-base !text-white/80"
          >
            Discover handpicked travel experiences across India and beyond
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        <Breadcrumbs items={[{ label: "Holiday Packages" }]} />

        {/* The Filter Component automatically handles URL updates */}
        <PackageFilters />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg: any) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>

        {filteredPackages.length === 0 && (
          <div className="text-center py-20 border border-dashed border-border mt-8 rounded-2xl">
            <p className="text-muted text-lg font-medium">
              No packages found matching your filters.
            </p>
            <p className="text-xs text-muted/70 mt-2">Try adjusting your budget or destination.</p>
          </div>
        )}
      </div>
    </>
  );
}