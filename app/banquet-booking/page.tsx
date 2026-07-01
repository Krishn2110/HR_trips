import type { Metadata } from "next";
import ComingSoonPage from "@/components/shared/ComingSoonPage";

export const metadata: Metadata = {
  title: "Banquet Booking",
  description: "Find and book the perfect banquet hall for weddings, parties, and corporate events with HR Trips.",
};

export default function BanquetBookingPage() {
  return (
    <ComingSoonPage
      serviceName="Banquet Booking"
      serviceDescription="Find and book the perfect banquet hall for weddings, receptions, parties, and corporate events. We partner with the best venues to bring you the ideal space for your special occasions."
    />
  );
}
