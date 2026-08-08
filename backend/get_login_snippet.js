const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./src/models/User');
require('dotenv').config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

async function loginTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ role: 'organizer' }).sort({ createdAt: -1 });
    if (!user) {
      console.log('No test user found');
      return;
    }
    
    const token = generateToken(user._id);
    const safeUser = { ...user.toObject() };
    delete safeUser.password;
    
    console.log('\n--- PASTE THIS IN YOUR BROWSER CONSOLE ---');
    console.log(`localStorage.setItem('token', '${token}');`);
    console.log(`localStorage.setItem('user', JSON.stringify(${JSON.stringify(safeUser)}));`);
    console.log(`window.location.href = '/organizer/events/123/matches';`);
    console.log('------------------------------------------\n');
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

loginTestUser();
