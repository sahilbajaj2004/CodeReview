import LandingNav from "@/app/components/landing/LandingNav";
import Hero from "@/app/components/landing/Hero";
import WaysIn from "@/app/components/landing/WaysIn";
import HowItWorks from "@/app/components/landing/HowItWorks";
import Lenses from "@/app/components/landing/Lenses";
import Models from "@/app/components/landing/Models";
import FinalCTA from "@/app/components/landing/FinalCTA";
import Footer from "@/app/components/landing/Footer";

export default function Home() {
  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <WaysIn />
        <HowItWorks />
        <Lenses />
        <Models />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
