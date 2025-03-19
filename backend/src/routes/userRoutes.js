const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Toutes les routes d'utilisateur nécessitent une authentification
router.use(authMiddleware.authenticate);

// Routes accessibles aux administrateurs globaux
router.get('/', authMiddleware.isAdmin, userController.getAllUsers);
router.post('/:userId/reset-password', authMiddleware.isAdmin, userController.resetUserPassword);
router.delete('/:userId', authMiddleware.isAdmin, userController.deleteUser);

// Routes accessibles aux administrateurs d'entreprise
router.get('/company/:companyId', authMiddleware.isCompanyAdmin, userController.getUsersByCompany);

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/:userId', userController.getUserById);
router.put('/:userId', userController.updateUser);

module.exports = router; 