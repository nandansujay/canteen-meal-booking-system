require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const bookingRoutes = require('./routes/bookings');
const walletRoutes = require('./routes/wallet');
const adminRoutes = require('./routes/admin');
const feedbackRoutes = require('./routes/feedback');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// Rate limiting only guards auth endpoints (brute-force login/register protection).
// General browsing/polling endpoints (menu, wallet, admin dashboards) are not
// attack surfaces here and would otherwise get throttled by normal app usage.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/auth', authLimiter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use(errorHandler);

module.exports = app;
