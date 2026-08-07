require('dotenv').config();

const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes');
const proposalRoutes = require('./routes/proposalRoutes');

const app = express();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/proposals', proposalRoutes);

module.exports = app;