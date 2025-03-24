const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Toutes les routes d'utilisateur nécessitent une authentification
router.use(authMiddleware.authenticate);

// Routes accessibles aux administrateurs
router.get('/', authMiddleware.isAdmin, userController.getAllUsers);
router.post('/', authMiddleware.isAdmin, userController.createUser);
router.get('/stats', authMiddleware.isAdmin, userController.getUsersStats);
router.post('/:userId/reset-password', authMiddleware.isAdmin, userController.resetUserPassword);
router.delete('/:userId', authMiddleware.isAdmin, userController.deleteUser);
router.patch('/:userId/status', authMiddleware.isAdmin, userController.toggleUserStatus);
router.patch('/:userId/role', authMiddleware.isAdmin, userController.updateUserRole);

// Routes accessibles aux administrateurs d'entreprise
router.get('/company/:companyId', authMiddleware.isCompanyAdmin, userController.getUsersByCompany);
router.get('/byCompany/:companyId', authMiddleware.isCompanyAdmin, userController.getUsersByCompany);

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/me/company', userController.getUserCompany);
router.get('/me/dashboard-stats', userController.getUserDashboardStats);
router.get('/me/activities', userController.getUserActivities);
router.get('/me/conversations', userController.getUserConversations);
router.get('/me/calls', userController.getUserCalls);
router.get('/:userId', userController.getUserById);
router.put('/:userId', userController.updateUser);

module.exports = router; 