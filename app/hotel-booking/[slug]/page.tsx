import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Star, MapPin, ShieldCheck } from "lucide-react";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HotelAmenities from "@/components/hotels/HotelAmenities";
import RoomTypeSelector from "@/components/hotels/RoomTypeSelector";
import HotelBookingForm from "@/components/hotels/HotelBookingForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ---------------------------------------------------------
// BULLETPROOF IMAGE URL HELPER
// ---------------------------------------------------------
const getImageUrl = (path: string) => {
  if (!path) return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80"; // Fallback image
  if (path.startsWith("http")) return path; 
  
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost/hr/api";
  apiUrl = apiUrl.replace(/\/$/, ""); 

  if (path.startsWith('/api') && apiUrl.endsWith('/api')) {
    apiUrl = apiUrl.substring(0, apiUrl.length - 4);
  }
  
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${apiUrl}${safePath}`;
};
// ---------------------------------------------------------

// --- API HELPER: FETCH SINGLE HOTEL ---
async function fetchHotelBySlug(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/get_hotel.php?id=${slug}`, {
      next: { revalidate: 0 } // Change to 60 in production for caching
    });
    
    const result = await res.json();
    
    if (res.ok && result.status === 'success') {
      const h = result.data;
      
      // Format all images safely before returning
      return {
        ...h,
        image: getImageUrl(h.image),
        images: h.images.map((img: string) => getImageUrl(img)),
        roomTypes: h.roomTypes.map((room: any) => ({
          ...room,
          image: getImageUrl(room.image)
        }))
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch hotel details:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await fetchHotelBySlug(slug);
  
  if (!hotel) return { title: "Hotel Not Found" };
  
  return {
    title: `${hotel.name} — ${hotel.city}`,
    description: hotel.overview ? hotel.overview.substring(0, 160) : "Book this premium hotel.",
    openGraph: {
      title: `${hotel.name} — ${hotel.city}`,
      description: hotel.overview ? hotel.overview.substring(0, 160) : "Book this premium hotel.",
      images: [{ url: hotel.image }],
    },
  };
}

export default async function HotelDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Fetch real data
  const hotel = await fetchHotelBySlug(slug);
  if (!hotel) notFound();

  return (
    <>
      {/* Hero */}
      <div className="relative h-72 lg:h-96 flex items-end overflow-hidden bg-surface">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className="container-wide relative z-10 pb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1">
              {Array.from({ length: hotel.starRating || 3 }).map((_, i) => (
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
          <p 
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            className="text-sm mt-1 !text-white/80"
          >
            {hotel.location}
          </p>
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
              <p className="text-muted text-sm leading-relaxed whitespace-pre-line">
                {hotel.overview || "No description provided."}
              </p>
            </div>

            {/* Image Gallery */}
            {hotel.images && hotel.images.length > 0 && (
              <div>
                <h3 className="font-heading font-semibold text-ink text-lg mb-4">
                  Gallery
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {hotel.images.slice(0, 6).map((img: string, index: number) => (
                    <div
                      key={index}
                      className="relative h-40 rounded-xl overflow-hidden img-zoom bg-surface"
                    >
                      <img
                        src={img}
                        alt={`${hotel.name} gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <HotelAmenities amenities={hotel.amenities} />
            )}

            {/* Room Types */}
            {hotel.roomTypes && hotel.roomTypes.length > 0 && (
              <RoomTypeSelector rooms={hotel.roomTypes} />
            )}

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
                roomTypes={hotel.roomTypes.map((r: any) => ({
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