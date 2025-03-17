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
 * @route POST /api/auth/logout
 * @desc Déconnecter un utilisateur
 * @access Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route GET /api/auth/me
 * @desc Obtenir les informations de l'utilisateur connecté
 * @access Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route POST /api/auth/refresh-token
 * @desc Rafraîchir le token d'authentification
 * @access Public
 */
router.post('/refresh-token', authController.refreshToken);

module.exports = router; 