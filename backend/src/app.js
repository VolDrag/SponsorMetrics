const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });
const http = require('http');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { initSentry, setupSentryErrorHandler, captureError } = require('./middleware/sentry');
const { blockNonImageUploads } = require('./middleware/upload');
const { initSocket } = require('./realtime');

initSentry();

const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const tierRoutes = require('./routes/tier.routes');
const proposalRoutes = require('./routes/proposalRoutes');
const matchRoutes = require('./routes/matchRoutes');
const campaignRoutes = require('./routes/campaign.routes');
const reviewRoutes = require('./routes/review.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const budgetRoutes = require('./routes/budget.routes');
const experimentRoutes = require('./routes/experiment.routes');
const volunteerRoutes = require('./routes/volunteer.routes');
const reportRoutes = require('./routes/report.routes');
const marketingRoutes = require('./routes/marketing.routes');
const paymentRoutes = require('./routes/payment.routes');
const contractRoutes = require('./routes/contract.routes');
const adminRoutes = require('./routes/admin.routes');
const disputeRoutes = require('./routes/dispute.routes');
const notificationRoutes = require('./routes/notification.routes');
const teamRoutes = require('./routes/team.routes');
const verificationRoutes = require('./routes/verification.routes');

const app = express();
app.set('trust proxy', 1);

app.use(cors({
  origin: (origin, callback) => callback(null, origin || true),
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use('/uploads', blockNonImageUploads, express.static(path.join(__dirname, '../uploads')));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tiers', tierRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/verification', verificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

setupSentryErrorHandler(app);

app.use((err, req, res, _next) => {
  console.error(err.stack);
  captureError(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  try {
    require('./services/whitelabel.service').startScheduler();
  } catch (error) {
    console.warn('[white-label] scheduler skipped', error.message);
  }
});

module.exports = app;
