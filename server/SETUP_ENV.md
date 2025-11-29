# Environment Setup Instructions

## Quick Fix for MONGODB_URI Error

If you're seeing `❌ MONGODB_URI not found in environment variables`, follow these steps:

### Option 1: Create .env file manually

1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Create a `.env` file with this content:
   ```env
   MONGODB_URI=mongodb://localhost:27017/netzero-agents
   ```

### Option 2: Use PowerShell (Windows)

```powershell
cd server
echo MONGODB_URI=mongodb://localhost:27017/netzero-agents > .env
```

### Option 3: Copy from example

```bash
cd server
cp .env.example .env
# Then edit .env and set your MONGODB_URI
```

## Full .env Template

For a complete setup, your `server/.env` file should contain:

```env
# MongoDB Database Configuration
MONGODB_URI=mongodb://localhost:27017/netzero-agents

# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI API (optional - for AI features)
OPENAI_API_KEY=

# Email Configuration (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

## Verify Setup

After creating the `.env` file, test the connection:

```bash
cd server
node scripts/testDbConnection.js
```

You should see:
```
✅ MongoDB connected
📦 Database: netzero-agents
```

## Troubleshooting

1. **Make sure MongoDB is running**
   - Local: `mongod` or start MongoDB service
   - Cloud: Use MongoDB Atlas connection string

2. **Check .env file location**
   - Must be in `server/.env` (not root directory)

3. **Verify file format**
   - No spaces around the `=` sign
   - No quotes around values (unless required)

4. **For MongoDB Atlas**, use format:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/netzero-agents?retryWrites=true&w=majority
   ```

