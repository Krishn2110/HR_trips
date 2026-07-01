import type { Metadata } from "next";
import ComingSoonPage from "@/components/shared/ComingSoonPage";

export const metadata: Metadata = {
  title: "Ticketing",
  description: "Flight, train, and bus ticket booking at competitive prices with HR Trips.",
};

export default function TicketingPage() {
  return (
    <ComingSoonPage
      serviceName="Ticketing"
      serviceDescription="Flight, train, and bus ticket booking at competitive prices. We help you find the best routes and fares so you can focus on enjoying your journey."
    />
  );
}
