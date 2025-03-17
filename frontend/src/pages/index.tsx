import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Phone, MessageSquare, BarChart2, Shield } from 'lucide-react';

const Home: NextPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center">
                  <Image src="/logo.svg" alt="Lydia" width={40} height={40} />
                  <span className="ml-2 text-2xl font-bold text-gray-900">Lydia</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/login">
                <Button variant="outline" className="mr-2">
                  Connexion
                </Button>
              </Link>
              <Link href="/register">
                <Button>
                  S'inscrire
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="relative bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <svg
                className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
                fill="currentColor"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <polygon points="50,0 100,0 50,100 0,100" />
              </svg>

              <div className="pt-10 sm:pt-16 lg:pt-8 xl:pt-16">
                <div className="sm:text-center lg:text-left px-4 sm:px-8 xl:pr-16">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">L'assistant vocal</span>
                    <span className="block text-primary-600">intelligent pour votre entreprise</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto lg:mx-0">
                    Lydia transforme votre communication client grâce à l'intelligence artificielle. 
                    Automatisez vos appels, analysez les conversations et améliorez votre service client.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link href="/register">
                        <Button size="lg" className="w-full">
                          Commencer gratuitement
                        </Button>
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link href="#features">
                        <Button variant="outline" size="lg" className="w-full">
                          En savoir plus
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <div className="h-56 w-full bg-gradient-to-r from-primary-600 to-secondary-600 sm:h-72 lg:h-full">
              <div className="flex items-center justify-center h-full">
                <Image 
                  src="/logo-white.svg" 
                  alt="Lydia" 
                  width={200} 
                  height={200} 
                  className="opacity-80"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Fonctionnalités</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Une solution complète pour vos appels
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Découvrez comment Lydia peut transformer votre service client et optimiser vos communications.
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Réponse automatique</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Répondez automatiquement aux appels entrants avec un assistant vocal intelligent qui comprend les demandes de vos clients.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Analyse de conversations</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Analysez les conversations pour identifier les tendances, les problèmes récurrents et les opportunités d'amélioration.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <BarChart2 className="h-6 w-6" />
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Statistiques détaillées</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Accédez à des tableaux de bord complets avec des statistiques sur vos appels, durées et taux de résolution.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Sécurité avancée</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Protégez les données de vos clients avec un chiffrement de bout en bout et des contrôles d'accès stricts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary-700">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Prêt à transformer votre service client?</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-primary-200">
              Commencez dès aujourd'hui et découvrez comment Lydia peut vous aider à améliorer votre communication client.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="mt-8 w-full sm:w-auto bg-white text-primary-700 hover:bg-primary-50"
              >
                Commencer gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Image src="/logo-white.svg" alt="Lydia" width={40} height={40} />
              <span className="ml-2 text-xl font-bold text-white">Lydia</span>
            </div>
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Lydia. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 