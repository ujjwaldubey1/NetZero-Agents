import fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

const envContent = `# MongoDB Database Configuration
MONGODB_URI=mongodb://localhost:27017/netzero-agents

# Server Configuration
PORT=4000
NODE_ENV=development
CORS_ORIGIN=*

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI API Configuration (optional)
OPENAI_API_KEY=

# Email Configuration (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=no-reply@netzero.local
`;

try {
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists at:', envPath);
    console.log('   Skipping creation. Edit it manually if needed.');
  } else {
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ .env file created successfully at:', envPath);
    console.log('\n📝 Created with default values:');
    console.log('   MONGODB_URI=mongodb://localhost:27017/netzero-agents');
    console.log('   PORT=4000');
    console.log('\n💡 Edit server/.env to customize your configuration');
  }
} catch (err) {
  console.error('❌ Error creating .env file:', err.message);
  process.exit(1);
}

