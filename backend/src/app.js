const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');

const authRoutes = require('./routes/auth.routes');
const proposalRoutes = require('./routes/proposalRoutes'); //Anupam

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use('/api/proposals', proposalRoutes); //Anupam

app.use('/api/auth', authRoutes);

module.exports = app;
