import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MapPin, ArrowLeft } from "lucide-react";
import { getPackageBySlug, getPackages } from "@/lib/api";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import PackageHighlights from "@/components/packages/PackageHighlights";
import PackageItinerary from "@/components/packages/PackageItinerary";
import PriceTable from "@/components/packages/PriceTable";
import PackageEnquiryForm from "@/components/packages/PackageEnquiryForm";
import PackageCard from "@/components/packages/PackageCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) return { title: "Package Not Found" };
  return {
    title: pkg.title,
    description: pkg.overview.substring(0, 160),
    openGraph: {
      title: pkg.title,
      description: pkg.overview.substring(0, 160),
      images: [{ url: pkg.image }],
    },
  };
}

export default async function PackageDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) notFound();

  // Related packages (same category, exclude current)
  const allPackages = await getPackages();
  const related = allPackages
    .filter((p) => p.slug !== pkg.slug)
    .slice(0, 3);

  return (
    <>
      {/* Hero */}
      <div className="relative h-72 lg:h-96 flex items-end overflow-hidden">
        <Image
          src={pkg.image}
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
              <p className="text-muted text-sm leading-relaxed">
                {pkg.overview}
              </p>
            </div>

            {/* Highlights */}
            {pkg.highlights.length > 0 && (
              <PackageHighlights highlights={pkg.highlights} />
            )}

            {/* Places Covered */}
            {pkg.placesCovered.length > 0 && (
              <div>
                <h3 className="font-heading font-semibold text-ink text-lg mb-4">
                  Places Covered
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {pkg.placesCovered.map((place, index) => (
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
            {pkg.pricing.length > 0 && <PriceTable pricing={pkg.pricing} />}

            {/* Itinerary */}
            {pkg.itinerary.length > 0 && (
              <PackageItinerary itinerary={pkg.itinerary} />
            )}

            {/* Image Gallery */}
            {pkg.images.length > 1 && (
              <div>
                <h3 className="font-heading font-semibold text-ink text-lg mb-4">
                  Gallery
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {pkg.images.map((img, index) => (
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
              {related.map((p) => (
                <PackageCard key={p.id} pkg={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
