import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Users, IndianRupee, ShieldCheck, CheckCircle2, ArrowLeft, Phone, MessageCircle, CalendarClock } from "lucide-react";
import Link from "next/link";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import BanquetAmenities from "@/components/banquets/BanquetAmenities";
import BanquetBookingForm from "@/components/banquets/BanquetBookingForm";
import { CONTACT } from "@/lib/constants";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Image URL helper
const getImageUrl = (path: string) => {
  if (!path) return "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&q=80";
  if (path.startsWith("http")) return path;
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost/hr/api";
  apiUrl = apiUrl.replace(/\/$/, "");
  if (path.startsWith('/api') && apiUrl.endsWith('/api')) {
    apiUrl = apiUrl.substring(0, apiUrl.length - 4);
  }
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${apiUrl}${safePath}`;
};

async function fetchBanquetBySlug(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const endpoint = apiUrl.endsWith("/")
      ? `${apiUrl}banquets/get_catalog.php`
      : `${apiUrl}/banquets/get_catalog.php`;

    const res = await fetch(endpoint, { next: { revalidate: 30 } });
    const rawText = await res.text();
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const result = JSON.parse(match[0]);
    if (res.ok && result.status === "success" && Array.isArray(result.data)) {
      const matchBq = result.data.find(
        (b: any) =>
          String(b.id) === slug ||
          (b.slug && b.slug.toLowerCase() === slug.toLowerCase())
      );

      if (matchBq) {
        let imgs: string[] = [];
        if (Array.isArray(matchBq.images)) imgs = matchBq.images;
        else if (typeof matchBq.images === "string") {
          try { imgs = JSON.parse(matchBq.images); } catch { imgs = [matchBq.images]; }
        } else if (matchBq.image) {
          imgs = [matchBq.image];
        }

        // Add inspection photos if available
        ["hall_pic", "reception_pic", "bathroom_pic", "interior_exterior_pic", "hallPic", "receptionPic"].forEach(
          (k) => {
            if (matchBq[k] && !imgs.includes(matchBq[k])) imgs.push(matchBq[k]);
          }
        );

        return {
          ...matchBq,
          image: getImageUrl(matchBq.image || imgs[0]),
          images: imgs.map((img) => getImageUrl(img)),
        };
      }
    }
  } catch (err) {
    console.error("Error fetching banquet details:", err);
  }

  // Fallback check from mock or local
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const banquet = await fetchBanquetBySlug(slug);

  if (!banquet) return { title: "Banquet Hall Not Found" };

  return {
    title: `${banquet.name} — Banquet Booking in ${banquet.city || "India"}`,
    description: banquet.description || `Book ${banquet.name} for weddings, receptions, and corporate events with HR Trips.`,
  };
}

export default async function BanquetDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const banquet = await fetchBanquetBySlug(slug);

  if (!banquet) {
    notFound();
  }

  // Safely extract pricing fields
  const vegRate = Number(banquet.price_per_plate_veg ?? banquet.pricePerPlateVeg ?? 0);
  const nonVegRate = Number(banquet.price_per_plate_non_veg ?? banquet.pricePerPlateNonVeg ?? 0);
  const perDayRate = Number(banquet.price_per_day ?? banquet.pricePerDay ?? 0);
  const capacity = Number(banquet.capacity || 500);

  return (
    <>
      {/* Hero Banner */}
      <div className="relative h-72 sm:h-96 flex items-end overflow-hidden bg-surface">
        <img
          src={banquet.image}
          alt={banquet.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="container-wide relative z-10 pb-8 text-white">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/30 border border-primary/40 backdrop-blur-md rounded-full text-xs font-bold text-primary-light">
              <Users className="w-3.5 h-3.5" /> Seating Capacity: {capacity} Guests
            </div>
            {perDayRate > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/80 border border-amber-400/50 backdrop-blur-md rounded-full text-xs font-bold text-white">
                <CalendarClock className="w-3.5 h-3.5" /> 
                Rent: <IndianRupee className="w-3 h-3 -mr-1" /> {perDayRate.toLocaleString("en-IN")} / Day
              </div>
            )}
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-2">
            {banquet.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              {banquet.address ? `${banquet.address}, ${banquet.city}` : banquet.location || banquet.city}
            </span>
            {banquet.location && banquet.location.startsWith("http") && (
              <a
                href={banquet.location}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-light hover:underline font-semibold"
              >
                View on Google Maps
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="container-wide py-6">
        <Breadcrumbs
          items={[
            { label: "Services", href: "/services" },
            { label: "Banquet Booking", href: "/banquet-booking" },
            { label: banquet.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery Strip */}
            {banquet.images && banquet.images.length > 1 && (
              <div className="space-y-3">
                <h3 className="font-heading font-bold text-base text-ink">Venue Photos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {banquet.images.slice(0, 4).map((img: string, i: number) => (
                    <div key={i} className="h-28 rounded-2xl overflow-hidden border border-border bg-surface group">
                      <img
                        src={img}
                        alt={`${banquet.name} photo ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overview & Description */}
            <div className="bg-white rounded-3xl border border-border/50 p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="font-heading font-bold text-xl text-ink">
                About this Venue
              </h2>
              <p className="text-muted text-sm leading-relaxed whitespace-pre-line">
                {banquet.description ||
                  `${banquet.name} is one of the most sought-after banquet halls in ${banquet.city || "the city"}, featuring grand celebration spaces, air-conditioned halls, customized catering, and ample parking space for marriage and reception ceremonies.`}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/40 text-xs">
                <div className="p-3 bg-surface rounded-xl flex flex-col justify-center">
                  <span className="text-muted block text-[10px] uppercase font-bold">Hall Capacity</span>
                  <span className="font-bold text-ink text-sm mt-0.5 block">{capacity} Guests</span>
                </div>
                
                {/* Highlighted Per Day Charge */}
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex flex-col justify-center">
                  <span className="text-primary block text-[10px] uppercase font-bold">Per Day Rent</span>
                  <span className="font-bold text-primary text-sm mt-0.5 flex items-center">
                    {perDayRate > 0 ? (
                      <><IndianRupee className="w-3.5 h-3.5 mr-0.5" />{perDayRate.toLocaleString("en-IN")}</>
                    ) : "On Request"}
                  </span>
                </div>

                <div className="p-3 bg-surface rounded-xl flex flex-col justify-center">
                  <span className="text-muted block text-[10px] uppercase font-bold">Veg Catering</span>
                  <span className="font-bold text-ink text-sm mt-0.5 flex items-center">
                    <IndianRupee className="w-3.5 h-3.5 mr-0.5" />{vegRate} <span className="text-[10px] font-normal text-muted ml-1">/ plate</span>
                  </span>
                </div>

                <div className="p-3 bg-surface rounded-xl flex flex-col justify-center">
                  <span className="text-muted block text-[10px] uppercase font-bold">Non-Veg Catering</span>
                  <span className="font-bold text-ink text-sm mt-0.5 flex items-center">
                    {nonVegRate > 0 ? (
                      <><IndianRupee className="w-3.5 h-3.5 mr-0.5" />{nonVegRate} <span className="text-[10px] font-normal text-muted ml-1">/ plate</span></>
                    ) : "On Request"}
                  </span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-3xl border border-border/50 p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="font-heading font-bold text-xl text-ink">
                Venue Amenities & Facilities
              </h2>
              <BanquetAmenities amenities={banquet.amenities} />
            </div>

            {/* Support Box */}
            <div className="bg-primary/5 rounded-3xl p-6 sm:p-8 border border-primary/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="font-heading font-bold text-lg text-ink">
                  Have Questions or Need an In-Person Hall Tour?
                </h3>
                <p className="text-muted text-xs mt-1">
                  Connect directly with our venue booking managers for multi-day wedding packages.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <a
                  href={CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
                <a
                  href={`tel:${CONTACT.phone}`}
                  className="px-5 py-2.5 bg-white border border-border hover:border-primary text-ink text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4" /> Call Manager
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BanquetBookingForm banquet={banquet} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}