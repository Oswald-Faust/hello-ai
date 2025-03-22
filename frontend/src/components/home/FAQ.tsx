'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    question: "Comment fonctionne Lydia pour reconnaître la voix ?",
    answer: "Lydia utilise des algorithmes avancés d'IA et de traitement du langage naturel pour comprendre les intentions de vos clients. Notre technologie analyse le contexte, l'intonation et le contenu pour fournir des réponses précises et personnalisées, même avec des accents variés ou un bruit de fond.",
    category: "technologie"
  },
  {
    question: "Combien de temps prend l'intégration à nos systèmes existants ?",
    answer: "L'intégration de base peut être réalisée en quelques minutes grâce à nos connecteurs prédéfinis. Pour les intégrations plus complexes avec des systèmes CRM ou ERP personnalisés, notre équipe vous accompagne pour une mise en place typiquement réalisée en 2 à 5 jours selon la complexité de votre environnement.",
    category: "integration"
  },
  {
    question: "Lydia peut-elle comprendre plusieurs langues ?",
    answer: "Oui, Lydia prend en charge plus de 40 langues avec l'offre Entreprise, 15 langues avec l'offre Professionnelle, et les langues principales (français, anglais, espagnol) avec l'offre Démarrage. Notre IA est constamment entraînée pour améliorer sa compréhension des nuances linguistiques et des expressions idiomatiques.",
    category: "technologie"
  },
  {
    question: "Quelles mesures de sécurité sont en place pour protéger nos données ?",
    answer: "Nous utilisons un chiffrement de niveau bancaire (AES-256) pour toutes les données stockées et en transit. Nos serveurs sont hébergés dans des centres de données certifiés ISO 27001, et nous sommes entièrement conformes au RGPD. Nous proposons également des options de résidence des données pour répondre aux exigences réglementaires spécifiques.",
    category: "securite"
  },
  {
    question: "Est-il possible de personnaliser la voix de l'assistant ?",
    answer: "Absolument. Vous pouvez choisir parmi notre bibliothèque de voix professionnelles ou créer une voix sur mesure qui correspond à l'identité de votre marque. Nos offres Professionnelle et Entreprise permettent de personnaliser le ton, le rythme et même l'accent pour une expérience unique.",
    category: "personnalisation"
  },
  {
    question: "Que se passe-t-il si Lydia ne peut pas répondre à une question ?",
    answer: "Lydia est conçue pour transférer en douceur la conversation à un agent humain lorsqu'elle détecte qu'elle ne peut pas répondre de manière satisfaisante. Vous pouvez définir des règles de transfert basées sur des déclencheurs spécifiques, et notre système d'apprentissage continu s'améliore avec chaque interaction pour réduire ces situations.",
    category: "technologie"
  },
  {
    question: "Comment mesurer le retour sur investissement avec Lydia ?",
    answer: "Notre tableau de bord analytique complet vous permet de suivre des métriques clés comme le taux de résolution, le temps moyen de traitement, la satisfaction client et les économies réalisées. Nos clients constatent généralement une réduction des coûts de 40% et une augmentation de la satisfaction client de 35% dans les trois premiers mois d'utilisation.",
    category: "analyse"
  },
  {
    question: "Pouvons-nous essayer Lydia avant de nous engager ?",
    answer: "Oui, nous proposons un essai gratuit de 14 jours de notre offre Professionnelle sans engagement ni carte bancaire. Vous pouvez également demander une démonstration personnalisée avec l'un de nos experts qui vous guidera à travers les fonctionnalités pertinentes pour votre secteur d'activité.",
    category: "commercial"
  }
];

const categories = [
  { id: "tous", label: "Toutes les questions" },
  { id: "technologie", label: "Technologie" },
  { id: "integration", label: "Intégration" },
  { id: "securite", label: "Sécurité" },
  { id: "personnalisation", label: "Personnalisation" },
  { id: "analyse", label: "Analyse" },
  { id: "commercial", label: "Commercial" }
];

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState("tous");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6]);
  
  const filteredFAQs = activeCategory === "tous" 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory);
    
  const toggleExpand = (index: number) => {
    setExpandedId(expandedId === index ? null : index);
  };

  return (
    <motion.section
      ref={containerRef}
      id="faq"
      className="relative py-24 overflow-hidden bg-gradient-to-b from-slate-950 via-violet-950/5 to-slate-950"
      style={{ opacity }}
    >
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950/80"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-16"
          style={{ y }}
        >
          <motion.div 
            className="inline-block mb-3 px-4 py-1 rounded-full bg-violet-500/10 text-violet-400 text-sm font-medium backdrop-blur-sm border border-violet-500/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Foire aux questions
          </motion.div>
          
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Vous avez des questions ?
          </motion.h2>
          
          <motion.p
            className="text-xl text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Voici les réponses aux questions les plus fréquentes sur Lydia
          </motion.p>
        </motion.div>
        
        {/* Filtres de catégories */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-slate-800/60 hover:bg-slate-700/60 text-gray-300 border border-gray-700/50'
              }`}
              onClick={() => setActiveCategory(category.id)}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {category.label}
            </motion.button>
          ))}
        </motion.div>
        
        {/* Liste des questions/réponses */}
        <motion.div 
          className="max-w-3xl mx-auto space-y-4"
          layout
        >
          <AnimatePresence>
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={`${activeCategory}-${index}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`rounded-xl backdrop-blur-sm overflow-hidden transition-all duration-300 ${
                  expandedId === index
                    ? 'bg-violet-900/20 border border-violet-500/30 shadow-lg shadow-violet-900/10'
                    : 'bg-slate-900/60 border border-gray-800/50 hover:bg-slate-800/60'
                }`}
              >
                <button
                  className="w-full text-left px-6 py-5 flex justify-between items-center"
                  onClick={() => toggleExpand(index)}
                >
                  <h3 className="text-lg font-medium text-white pr-8">{faq.question}</h3>
                  <div className={`transform transition-transform duration-300 ${expandedId === index ? 'rotate-45' : 'rotate-0'}`}>
                    <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </button>
                
                <AnimatePresence>
                  {expandedId === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-gray-300 border-t border-violet-500/20 pt-3">
                        <p>{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {/* Appel à l'action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-gray-300 mb-6">
            Vous ne trouvez pas la réponse que vous cherchez ?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 rounded-full bg-slate-800 border border-gray-700/50 text-white font-medium hover:bg-slate-700 transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Contacter notre équipe
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FAQ; 