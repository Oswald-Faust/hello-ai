'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Import des composants avec chargement dynamique pour optimiser les performances
const AnimatedNavbar = dynamic(() => import('@/components/home/AnimatedNavbar'), { ssr: false });
const HeroScene = dynamic(() => import('@/components/home/HeroScene'), { ssr: false });
const ParallaxSection = dynamic(() => import('@/components/home/ParallaxSection'), { ssr: false });
const RevealOnScroll = dynamic(() => import('@/components/home/RevealOnScroll'), { ssr: false });
const AnimatedFeatureCard = dynamic(() => import('@/components/home/AnimatedFeatureCard'), { ssr: false });
const AnimatedTestimonials = dynamic(() => import('@/components/home/AnimatedTestimonials'), { ssr: false });
const AnimatedCTA = dynamic(() => import('@/components/home/AnimatedCTA'), { ssr: false });
const AppShowcase = dynamic(() => import('@/components/home/AppShowcase'), { ssr: false });
const PricingTable = dynamic(() => import('@/components/home/PricingTable'), { ssr: false });
const HowItWorks = dynamic(() => import('@/components/home/HowItWorks'), { ssr: false });
const FAQ = dynamic(() => import('@/components/home/FAQ'), { ssr: false });
const Footer = dynamic(() => import('@/components/home/Footer'), { ssr: false });
const StatsSection = dynamic(() => import('@/components/home/StatsSection'), { ssr: false });
const GradientDivider = dynamic(() => import('@/components/ui/GradientDivider'), { ssr: false });

// Icônes pour les fonctionnalités
const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'Intelligence Artificielle Avancée',
    description: 'Notre IA comprend naturellement les intentions de vos clients et s\'adapte à chaque conversation.',
    gradient: 'from-violet-600 to-indigo-600',
    index: 0
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Intégration Multi-Plateforme',
    description: 'Connectez Lydia à tous vos canaux de communication en quelques clics.',
    gradient: 'from-fuchsia-600 to-pink-600',
    index: 1
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Analyses en Temps Réel',
    description: 'Suivez les performances de votre assistant et optimisez vos communications.',
    gradient: 'from-sky-600 to-blue-600',
    index: 2
  }
];

export default function Home() {
  return (
    <div className="relative bg-slate-950 overflow-hidden">
      {/* Navigation fixée */}
      <AnimatedNavbar />

      {/* Hero Section - utilise la scène Canvas */}
      <section className="relative min-h-screen">
        <div className="container mx-auto px-6 pt-32 pb-16 relative z-10">
          <RevealOnScroll>
            <h1 className="text-5xl md:text-7xl font-bold text-white text-center mb-8">
              L'Assistant Vocal du{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                Futur
              </span>
            </h1>
          </RevealOnScroll>
          <RevealOnScroll delay={0.2}>
            <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto mb-12">
              Transformez vos communications avec une IA qui comprend, apprend et s'adapte à vos besoins.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.4}>
            <div className="flex justify-center gap-4 flex-wrap">
              <a 
                href="#features" 
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg hover:shadow-violet-600/20 transition-all duration-300 flex items-center gap-2"
              >
                Découvrir
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
              <a 
                href="#demo" 
                className="border border-violet-500/40 text-white px-8 py-3 rounded-full font-medium hover:bg-violet-800/20 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
              >
                Démonstration
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </RevealOnScroll>
        </div>
        <div className="absolute inset-0 z-0">
          <HeroScene />
        </div>
        
        {/* Transition vers la section suivante */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 text-slate-950 rotate-180">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* Section Statistiques (inspirée de Revolut) */}
      <StatsSection />
      
      {/* Divider avec gradient pour transition fluide */}
      <GradientDivider />

      {/* Section Fonctionnalités avec animation */}
      <ParallaxSection id="features" className="py-20">
        <div className="container mx-auto px-6">
          <RevealOnScroll>
            <div className="mb-4 text-center">
              <span className="inline-block px-4 py-1 rounded-full bg-violet-500/10 text-violet-400 text-sm font-medium backdrop-blur-sm border border-violet-500/20">
                Fonctionnalités
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
              Des Fonctionnalités Innovantes
            </h2>
          </RevealOnScroll>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <RevealOnScroll key={feature.title} delay={i * 0.15}>
                <AnimatedFeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  gradient={feature.gradient}
                  delay={i * 0.2}
                  index={i}
                />
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </ParallaxSection>

      {/* Section Comment ça marche (inspirée de Revolut) */}
      <HowItWorks />

      {/* Section Présentation de l'app (inspirée de Revolut) */}
      <AppShowcase />

      {/* Section Témoignages */}
      <ParallaxSection className="py-20">
        <AnimatedTestimonials />
      </ParallaxSection>

      {/* Section Prix (inspirée de Revolut) */}
      <PricingTable />

      {/* Section FAQ (inspirée de Revolut) */}
      <FAQ />

      {/* Section CTA */}
      <AnimatedCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}