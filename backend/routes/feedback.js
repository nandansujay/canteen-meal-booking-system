const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const auth = require('../middleware/auth');

router.post('/', auth, feedbackController.submitFeedback);
router.get('/my', auth, feedbackController.getMyFeedback);

module.exports = router;
