import type { Metadata } from "next";
import ComingSoonPage from "@/components/shared/ComingSoonPage";

export const metadata: Metadata = {
  title: "Catering Services",
  description: "Professional catering for events of all sizes with customizable menus. HR Trips catering services.",
};

export default function CateringBookingPage() {
  return (
    <ComingSoonPage
      serviceName="Catering Services"
      serviceDescription="Professional catering for events of all sizes — from intimate gatherings to grand celebrations. Customizable menus featuring multi-cuisine options prepared by expert chefs."
    />
  );
}
