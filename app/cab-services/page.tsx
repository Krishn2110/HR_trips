import type { Metadata } from "next";
import ComingSoonPage from "@/components/shared/ComingSoonPage";

export const metadata: Metadata = {
  title: "Cab Services",
  description: "Reliable airport transfers, city tours, and outstation cab bookings with HR Trips.",
};

export default function CabServicesPage() {
  return (
    <ComingSoonPage
      serviceName="Cab Services"
      serviceDescription="Reliable airport transfers, city tours, and outstation cab bookings. Our verified fleet of vehicles and experienced drivers ensure safe, comfortable journeys every time."
    />
  );
}
