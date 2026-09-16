const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

router.post('/', auth, bookingController.createOrder);
router.get('/my', auth, bookingController.getMyOrders);
router.post('/:id/cancel', auth, bookingController.cancelOrder);

module.exports = router;
