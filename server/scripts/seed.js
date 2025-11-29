import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
dotenv.config();

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) {
  console.error('Please set MONGODB_URI in .env before seeding.');
  process.exit(1);
}

const seed = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Admin/operator
  const operatorEmail = 'imranpasha8225+operator@gmail.com';

  await User.findOneAndUpdate(
    { email: operatorEmail },
    {
      email: operatorEmail,
      role: 'operator',
      passwordHash: await bcrypt.hash('password123', 10),
      organizationName: 'Demo DC Operator',
    },
    { upsert: true, new: true }
  );

  console.log('Operator upsert complet.');
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
