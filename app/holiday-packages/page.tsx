import type { Metadata } from "next";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import PackageCard from "@/components/packages/PackageCard";
import PackageFilters from "@/components/packages/PackageFilters";

export const metadata: Metadata = {
  title: "Holiday Packages",
  description:
    "Explore curated holiday packages to Nepal, Goa, Shimla, Manali, Rajasthan, Kashmir and more. Affordable tour packages with hotels, meals, and transport included.",
};

// --- API HELPER FUNCTION ---
async function getPackages() {
  try {
    // Fetch directly from your PHP backend
    // 'next: { revalidate: 60 }' caches the result for 60 seconds for faster load times
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/list.php`, {
      next: { revalidate: 60 }
    });
    const result = await res.json();
    
    if (res.ok && result.status === 'success') {
      // Map the database structure to what the React components expect
      return result.data.map((pkg: any) => ({
        ...pkg,
        slug: pkg.slug || pkg.id.toString(), // Fallback if slug isn't in DB yet
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

export default async function HolidayPackagesPage() {
  const packages = await getPackages();

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

        {/* 
          Note on Filtering: 
          If PackageFilters uses URL parameters (like ?destination=goa), 
          you can pass 'searchParams' to this page component to filter the 'packages' array 
          before passing them to the map function below.
        */}
        <PackageFilters />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg: any) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>

        {packages.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted text-lg">
              No packages found. Please check back later.
            </p>
          </div>
        )}
      </div>
    </>
  );
}