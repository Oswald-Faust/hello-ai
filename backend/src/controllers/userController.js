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

module.exports = exports; 