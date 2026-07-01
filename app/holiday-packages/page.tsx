import type { Metadata } from "next";
import { getPackages } from "@/lib/api";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import SectionHeading from "@/components/shared/SectionHeading";
import PackageCard from "@/components/packages/PackageCard";
import PackageFilters from "@/components/packages/PackageFilters";

export const metadata: Metadata = {
  title: "Holiday Packages",
  description:
    "Explore curated holiday packages to Nepal, Goa, Shimla, Manali, Rajasthan, Kashmir and more. Affordable tour packages with hotels, meals, and transport included.",
};

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
          <p className="text-white/70 text-sm lg:text-base">
            Discover handpicked travel experiences across India and beyond
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        <Breadcrumbs items={[{ label: "Holiday Packages" }]} />

        <PackageFilters />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
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
