const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function testRegister() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const user = await User.create({
      name: 'Test User',
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
      role: 'organizer',
      organizationName: 'NSU CSE Club',
      organizationType: 'university_club',
      phone: '+8801234567891',
      isVerified: true,
    });

    console.log('User created successfully:', user._id);
  } catch (error) {
    console.error('ERROR OCCURRED:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testRegister();
