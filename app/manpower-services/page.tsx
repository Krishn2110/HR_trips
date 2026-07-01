import type { Metadata } from "next";
import ComingSoonPage from "@/components/shared/ComingSoonPage";

export const metadata: Metadata = {
  title: "Manpower Services",
  description: "Staffing solutions for hospitality, events, and corporate requirements with HR Trips.",
};

export default function ManpowerServicesPage() {
  return (
    <ComingSoonPage
      serviceName="Manpower Services"
      serviceDescription="Professional staffing solutions for the hospitality industry, events, and corporate requirements. We provide trained, reliable manpower to meet your business needs."
    />
  );
}
