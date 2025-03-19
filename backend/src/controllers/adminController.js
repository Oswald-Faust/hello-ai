const logger = require('../utils/logger');
const User = require('../models/User');
const Company = require('../models/Company');
const Call = require('../models/Call');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Obtenir les statistiques du tableau de bord administrateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    logger.info('[ADMIN CONTROLLER] Récupération des statistiques du tableau de bord administrateur');
    
    // Récupérer le nombre total d'utilisateurs
    const totalUsers = await User.countDocuments();
    
    // Récupérer le nombre d'utilisateurs actifs
    const activeUsers = await User.countDocuments({ isActive: true });
    
    // Récupérer le nombre d'administrateurs
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    // Récupérer le nombre total d'entreprises
    const totalCompanies = await Company.countDocuments();
    
    // Récupérer le nombre d'entreprises actives
    const activeCompanies = await Company.countDocuments({ isActive: true });
    
    // Récupérer le nombre total d'appels
    const totalCalls = await Call.countDocuments();
    
    // Récupérer le nombre d'appels des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const callsLast30Days = await Call.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    
    // Récupérer les utilisateurs récemment créés (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.find({ 
      createdAt: { $gte: sevenDaysAgo } 
    }, 'firstName lastName email company role createdAt')
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('company', 'name');
    
    // Récupérer les entreprises récemment créées (7 derniers jours)
    const recentCompanies = await Company.find({ 
      createdAt: { $gte: sevenDaysAgo } 
    }, 'name email phone createdAt')
    .sort({ createdAt: -1 })
    .limit(5);
    
    // Récupérer les activités récentes (création d'utilisateurs, d'entreprises, appels importants)
    const recentActivities = [
      ...recentUsers.map(user => ({
        type: 'user_created',
        date: user.createdAt,
        data: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          company: user.company?.name || 'N/A'
        }
      })),
      ...recentCompanies.map(company => ({
        type: 'company_created',
        date: company.createdAt,
        data: {
          id: company._id,
          name: company.name,
          email: company.email,
          phone: company.phone
        }
      }))
    ].sort((a, b) => b.date - a.date).slice(0, 10);
    
    logger.info('[ADMIN CONTROLLER] Statistiques du tableau de bord récupérées avec succès');
    
    return successResponse(res, 200, 'Statistiques du tableau de bord administrateur récupérées avec succès', {
      userStats: {
        total: totalUsers,
        active: activeUsers,
        admin: adminUsers
      },
      companyStats: {
        total: totalCompanies,
        active: activeCompanies
      },
      callStats: {
        total: totalCalls,
        last30Days: callsLast30Days
      },
      recentActivities
    });
  } catch (error) {
    logger.error('[ADMIN CONTROLLER] Erreur lors de la récupération des statistiques du tableau de bord:', error);
    next(error);
  }
};

/**
 * Obtenir les données pour le tableau de bord système
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.getSystemStats = async (req, res, next) => {
  try {
    logger.info('[ADMIN CONTROLLER] Récupération des statistiques système');
    
    // Récupération de l'uptime du serveur en secondes
    const uptime = process.uptime();
    
    // Récupération de l'utilisation mémoire
    const memoryUsage = process.memoryUsage();
    
    // Version de Node.js
    const nodeVersion = process.version;
    
    // Informations sur l'environnement
    const environment = {
      nodeEnv: process.env.NODE_ENV || 'development',
      platform: process.platform,
      arch: process.arch
    };
    
    logger.info('[ADMIN CONTROLLER] Statistiques système récupérées avec succès');
    
    return successResponse(res, 200, 'Statistiques système récupérées avec succès', {
      uptime,
      memoryUsage: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024) // MB
      },
      nodeVersion,
      environment
    });
  } catch (error) {
    logger.error('[ADMIN CONTROLLER] Erreur lors de la récupération des statistiques système:', error);
    next(error);
  }
};

/**
 * Récupérer les logs du système (simulé)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
exports.getSystemLogs = async (req, res, next) => {
  try {
    logger.info('[ADMIN CONTROLLER] Récupération des logs système');
    
    // Dans une implémentation réelle, cela pourrait lire des fichiers de log
    // ou utiliser un service de log externe
    
    // Ici, nous simulons simplement des logs
    const mockLogs = [
      { level: 'info', timestamp: new Date(Date.now() - 3600000), message: 'Démarrage du serveur', service: 'server' },
      { level: 'info', timestamp: new Date(Date.now() - 3500000), message: 'Connexion à la base de données réussie', service: 'database' },
      { level: 'warn', timestamp: new Date(Date.now() - 3000000), message: 'Taux de requêtes élevé détecté', service: 'api' },
      { level: 'error', timestamp: new Date(Date.now() - 2500000), message: 'Échec de connexion à la base de données', service: 'database' },
      { level: 'info', timestamp: new Date(Date.now() - 2000000), message: 'Reconnexion à la base de données réussie', service: 'database' },
      { level: 'info', timestamp: new Date(Date.now() - 1500000), message: 'Tâche planifiée exécutée avec succès', service: 'scheduler' },
      { level: 'warn', timestamp: new Date(Date.now() - 1000000), message: 'Tentative d\'accès non autorisé', service: 'auth' },
      { level: 'info', timestamp: new Date(Date.now() - 500000), message: 'Email envoyé avec succès', service: 'mailer' },
      { level: 'error', timestamp: new Date(Date.now() - 250000), message: 'Erreur lors du traitement de la requête', service: 'api' },
      { level: 'info', timestamp: new Date(), message: 'Récupération des logs système', service: 'admin' }
    ];
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedLogs = mockLogs.slice(startIndex, endIndex);
    
    logger.info('[ADMIN CONTROLLER] Logs système récupérés avec succès');
    
    return successResponse(res, 200, 'Logs système récupérés avec succès', {
      logs: paginatedLogs,
      pagination: {
        total: mockLogs.length,
        page,
        limit,
        pages: Math.ceil(mockLogs.length / limit)
      }
    });
  } catch (error) {
    logger.error('[ADMIN CONTROLLER] Erreur lors de la récupération des logs système:', error);
    next(error);
  }
};

module.exports = exports; 