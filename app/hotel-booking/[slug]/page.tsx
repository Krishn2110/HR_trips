import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, MapPin, ShieldCheck } from "lucide-react";
import { getHotelBySlug } from "@/lib/api";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HotelAmenities from "@/components/hotels/HotelAmenities";
import RoomTypeSelector from "@/components/hotels/RoomTypeSelector";
import HotelBookingForm from "@/components/hotels/HotelBookingForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) return { title: "Hotel Not Found" };
  return {
    title: `${hotel.name} — ${hotel.city}`,
    description: hotel.overview.substring(0, 160),
    openGraph: {
      title: `${hotel.name} — ${hotel.city}`,
      description: hotel.overview.substring(0, 160),
      images: [{ url: hotel.image }],
    },
  };
}

export default async function HotelDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) notFound();

  return (
    <>
      {/* Hero */}
      <div className="relative h-72 lg:h-96 flex items-end overflow-hidden">
        <Image
          src={hotel.image}
          alt={hotel.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className="container-wide relative z-10 pb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ))}
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {hotel.city}
            </span>
          </div>
          <h1 
            style={{ color: '#ffffff' }}
            className="font-heading text-3xl lg:text-5xl font-bold !text-white"
          >
            {hotel.name}
          </h1>
          <p className="text-white/70 text-sm mt-1">{hotel.location}</p>
        </div>
      </div>

      <div className="container-wide py-8">
        <Breadcrumbs
          items={[
            { label: "Hotel Booking", href: "/hotel-booking" },
            { label: hotel.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div>
              <h2 className="font-heading font-semibold text-ink text-xl mb-3">
                About This Hotel
              </h2>
              <p className="text-muted text-sm leading-relaxed">
                {hotel.overview}
              </p>
            </div>

            {/* Image Gallery */}
            {hotel.images.length > 1 && (
              <div>
                <h3 className="font-heading font-semibold text-ink text-lg mb-4">
                  Gallery
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {hotel.images.map((img, index) => (
                    <div
                      key={index}
                      className="relative h-40 rounded-xl overflow-hidden img-zoom"
                    >
                      <Image
                        src={img}
                        alt={`${hotel.name} - ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            <HotelAmenities amenities={hotel.amenities} />

            {/* Room Types */}
            <RoomTypeSelector rooms={hotel.roomTypes} />

            {/* Cancellation Policy */}
            <div className="bg-surface rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-semibold text-ink text-lg">
                  Cancellation Policy
                </h3>
              </div>
              <p className="text-muted text-sm leading-relaxed">
                {hotel.cancellationPolicy}
              </p>
            </div>
          </div>

          {/* Sidebar — Booking Form (sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <HotelBookingForm
                hotelId={hotel.id}
                hotelName={hotel.name}
                roomTypes={hotel.roomTypes.map((r) => ({
                  name: r.name,
                  pricePerNight: r.pricePerNight,
                }))}
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
      </div>
    </>
  );
}
