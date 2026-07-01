import type { Metadata } from "next";
import ComingSoonPage from "@/components/shared/ComingSoonPage";

export const metadata: Metadata = {
  title: "Event Booking",
  description: "End-to-end event planning and management for memorable occasions with HR Trips.",
};

export default function EventBookingPage() {
  return (
    <ComingSoonPage
      serviceName="Event Booking"
      serviceDescription="End-to-end event planning and management for birthdays, anniversaries, corporate events, and more. Let us handle the logistics while you enjoy the celebration."
    />
  );
}
