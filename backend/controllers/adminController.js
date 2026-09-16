const adminService = require('../services/adminService');

async function collectTicket(req, res, next) {
  try {
    const { ticketToken } = req.body;
    if (!ticketToken) {
      return res.status(400).json({ message: 'ticketToken is required' });
    }

    const order = await adminService.collectTicket(ticketToken);
    res.json({ message: 'Ticket verified. Order collected.', order });
  } catch (err) {
    next(err);
  }
}

async function getCounterLoad(req, res, next) {
  try {
    const counters = await adminService.getCounterLoad();
    res.json({ counters });
  } catch (err) {
    next(err);
  }
}

async function getDailySales(req, res, next) {
  try {
    const sales = await adminService.getDailySales();
    res.json({ sales });
  } catch (err) {
    next(err);
  }
}

async function getSalesSummary(req, res, next) {
  try {
    const summary = await adminService.getSalesSummary();
    res.json({ summary });
  } catch (err) {
    next(err);
  }
}

async function getAllOrders(req, res, next) {
  try {
    const orders = await adminService.getAllOrders();
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

async function getAllMenuItems(req, res, next) {
  try {
    const items = await adminService.getAllMenuItems();
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

async function createMenuItem(req, res, next) {
  try {
    const { name, description, image_url, category, price, capacity } = req.body;
    if (!name || !category || !price || !capacity) {
      return res.status(400).json({ message: 'name, category, price, and capacity are required' });
    }

    const id = await adminService.createMenuItem({ name, description, image_url, category, price, capacity });
    res.status(201).json({ message: 'Menu item created.', id });
  } catch (err) {
    next(err);
  }
}

async function updateMenuItem(req, res, next) {
  try {
    await adminService.updateMenuItem(req.params.id, req.body);
    res.json({ message: 'Menu item updated.' });
  } catch (err) {
    next(err);
  }
}

async function deleteMenuItem(req, res, next) {
  try {
    await adminService.deleteMenuItem(req.params.id);
    res.json({ message: 'Menu item deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  collectTicket,
  getCounterLoad,
  getDailySales,
  getSalesSummary,
  getAllOrders,
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
