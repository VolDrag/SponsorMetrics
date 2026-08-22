require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const tierRoutes = require('./routes/tier.routes');
const proposalRoutes = require('./routes/proposalRoutes'); // MODULE 2 | Features 1, 2, 4
const matchRoutes = require('./routes/matchRoutes');
const campaignRoutes = require('./routes/campaign.routes'); // MODULE 2 | Feature 3 + Event Editing
const reviewRoutes = require('./routes/review.routes'); // MODULE 3 | Feature 1
const analyticsRoutes = require('./routes/analytics.routes'); // MODULE 3 | Feature 2
const budgetRoutes = require('./routes/budget.routes'); // MODULE 3 | Feature 3
const experimentRoutes = require('./routes/experiment.routes'); // MODULE 3 | Feature 4
const volunteerRoutes = require('./routes/volunteer.routes'); // MODULE 4 | Feature 1
const reportRoutes = require('./routes/report.routes'); // MODULE 4 | Feature 2
const marketingRoutes = require('./routes/marketing.routes'); // MODULE 4 | Feature 4

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin || true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// MODULE 2 | Feature 3 Event Editing — serve locally uploaded campaign photos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tiers', tierRoutes);
app.use('/api/proposals', proposalRoutes); // MODULE 2 | Features 1, 2, 4
app.use('/api/matches', matchRoutes);
app.use('/api/campaigns', campaignRoutes); // MODULE 2 | Feature 3 + Event Editing
app.use('/api/reviews', reviewRoutes); // MODULE 3 | Feature 1
app.use('/api/analytics', analyticsRoutes); // MODULE 3 | Feature 2
app.use('/api/budgets', budgetRoutes); // MODULE 3 | Feature 3
app.use('/api/experiments', experimentRoutes); // MODULE 3 | Feature 4
app.use('/api/volunteers', volunteerRoutes); // MODULE 4 | Feature 1
app.use('/api/reports', reportRoutes); // MODULE 4 | Feature 2
app.use('/api/marketing', marketingRoutes); // MODULE 4 | Feature 4

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;