'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';
import Header from './Header';
import Hero from './Hero';
import ResultsGrid from './ResultsGrid';
import MobilitySection from './MobilitySection';
import CareerSalarySection from './CareerSalarySection';
import SkillsSection from './SkillsSection';
import Footer from './Footer';
import Modals from './Modals';

export default function ClientApp() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.initMetierRefApp) {
      window.initMetierRefApp();
    }
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <ResultsGrid />
        <MobilitySection />
        <CareerSalarySection />
        <SkillsSection />
        <Footer />
      </main>
      <Modals />
      <Script 
        src="/app.js" 
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && window.initMetierRefApp) {
            window.initMetierRefApp();
          }
        }} 
      />
    </>
  );
}
