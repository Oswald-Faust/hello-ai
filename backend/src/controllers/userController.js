const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Obtenir tous les utilisateurs
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, companyId } = req.query;
    
    const query = {};
    
    // Filtrer par entreprise si spécifié
    if (companyId) {
      query.company = companyId;
    }
    
    // Recherche par nom ou email si spécifié
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      select: '-password',
      populate: { path: 'company', select: 'name' }
    };
    
    const users = await User.find(query)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort(options.sort)
      .select(options.select)
      .populate(options.populate)
      .exec();
    
    const total = await User.countDocuments(query);
    
    return res.status(200).json({
      users,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalUsers: total
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des utilisateurs:', error);
    return res.status(500).json({
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

/**
 * Obtenir un utilisateur par son ID
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('company', 'name');
    
    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé'
      });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return res.status(500).json({
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
    });
  }
};

/**
 * Mettre à jour un utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, role, phoneNumber, active, preferences } = req.body;
    
    // Créer un objet avec les champs à mettre à jour
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (active !== undefined) updateData.active = active;
    if (preferences) updateData.preferences = preferences;
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('company', 'name');
    
    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé'
      });
    }
    
    logger.info(`Utilisateur mis à jour: ${user.email}`);
    
    return res.status(200).json({
      message: 'Utilisateur mis à jour avec succès',
      user
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    return res.status(500).json({
      message: 'Erreur lors de la mise à jour de l\'utilisateur',
      error: error.message
    });
  }
};

/**
 * Supprimer un utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé'
      });
    }
    
    logger.info(`Utilisateur supprimé: ${user.email}`);
    
    return res.status(200).json({
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return res.status(500).json({
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error.message
    });
  }
};

/**
 * Réinitialiser le mot de passe d'un utilisateur (par un administrateur)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    
    // Vérifier si le nouveau mot de passe est fourni
    if (!newPassword) {
      return res.status(400).json({
        message: 'Le nouveau mot de passe est requis'
      });
    }
    
    // Vérifier si le nouveau mot de passe est assez long
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();
    
    logger.info(`Mot de passe réinitialisé pour: ${user.email} par un administrateur`);
    
    return res.status(200).json({
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    logger.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return res.status(500).json({
      message: 'Erreur lors de la réinitialisation du mot de passe',
      error: error.message
    });
  }
};

/**
 * Obtenir les utilisateurs d'une entreprise
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getUsersByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 10, search } = req.query;
    
    const query = { company: companyId };
    
    // Recherche par nom ou email si spécifié
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      select: '-password'
    };
    
    const users = await User.find(query)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort(options.sort)
      .select(options.select)
      .exec();
    
    const total = await User.countDocuments(query);
    
    return res.status(200).json({
      users,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalUsers: total
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des utilisateurs de l\'entreprise:', error);
    return res.status(500).json({
      message: 'Erreur lors de la récupération des utilisateurs de l\'entreprise',
      error: error.message
    });
  }
};

/**
 * Créer un nouvel utilisateur (admin)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.createUser = async (req, res) => {
  try {
    logger.info('[USER CONTROLLER] Début création d\'utilisateur par admin');
    const { firstName, lastName, email, password, role, companyId, phoneNumber, isActive } = req.body;

    // Vérifier les champs obligatoires
    if (!firstName || !lastName || !email || !password || !companyId) {
      return res.status(400).json({
        message: 'Veuillez fournir tous les champs obligatoires: prénom, nom, email, mot de passe et entreprise'
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Créer le nouvel utilisateur
    const userData = {
      firstName,
      lastName,
      email,
      password,
      company: companyId,
      role: role || 'user',
      phoneNumber,
      isActive: isActive !== undefined ? isActive : true
    };

    logger.info(`[USER CONTROLLER] Création de l'utilisateur avec les données: ${JSON.stringify({...userData, password: '********'})}`);

    const user = await User.create(userData);
    logger.info(`[USER CONTROLLER] Utilisateur créé avec succès: ID ${user._id}`);

    return res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        company: user.company,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error(`[USER CONTROLLER] Erreur lors de la création de l'utilisateur: ${error.message}`);
    return res.status(500).json({
      message: 'Erreur lors de la création de l\'utilisateur',
      error: error.message
    });
  }
};

/**
 * Obtenir les statistiques des utilisateurs (pour dashboard admin)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getUsersStats = async (req, res) => {
  try {
    logger.info('[USER CONTROLLER] Récupération des statistiques utilisateurs');
    
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    // Obtenir les utilisateurs créés par mois sur les 6 derniers mois
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const usersByMonth = await User.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Transformer le résultat en format plus lisible
    const usersGrowth = usersByMonth.map(item => ({
      period: `${item._id.year}-${item._id.month < 10 ? '0' + item._id.month : item._id.month}`,
      count: item.count
    }));
    
    logger.info('[USER CONTROLLER] Statistiques utilisateurs récupérées avec succès');
    
    return res.status(200).json({
      totalUsers,
      activeUsers,
      adminUsers,
      usersGrowth
    });
  } catch (error) {
    logger.error(`[USER CONTROLLER] Erreur lors de la récupération des statistiques utilisateurs: ${error.message}`);
    return res.status(500).json({
      message: 'Erreur lors de la récupération des statistiques utilisateurs',
      error: error.message
    });
  }
};

/**
 * Changer le statut actif/inactif d'un utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    
    if (isActive === undefined) {
      return res.status(400).json({
        message: 'Le paramètre isActive est requis'
      });
    }
    
    logger.info(`[USER CONTROLLER] Changement du statut de l'utilisateur ${userId} à ${isActive ? 'actif' : 'inactif'}`);
    
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé'
      });
    }
    
    logger.info(`[USER CONTROLLER] Statut de l'utilisateur ${userId} mis à jour avec succès`);
    
    return res.status(200).json({
      message: `L'utilisateur a été ${isActive ? 'activé' : 'désactivé'} avec succès`,
      user
    });
  } catch (error) {
    logger.error(`[USER CONTROLLER] Erreur lors du changement du statut de l'utilisateur: ${error.message}`);
    return res.status(500).json({
      message: 'Erreur lors du changement du statut de l\'utilisateur',
      error: error.message
    });
  }
};

/**
 * Mettre à jour le rôle d'un utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        message: 'Un rôle valide est requis (user ou admin)'
      });
    }
    
    logger.info(`[USER CONTROLLER] Mise à jour du rôle de l'utilisateur ${userId} à ${role}`);
    
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé'
      });
    }
    
    logger.info(`[USER CONTROLLER] Rôle de l'utilisateur ${userId} mis à jour avec succès`);
    
    return res.status(200).json({
      message: `Le rôle de l'utilisateur a été mis à jour avec succès à ${role}`,
      user
    });
  } catch (error) {
    logger.error(`[USER CONTROLLER] Erreur lors de la mise à jour du rôle de l'utilisateur: ${error.message}`);
    return res.status(500).json({
      message: 'Erreur lors de la mise à jour du rôle de l\'utilisateur',
      error: error.message
    });
  }
};

/**
 * Obtenir l'entreprise de l'utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getUserCompany = async (req, res) => {
  try {
    const userId = req.user.id;
    
    logger.info(`[USER CONTROLLER] Récupération de l'entreprise pour l'utilisateur ${userId}`);
    
    // Récupérer l'utilisateur avec les informations de son entreprise
    const user = await User.findById(userId)
      .select('-password')
      .populate('company');
    
    if (!user) {
      logger.warn(`[USER CONTROLLER] Utilisateur ${userId} non trouvé`);
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    if (!user.company) {
      logger.warn(`[USER CONTROLLER] Aucune entreprise associée à l'utilisateur ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'Aucune entreprise associée à cet utilisateur'
      });
    }
    
    logger.info(`[USER CONTROLLER] Entreprise récupérée avec succès pour l'utilisateur ${userId}`);
    
    return res.status(200).json({
      success: true,
      data: {
        company: user.company
      }
    });
  } catch (error) {
    logger.error(`[USER CONTROLLER] Erreur lors de la récupération de l'entreprise de l'utilisateur: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'entreprise',
      error: error.message
    });
  }
};

/**
 * Obtenir les statistiques du tableau de bord pour l'utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '7days' } = req.query;
    
    logger.info(`[USER CONTROLLER] Récupération des statistiques du tableau de bord pour l'utilisateur ${userId}, période: ${period}`);
    
    // Récupérer l'utilisateur et son entreprise
    const user = await User.findById(userId).populate('company');
    
    if (!user) {
      logger.warn(`[USER CONTROLLER] Utilisateur ${userId} non trouvé`);
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    if (!user.company) {
      logger.warn(`[USER CONTROLLER] Aucune entreprise associée à l'utilisateur ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'Aucune entreprise associée à cet utilisateur'
      });
    }
    
    const companyId = user.company._id;
    
    // Déterminer la plage de dates en fonction de la période
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    
    // Importer les modèles nécessaires pour les statistiques
    const Call = require('../models/Call');
    
    // Obtenir les statistiques des appels
    const totalCalls = await Call.countDocuments({
      company: companyId,
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const completedCalls = await Call.countDocuments({
      company: companyId,
      status: 'completed',
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const transferredCalls = await Call.countDocuments({
      company: companyId,
      transferredToAgent: true,
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Calculer la durée moyenne des appels
    const callDurationStats = await Call.aggregate([
      {
        $match: {
          company: companyId,
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate },
          duration: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' },
          totalDuration: { $sum: '$duration' }
        }
      }
    ]);
    
    const avgCallDuration = callDurationStats.length > 0 ? Math.round(callDurationStats[0].avgDuration) : 0;
    const totalCallDuration = callDurationStats.length > 0 ? callDurationStats[0].totalDuration : 0;
    
    // Obtenir la répartition des appels par jour
    const callsByDay = await Call.aggregate([
      {
        $match: {
          company: companyId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);
    
    // Formater les données pour le frontend
    const formattedCallsByDay = callsByDay.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      count: item.count
    }));
    
    logger.info(`[USER CONTROLLER] Statistiques du tableau de bord récupérées avec succès pour l'utilisateur ${userId}`);
    
    return res.status(200).json({
      success: true,
      data: {
        totalCalls,
        completedCalls,
        transferredCalls,
        avgCallDuration,
        totalCallDuration,
        callsByDay: formattedCallsByDay,
        period
      }
    });
  } catch (error) {
    logger.error(`[USER CONTROLLER] Erreur lors de la récupération des statistiques du tableau de bord: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques du tableau de bord',
      error: error.message
    });
  }
};

/**
 * Obtenir les activités de l'utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getUserActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    logger.info(`[USER CONTROLLER] Récupération des activités pour l'utilisateur ${userId}`);
    
    // Importer le modèle Activity
    const Activity = require('../models/Activity');
    
    // Récupérer les activités de l'utilisateur
    const activities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('relatedEntity', 'name title content');
    
    // Compter le nombre total d'activités
    const totalActivities = await Activity.countDocuments({ user: userId });
    
    logger.info(`[USER CONTROLLER] ${activities.length} activités récupérées pour l'utilisateur ${userId}`);
    
    return res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalActivities,
          pages: Math.ceil(totalActivities / limit)
        }
      }
    });
  } catch (error) {
    logger.error(`[USER CONTROLLER] Erreur lors de la récupération des activités: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des activités',
      error: error.message
    });
  }
};

/**
 * Obtenir les conversations de l'utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    
    logger.info(`[USER CONTROLLER] Récupération des conversations pour l'utilisateur ${userId}`);
    
    // Importer le modèle Conversation
    const Conversation = require('../models/Conversation');
    
    // Préparer le filtre de requête
    const filter = { 
      $or: [
        { participants: userId },
        { createdBy: userId }
      ]
    };
    
    // Ajouter le filtre de statut si spécifié
    if (status) {
      filter.status = status;
    }
    
    // Récupérer les conversations de l'utilisateur
    const conversations = await Conversation.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('participants', 'name email avatar')
      .populate('lastMessage')
      .populate('createdBy', 'name email avatar');
    
    // Compter le nombre total de conversations
    const totalConversations = await Conversation.countDocuments(filter);
    
    logger.info(`[USER CONTROLLER] ${conversations.length} conversations récupérées pour l'utilisateur ${userId}`);
    
    return res.status(200).json({
      success: true,
      data: {
        conversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalConversations,
          pages: Math.ceil(totalConversations / limit)
        }
      }
    });
  } catch (error) {
    logger.error(`[USER CONTROLLER] Erreur lors de la récupération des conversations: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des conversations',
      error: error.message
    });
  }
};

/**
 * Obtenir les appels de l'utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getUserCalls = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;
    
    logger.info(`[USER CONTROLLER] Récupération des appels pour l'utilisateur ${userId}`);
    
    // Récupérer l'utilisateur pour obtenir son entreprise
    const user = await User.findById(userId).populate('company');
    
    if (!user) {
      logger.warn(`[USER CONTROLLER] Utilisateur ${userId} non trouvé`);
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Importer le modèle Call
    const Call = require('../models/Call');
    
    // Préparer le filtre de requête
    const filter = {
      $or: [
        { handledBy: userId },
        { initiatedBy: userId }
      ]
    };
    
    // Ajouter le filtre de statut si spécifié
    if (status) {
      filter.status = status;
    }
    
    // Ajouter les filtres de date si spécifiés
    if (startDate || endDate) {
      filter.createdAt = {};
      
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Récupérer les appels de l'utilisateur
    const calls = await Call.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('customer', 'name email phoneNumber')
      .populate('handledBy', 'name email avatar')
      .populate('initiatedBy', 'name email avatar')
      .populate('voice', 'name language gender');
    
    // Compter le nombre total d'appels
    const totalCalls = await Call.countDocuments(filter);
    
    logger.info(`[USER CONTROLLER] ${calls.length} appels récupérés pour l'utilisateur ${userId}`);
    
    return res.status(200).json({
      success: true,
      data: {
        calls,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCalls,
          pages: Math.ceil(totalCalls / limit)
        }
      }
    });
  } catch (error) {
    logger.error(`[USER CONTROLLER] Erreur lors de la récupération des appels: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des appels',
      error: error.message
    });
  }
};

module.exports = exports; 