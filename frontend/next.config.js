/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Résoudre les problèmes d'importation de troika-three-text
    config.module.rules.push({
      test: /troika-three-text/,
      resolve: {
        alias: {
          'webgl-sdf-generator': false,
          'bidi-js': false,
          'three': path.resolve(__dirname, './src/utils/threeCompat.ts')  // Utiliser notre module de compatibilité avec un chemin absolu
        }
      }
    });

    // Rediriger toutes les importations de 'three' vers notre module de compatibilité
    config.resolve.alias = {
      ...config.resolve.alias,
      'three': path.resolve(__dirname, './src/utils/threeCompat.ts')  // Utiliser un chemin absolu
    };

    // Optimisation pour les paquets de Three.js
    config.externals = [...config.externals, { canvas: 'canvas' }];
    
    // Permettre à Next.js de gérer les modules de Three.js correctement
    config.resolve.extensions.push('.mjs', '.ts', '.tsx');

    // Résoudre le problème d'importation de Box3 dans three-mesh-bvh
    config.resolve.alias = {
      ...config.resolve.alias,
      'three': path.resolve(__dirname, './src/utils/three-mesh-bvh-shim.js'),
    };
    
    // Injecter Box3 dans l'objet global pour three-mesh-bvh
    if (isServer) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        return {
          ...entries,
          'init-three-compat': require.resolve('./src/utils/injectThreeGlobal.js'),
        };
      };
    }

    return config;
  },
  transpilePackages: ['troika-three-text', 'three'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portraits/**',
      },
    ],
  },
  output: 'standalone',
  experimental: {},
  // Désactiver la génération statique pour toutes les pages
  staticPageGenerationTimeout: 0
};

module.exports = nextConfig; 