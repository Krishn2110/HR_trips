import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MapPin, ArrowLeft } from "lucide-react";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import PackageHighlights from "@/components/packages/PackageHighlights";
import PackageItinerary from "@/components/packages/PackageItinerary";
import PriceTable from "@/components/packages/PriceTable";
import PackageEnquiryForm from "@/components/packages/PackageEnquiryForm";
import PackageCard from "@/components/packages/PackageCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// --- API HELPER FUNCTIONS FOR SERVER COMPONENT ---
async function getPackages() {
  try {
    // Fetch directly from your PHP backend
    // 'next: { revalidate: 60 }' tells Next.js to cache the result for 60 seconds
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/list.php`, {
      next: { revalidate: 60 }
    });
    const result = await res.json();
    
    if (res.ok && result.status === 'success') {
      // Map the database structure to what the React components expect
      return result.data.map((pkg: any) => ({
        ...pkg,
        // If your DB doesn't have a slug, fall back to the ID
        slug: pkg.slug || pkg.id.toString(), 
        // Fallback for gallery if the DB only has one image column right now
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

async function getPackageBySlug(slug: string) {
  const packages = await getPackages();
  // Find the package where either the slug or ID matches the URL parameter
  return packages.find((p: any) => p.slug === slug || p.id.toString() === slug) || null;
}
// ------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  
  if (!pkg) return { title: "Package Not Found" };
  
  return {
    title: pkg.title,
    description: pkg.overview ? pkg.overview.substring(0, 160) : "Holiday Package",
    openGraph: {
      title: pkg.title,
      description: pkg.overview ? pkg.overview.substring(0, 160) : "Holiday Package",
      images: [{ url: pkg.image }],
    },
  };
}

export default async function PackageDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  // 1. Fetch specific package details
  const pkg = await getPackageBySlug(slug);
  if (!pkg) notFound();

  // 2. Fetch all packages to display "Related packages"
  const allPackages = await getPackages();
  const related = allPackages
    .filter((p: any) => p.slug !== pkg.slug && p.id !== pkg.id)
    .slice(0, 3);

  return (
    <>
      {/* Hero */}
      <div className="relative h-72 lg:h-96 flex items-end overflow-hidden">
        <Image
          src={`${process.env.NEXT_PUBLIC_API_URL}/../`+pkg.image}
          alt={pkg.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className="container-wide relative z-10 pb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {pkg.duration}
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {pkg.destination}
            </span>
          </div>
          <h1 
            style={{ color: '#ffffff' }}
            className="font-heading text-3xl lg:text-5xl font-bold !text-white"
          >
            {pkg.title}
          </h1>
        </div>
      </div>

      <div className="container-wide py-8">
        <Breadcrumbs
          items={[
            { label: "Holiday Packages", href: "/holiday-packages" },
            { label: pkg.title },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Main Content — 2 cols */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div>
              <h2 className="font-heading font-semibold text-ink text-xl mb-3">
                Overview
              </h2>
              <p className="text-muted text-sm leading-relaxed whitespace-pre-line">
                {pkg.overview}
              </p>
            </div>

            {/* Highlights */}
            {pkg.highlights?.length > 0 && (
              <PackageHighlights highlights={pkg.highlights} />
            )}

            {/* Places Covered */}
            {pkg.placesCovered?.length > 0 && (
              <div>
                <h3 className="font-heading font-semibold text-ink text-lg mb-4">
                  Places Covered
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {pkg.placesCovered.map((place: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-4 py-3 bg-surface rounded-xl text-sm text-ink/80"
                    >
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      {place}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            {pkg.pricing?.length > 0 && <PriceTable pricing={pkg.pricing} />}

            {/* Itinerary */}
            {pkg.itinerary?.length > 0 && (
              <PackageItinerary itinerary={pkg.itinerary} />
            )}

            {/* Image Gallery */}
            {pkg.images?.length > 1 && (
              <div>
                <h3 className="font-heading font-semibold text-ink text-lg mb-4">
                  Gallery
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {pkg.images.map((img: string, index: number) => (
                    <div
                      key={index}
                      className="relative h-40 rounded-xl overflow-hidden img-zoom"
                    >
                      <Image
                        src={img}
                        alt={`${pkg.title} - ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — Enquiry Form (sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <PackageEnquiryForm
                packageId={pkg.id}
                packageTitle={pkg.title}
                pricing={pkg.pricing}
              />

              <div className="mt-4 p-4 bg-surface rounded-xl text-center">
                <p className="text-muted text-xs mb-2">
                  Need help? Call us directly
                </p>
                <a
                  href="tel:7992481351"
                  className="font-heading font-bold text-lg text-primary hover:underline"
                >
                  7992481351
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Packages */}
        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-border">
            <h2 className="font-heading font-semibold text-ink text-2xl mb-8 text-center">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p: any) => (
                <PackageCard key={p.id} pkg={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}