const walletService = require('../services/walletService');

async function getBalance(req, res, next) {
  try {
    const wallet = await walletService.getBalance(req.user.id);
    res.json(wallet);
  } catch (err) {
    next(err);
  }
}

async function recharge(req, res, next) {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ message: 'amount is required' });
    }

    const wallet = await walletService.recharge(req.user.id, amount);
    res.json({ message: `Wallet recharged with ₹${amount}.`, wallet });
  } catch (err) {
    next(err);
  }
}

async function getTransactions(req, res, next) {
  try {
    const transactions = await walletService.getTransactions(req.user.id);
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
}

module.exports = { getBalance, recharge, getTransactions };
