import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HR Trips — Travel & Hospitality Services | Holiday Packages & Hotel Booking",
    template: "%s | HR Trips",
  },
  description:
    "HR Trips offers curated holiday packages, hotel bookings, banquet services, and more. Trusted travel partner based in Patna, Bihar with 24/7 support and affordable pricing.",
  keywords: [
    "travel agency Patna",
    "holiday packages Bihar",
    "hotel booking India",
    "Nepal tour package",
    "HR Trips",
    "travel and hospitality",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://hrtrips.com",
    siteName: "HR Trips",
    title: "HR Trips — Travel & Hospitality Services",
    description:
      "Curated holiday packages, hotel bookings, and hospitality services across India and beyond.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
