const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

/**
 * @route POST /api/auth/register
 * @desc Enregistrer un nouvel utilisateur
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @desc Connecter un utilisateur
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/forgot-password
 * @desc Envoyer un email pour réinitialiser le mot de passe
 * @access Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route PUT /api/auth/reset-password/:token
 * @desc Réinitialiser le mot de passe
 * @access Public
 */
router.put('/reset-password/:token', authController.resetPassword);

/**
 * @route GET /api/auth/me
 * @desc Obtenir les informations de l'utilisateur connecté
 * @access Private
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @route POST /api/auth/logout
 * @desc Déconnecter un utilisateur
 * @access Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route PUT /api/auth/profile
 * @desc Mettre à jour le profil de l'utilisateur
 * @access Private
 */
router.put('/profile', authenticate, authController.updateProfile);

/**
 * @route PUT /api/auth/password
 * @desc Mettre à jour le mot de passe de l'utilisateur
 * @access Private
 */
router.put('/password', authenticate, authController.updatePassword);

/**
 * @route POST /api/auth/refresh-token
 * @desc Rafraîchir le token JWT
 * @access Public
 */
router.post('/refresh-token', authController.refreshToken);

// La route refresh-token sera implémentée plus tard

module.exports = router; 