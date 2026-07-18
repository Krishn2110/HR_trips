import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HotelCard from "@/components/hotels/HotelCard";
import HotelSearchBar from "@/components/hotels/HotelSearchBar";

export const metadata: Metadata = {
  title: "Hotel Booking",
  description:
    "Book premium hotels across India at the best rates. Search hotels in Patna, Goa, Shimla, Udaipur, and more with flexible cancellation and instant confirmation.",
};

// ---------------------------------------------------------
// BULLETPROOF IMAGE URL HELPER
// ---------------------------------------------------------
const getImageUrl = (path: string) => {
  if (!path) return "";
  // If it's already an external/absolute URL (like unsplash), just return it
  if (path.startsWith("http")) return path; 
  
  // Get base URL, fallback to localhost if env fails
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost/hr/api";
  apiUrl = apiUrl.replace(/\/$/, ""); // Remove trailing slash if present

  // If the path from DB starts with '/api', and your apiUrl ends with '/api',
  // we remove the '/api' from the base URL so it doesn't duplicate.
  if (path.startsWith('/api') && apiUrl.endsWith('/api')) {
    apiUrl = apiUrl.substring(0, apiUrl.length - 4);
  }
  
  // Ensure the path starts with a slash
  const safePath = path.startsWith("/") ? path : `/${path}`;
  
  return `${apiUrl}${safePath}`;
};
// ---------------------------------------------------------

// --- API HELPER: FETCH APPROVED HOTELS ---
async function getApprovedHotels() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/list_approved.php`, {
      next: { revalidate: 60 } // Automatically refreshes cache every 60 seconds
    });
    
    const rawText = await res.text();
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON object found in response");
    }
    const jsonText = rawText.substring(firstBrace, lastBrace + 1);
    const result = JSON.parse(jsonText);
    
    if (res.ok && result.status === 'success') {
      // Map through the data to fix the image URLs, add slugs, and append city to location
      return result.data.map((hotel: any) => ({
        ...hotel,
        // FIX 1: Provide a fallback slug (using ID) so the View button stops showing "undefined"
        slug: hotel.slug || hotel.id.toString(),
        
        // FIX 2: Append the city to the location address so the Card shows it automatically
        location: hotel.location ? `${hotel.location}, ${hotel.city}` : hotel.city,
        
        // Ensure image URL is absolute
        image: getImageUrl(hotel.image)
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Failed to fetch approved hotels:", error);
    return [];
  }
}

// Next.js 15+ Page Props structure
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HotelBookingPage({ searchParams }: PageProps) {
  // Await search params for filtering
  const resolvedSearchParams = await searchParams;
  const searchQuery = (resolvedSearchParams?.query as string) || "";
  const locationQuery = (resolvedSearchParams?.location as string) || "";

  // Fetch dynamic database payload
  let hotels = await getApprovedHotels();

  // FIX 3: Server-side filtering based on URL parameters from HotelSearchBar
  if (searchQuery || locationQuery) {
    hotels = hotels.filter((hotel: any) => {
      const matchesName = hotel.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = hotel.city?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = hotel.city?.toLowerCase().includes(locationQuery.toLowerCase()) || 
                              hotel.state?.toLowerCase().includes(locationQuery.toLowerCase());
      
      if (searchQuery && locationQuery) return (matchesName || matchesCity) && matchesLocation;
      if (searchQuery) return matchesName || matchesCity;
      if (locationQuery) return matchesLocation;
      return true;
    });
  }

  return (
    <>
      {/* Hero Banner */}
      <div className="relative h-52 lg:h-64 flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        </div>
        <div className="container-wide relative z-10 pb-8">
          <h1 
            style={{ color: '#ffffff' }}
            className="font-heading text-3xl lg:text-4xl font-bold !text-white mb-1"
          >
            Hotel Booking
          </h1>
          <p 
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            className="text-sm lg:text-base !text-white/80"
          >
            Find and book the perfect hotel for your stay
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        <Breadcrumbs items={[{ label: "Hotel Booking" }]} />

        {/* Search Bar - Make sure this component uses router.push('?query=...') */}
        <HotelSearchBar />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {hotels.map((hotel: any) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>

        {hotels.length === 0 && (
          <div className="text-center py-20 bg-surface/50 rounded-2xl border border-border mt-6">
            <p className="text-muted text-lg font-medium">
              No hotels found matching your criteria.
            </p>
            <p className="text-muted text-sm mt-1">
              Try adjusting your search filters or check back later.
            </p>
          </div>
        )}

        {/* Hotel Owner Registration CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/15 rounded-2xl p-8 text-center">
          <h3 className="font-heading font-bold text-ink text-xl mb-2">
            Are You a Hotel Owner?
          </h3>
          <p className="text-muted text-sm max-w-lg mx-auto mb-5">
            List your hotel on the HR Trips platform and reach thousands of travelers.
            Enjoy seamless booking management and grow your business with us.
          </p>
          <Link
            href="/hotel-registration"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all"
          >
            Register Your Hotel →
          </Link>
        </div>
      </div>
    </>
  );
}