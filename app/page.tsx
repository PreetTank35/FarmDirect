import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Categories from "@/components/landing/Categories";
import TrustSection from "@/components/landing/TrustSection";
import Stats from "@/components/landing/Stats";
import ForSellers from "@/components/landing/ForSellers";
import Testimonials from "@/components/landing/Testimonials";
import FinalCTA from "@/components/landing/FinalCTA";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Categories />
        <TrustSection />
        <Stats />
        <ForSellers />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
