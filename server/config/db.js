import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from server/.env file
const envPath = join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // Validate MONGODB_URI is provided
  if (!uri) {
    console.error('❌ MONGODB_URI missing. Please set in .env file');
    console.error('Example: MONGODB_URI=mongodb://localhost:27017/netzero-agents');
    return;
  }

  try {
    // MongoDB connection options
    // Note: useNewUrlParser and useUnifiedTopology are deprecated in Mongoose 6+
    // but included as requested for compatibility
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // Connect to MongoDB
    const connection = await mongoose.connect(uri, options);

    // Extract database name from connection
    const dbName = connection.connection.name;

    // Log successful connection
    console.log('✅ MongoDB connected');
    console.log(`📦 Database: ${dbName}`);
    console.log(`🔗 Host: ${connection.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return connection;

  } catch (err) {
    // Log detailed error information without crashing the app
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', err.message);
    
    if (err.name === 'MongoServerError') {
      console.error('Server Error:', err.message);
    } else if (err.name === 'MongooseServerSelectionError') {
      console.error('Server Selection Error:', err.message);
      console.error('💡 Tip: Check if MongoDB is running and accessible');
    } else {
      console.error('Error details:', err);
    }
    
    // Log error but don't exit - allows app to continue in development
    // In production, you may want to implement retry logic or exit
    console.warn('⚠️  Application continuing without database connection');
    throw err; // Re-throw for test scripts that want to catch it
  }
};

export default connectDB;
