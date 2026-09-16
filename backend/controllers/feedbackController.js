const feedbackService = require('../services/feedbackService');

async function submitFeedback(req, res, next) {
  try {
    const { bookingId, rating, comment } = req.body;
    if (!bookingId || !rating) {
      return res.status(400).json({ message: 'bookingId and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'rating must be between 1 and 5' });
    }

    const booking = await feedbackService.getBookingForFeedback(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Order item not found' });
    }
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only review your own orders' });
    }
    if (booking.status !== 'collected') {
      return res.status(400).json({ message: 'You can only review items after collecting your order' });
    }

    await feedbackService.submitFeedback(bookingId, req.user.id, rating, comment);
    res.status(201).json({ message: 'Thanks for your feedback!' });
  } catch (err) {
    next(err);
  }
}

async function getMyFeedback(req, res, next) {
  try {
    const feedback = await feedbackService.getMyFeedback(req.user.id);
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitFeedback, getMyFeedback };
