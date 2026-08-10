require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
// ifty
const tierRoutes = require('./routes/tier.routes');
// ifty end
const matchRoutes = require('./routes/matchRoutes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => { console.error('MongoDB Error:', err.message); process.exit(1); });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
// ifty
app.use('/api/tiers', tierRoutes);
// ifty end
app.use('/api/matches', matchRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
