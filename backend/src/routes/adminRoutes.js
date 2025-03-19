const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize, adminAccess, adminDashboardAccess } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Récupérer les statistiques pour le tableau de bord admin
 * @access  Private/Admin
 */
router.get('/dashboard/stats', adminAccess, adminController.getDashboardStats);

/**
 * @route   GET /api/admin/system/stats
 * @desc    Récupérer les statistiques système
 * @access  Private/Admin
 */
router.get('/system/stats', adminAccess, adminController.getSystemStats);

/**
 * @route   GET /api/admin/system/logs
 * @desc    Récupérer les logs système
 * @access  Private/Admin
 */
router.get('/system/logs', adminAccess, adminController.getSystemLogs);

module.exports = router; 