import Hero from "@/components/home/Hero";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import ServicesGrid from "@/components/home/ServicesGrid";
import FeaturedPackages from "@/components/home/FeaturedPackages";
import FeaturedHotels from "@/components/home/FeaturedHotels";
import Testimonials from "@/components/home/Testimonials";
import CtaBanner from "@/components/home/CtaBanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyChooseUs />
      <ServicesGrid />
      <FeaturedPackages />
      <FeaturedHotels />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
