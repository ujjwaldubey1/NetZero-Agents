import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from '../config/db.js';
import mongoose from 'mongoose';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from server/.env file
// Go up from scripts/ directory to server/ directory
const envPath = join(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`⚠️  Warning: Could not load .env file from ${envPath}`);
  console.warn(`   Error: ${result.error.message}`);
}

/**
 * Test MongoDB connection
 * Run with: node scripts/testDbConnection.js
 */
const testConnection = async () => {
  console.log('🔍 Testing MongoDB connection...\n');

  // Check if MONGODB_URI is set
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.error('Please set MONGODB_URI in your .env file');
    console.error('Example: MONGODB_URI=mongodb://localhost:27017/netzero-agents');
    process.exit(1);
  }

  // Mask credentials in URI for display
  const maskedUri = process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
  
  console.log('📋 Connection Details:');
  console.log(`   URI: ${maskedUri}\n`);
  
  try {
    // Attempt connection
    console.log('🔄 Attempting connection...');
    await connectDB();

    // Wait a moment for connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify connection status
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    console.log(`\n📊 Connection State: ${states[state] || 'unknown'} (${state})`);

    if (state === 1) {
      console.log('\n✅ MongoDB connection verified successfully!');
      console.log(`📦 Database: ${mongoose.connection.name}`);
      console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
      
      // Test a simple operation
      try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`\n📚 Collections found: ${collections.length}`);
        if (collections.length > 0) {
          console.log('   Collections:');
          collections.forEach(col => {
            console.log(`   - ${col.name}`);
          });
        } else {
          console.log('   (No collections yet - database is empty)');
        }
      } catch (err) {
        console.log('⚠️  Could not list collections:', err.message);
      }

      // Close connection
      await mongoose.connection.close();
      console.log('\n✅ Connection test completed successfully');
      console.log('   Connection closed gracefully');
      process.exit(0);
    } else {
      console.error(`\n❌ MongoDB connection not established`);
      console.error(`   Current state: ${states[state]} (${state})`);
      console.error('\n💡 Troubleshooting tips:');
      console.error('   1. Check if MongoDB is running');
      console.error('   2. Verify MONGODB_URI in .env file is correct');
      console.error('   3. Check network connectivity');
      console.error('   4. Verify MongoDB credentials if using authentication');
      process.exit(1);
    }

  } catch (err) {
    console.error('\n❌ Connection test failed:');
    console.error(`   Error: ${err.message}`);
    if (err.stack) {
      console.error('\nStack trace:');
      console.error(err.stack);
    }
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

testConnection();
