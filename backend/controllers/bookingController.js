const bookingService = require('../services/bookingService');

async function getMenu(req, res, next) {
  try {
    const menu = await bookingService.getMenu();
    res.json({ menu });
  } catch (err) {
    next(err);
  }
}

async function createOrder(req, res, next) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items must be a non-empty array of { menuItemId, quantity }' });
    }

    const normalized = items.map((i) => ({
      menu_item_id: i.menuItemId,
      quantity: i.quantity,
    }));

    const result = await bookingService.placeOrder(req.user.id, normalized);
    res.status(201).json({
      message: `Order placed! Pickup at ${result.counter_name} at ${result.pickup_time}.`,
      ticket: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const orders = await bookingService.getMyOrders(req.user.id);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

async function cancelOrder(req, res, next) {
  try {
    const orderId = req.params.id;
    const order = await bookingService.getOrderOwner(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only cancel your own orders' });
    }

    await bookingService.cancelOrder(orderId);
    res.json({ message: 'Order cancelled and refunded to your wallet.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMenu, createOrder, getMyOrders, cancelOrder };
