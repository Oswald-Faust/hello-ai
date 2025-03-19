'use client';

import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary">Lydia</span>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link href="#features" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md">
                Fonctionnalités
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md">
                Tarifs
              </Link>
              <Link href="#contact" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md">
                Contact
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">Connexion</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Inscription</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Assistant Vocal Intelligent
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Transformez l&apos;expérience client avec Lydia, votre assistant vocal alimenté par l&apos;IA
          pour optimiser vos communications téléphoniques.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/auth/register">
            <Button size="lg" className="px-8">Commencer gratuitement</Button>
          </Link>
          <Link href="#demo">
            <Button variant="outline" size="lg" className="px-8">Voir la démo</Button>
          </Link>
        </div>
        <div className="mt-12 relative h-96 max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-2xl opacity-20"></div>
          <div className="relative h-full flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-full h-72 bg-gray-200 rounded-md flex items-center justify-center">
                <p className="text-gray-500">Interface de démonstration</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Fonctionnalités</h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Réponse Automatique</h3>
            <p className="text-gray-600">
              Répondez automatiquement aux appels avec un assistant vocal qui comprend les intentions de vos clients.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Transfert Intelligent</h3>
            <p className="text-gray-600">
              Transfert automatique vers un agent humain lorsque la situation le nécessite.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Analyses Détaillées</h3>
            <p className="text-gray-600">
              Visualisez les performances de votre assistant et obtenez des insights sur vos communications.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Tarifs flexibles</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-8">
                <h3 className="text-xl font-semibold mb-4">Starter</h3>
                <p className="text-gray-600 mb-6">Idéal pour les petites entreprises</p>
                <p className="text-4xl font-bold mb-6">29€ <span className="text-gray-500 text-lg font-normal">/mois</span></p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Jusqu&apos;à 100 appels/mois
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    1 numéro de téléphone
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Rapports basiques
                  </li>
                </ul>
                <Button variant="outline" className="w-full">Choisir ce forfait</Button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-primary">
              <div className="p-8">
                <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-semibold">Populaire</div>
                <h3 className="text-xl font-semibold mb-4">Pro</h3>
                <p className="text-gray-600 mb-6">Pour les entreprises en croissance</p>
                <p className="text-4xl font-bold mb-6">79€ <span className="text-gray-500 text-lg font-normal">/mois</span></p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Jusqu&apos;à 500 appels/mois
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    3 numéros de téléphone
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Rapports avancés
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Personnalisation de réponses
                  </li>
                </ul>
                <Button className="w-full">Choisir ce forfait</Button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-8">
                <h3 className="text-xl font-semibold mb-4">Entreprise</h3>
                <p className="text-gray-600 mb-6">Solutions personnalisées</p>
                <p className="text-4xl font-bold mb-6">Sur mesure</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Volume illimité
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Numéros de téléphone illimités
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    API dédiée
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Support dédié 24/7
                  </li>
                </ul>
                <Button variant="outline" className="w-full">Nous contacter</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Contactez-nous</h2>
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col">
              <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input type="text" id="name" className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="email" className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="message" className="text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea id="message" rows={4} className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
            </div>
            <Button className="w-full">Envoyer</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-4">Lydia</h3>
              <p className="text-gray-400 max-w-xs">
                Assistant vocal intelligent pour améliorer vos communications professionnelles.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">Produit</h4>
                <ul className="space-y-2">
                  <li><Link href="#features" className="text-gray-400 hover:text-white">Fonctionnalités</Link></li>
                  <li><Link href="#pricing" className="text-gray-400 hover:text-white">Tarifs</Link></li>
                  <li><Link href="#testimonials" className="text-gray-400 hover:text-white">Témoignages</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Entreprise</h4>
                <ul className="space-y-2">
                  <li><Link href="#about" className="text-gray-400 hover:text-white">À propos</Link></li>
                  <li><Link href="#blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                  <li><Link href="#careers" className="text-gray-400 hover:text-white">Carrières</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Légal</h4>
                <ul className="space-y-2">
                  <li><Link href="#privacy" className="text-gray-400 hover:text-white">Confidentialité</Link></li>
                  <li><Link href="#terms" className="text-gray-400 hover:text-white">Conditions</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row md:justify-between md:items-center">
            <p className="text-gray-400">© 2023 Lydia. Tous droits réservés.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#twitter" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#linkedin" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </Link>
              <Link href="#facebook" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 