const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const auth = require('../middleware/auth');

router.get('/balance', auth, walletController.getBalance);
router.post('/recharge', auth, walletController.recharge);
router.get('/transactions', auth, walletController.getTransactions);

module.exports = router;
