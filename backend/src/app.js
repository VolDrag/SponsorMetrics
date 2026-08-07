const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');

const authRoutes = require('./routes/auth.routes');
// ifty
const tierRoutes = require('./routes/tier.routes');
// ifty end

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
// ifty
app.use('/api/tiers', tierRoutes);
// ifty end

module.exports = app;
