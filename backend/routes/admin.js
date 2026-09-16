const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.use(auth, requireRole('admin'));

router.post('/collect', adminController.collectTicket);
router.get('/counter-load', adminController.getCounterLoad);
router.get('/daily-sales', adminController.getDailySales);
router.get('/sales-summary', adminController.getSalesSummary);
router.get('/orders', adminController.getAllOrders);
router.get('/feedback', adminController.getAllFeedback);

router.get('/menu-items', adminController.getAllMenuItems);
router.post('/menu-items', adminController.createMenuItem);
router.patch('/menu-items/:id', adminController.updateMenuItem);
router.delete('/menu-items/:id', adminController.deleteMenuItem);

module.exports = router;
