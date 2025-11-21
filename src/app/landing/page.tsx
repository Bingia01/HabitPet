'use client';

import HeroSectionV2 from '@/components/landing/HeroSectionV2';
import ProblemSolutionStrip from '@/components/landing/ProblemSolutionStrip';
import AppShowcase from '@/components/landing/AppShowcase';
import MascotFeature from '@/components/landing/MascotFeature';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import HowItWorks from '@/components/landing/HowItWorks';
import SocialProof from '@/components/landing/SocialProof';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A1128]">
      {/* Hero Section - Forki Theme */}
      <HeroSectionV2 />

      {/* Keep existing sections below for now */}
      <ProblemSolutionStrip />
      <AppShowcase />
      <MascotFeature />
      <FeaturesGrid />
      <HowItWorks />
      <SocialProof />
      <FinalCTA />
      <Footer />
    </div>
  );
}
