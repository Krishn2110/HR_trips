import type { Metadata } from "next";
import { getHotels } from "@/lib/api";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HotelCard from "@/components/hotels/HotelCard";
import HotelSearchBar from "@/components/hotels/HotelSearchBar";

export const metadata: Metadata = {
  title: "Hotel Booking",
  description:
    "Book premium hotels across India at the best rates. Search hotels in Patna, Goa, Shimla, Udaipur, and more with flexible cancellation and instant confirmation.",
};

export default async function HotelBookingPage() {
  const hotels = await getHotels();

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

        <HotelSearchBar />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>

        {hotels.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted text-lg">
              No hotels found. Please try different search criteria.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
