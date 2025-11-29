import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import EmissionRecord from '../models/EmissionRecord.js';
import Report from '../models/Report.js';
import { computeTotals } from '../utils/emissionFactors.js';

dotenv.config();

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) {
  console.error('Please set MONGODB_URI in .env before seeding.');
  process.exit(1);
}

const period = '2025-Q4';

const seed = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Admin/operator
  const operatorEmail = 'operator@demo.com';
  const vendorEmail = 'vendor@demo.com';
  const staffEmail = 'staff@demo.com';

  const operator = await User.findOneAndUpdate(
    { email: operatorEmail },
    {
      email: operatorEmail,
      role: 'operator',
      passwordHash: await bcrypt.hash('password123', 10),
      organizationName: 'Demo DC Operator',
    },
    { upsert: true, new: true }
  );

  const vendor = await User.findOneAndUpdate(
    { email: vendorEmail },
    {
      email: vendorEmail,
      role: 'vendor',
      passwordHash: await bcrypt.hash('password123', 10),
      vendorName: 'Green Supply Co',
    },
    { upsert: true, new: true }
  );

  await User.findOneAndUpdate(
    { email: staffEmail },
    {
      email: staffEmail,
      role: 'staff',
      passwordHash: await bcrypt.hash('password123', 10),
    },
    { upsert: true, new: true }
  );

  await EmissionRecord.deleteMany({ period });

  const records = await EmissionRecord.insertMany([
    {
      ownerType: 'operator',
      ownerId: operator._id,
      scope: 1,
      period,
      dataCenterName: 'demo-dc',
      folderRef: 'demo-dc/seed',
      sectionRef: 'section1',
      extractedData: {
        scope1: {
          diesel_liters: 1200,
          diesel_co2_tons: 3.22,
          refrigerant_kg: 10,
          refrigerant_co2_tons: 13,
        },
      },
      aiSummary: 'Seed scope 1 data',
      aiAnomalies: [],
    },
    {
      ownerType: 'operator',
      ownerId: operator._id,
      scope: 2,
      period,
      dataCenterName: 'demo-dc',
      folderRef: 'demo-dc/seed',
      sectionRef: 'section2',
      extractedData: {
        scope2: {
          electricity_kwh: 180000,
          electricity_co2_tons: 72,
        },
      },
      aiSummary: 'Seed scope 2 data',
      aiAnomalies: [],
    },
    {
      ownerType: 'vendor',
      ownerId: vendor._id,
      scope: 3,
      period,
      dataCenterName: 'demo-dc',
      folderRef: 'demo-dc/seed',
      sectionRef: 'section3',
      extractedData: {
        scope3: {
          upstream_co2_tons: 25,
        },
      },
      aiSummary: 'Seed scope 3 data from vendor',
      aiAnomalies: [],
    },
  ]);

  const totals = computeTotals(records);

  await Report.findOneAndUpdate(
    { ownerId: operator._id, period },
    {
      ownerId: operator._id,
      period,
      scopeTotals: totals,
      details: { records: records.map((r) => r._id) },
      status: 'draft',
    },
    { upsert: true, new: true }
  );

  console.log('Seed complete.');
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
