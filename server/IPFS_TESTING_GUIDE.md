# IPFS (Pinata) Testing Guide

This guide will help you test the IPFS file upload and retrieval functionality using Pinata.

## Prerequisites

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure Pinata credentials in `.env`:**
   ```env
   # Option 1: Use JWT (Recommended for free tier)
   PINATA_JWT=your_pinata_jwt_token_here
   
   # Option 2: Use API Key + Secret (Alternative)
   PINATA_API_KEY=your_pinata_api_key
   PINATA_SECRET_KEY=your_pinata_secret_key
   ```

   **How to get Pinata credentials:**
   - Sign up at [https://www.pinata.cloud/](https://www.pinata.cloud/)
   - Navigate to API Keys in your dashboard
   - Create a new API key
   - Copy your JWT token (recommended) or API Key + Secret

3. **Start your server:**
   ```bash
   npm start
   # or
   npm run dev
   ```

## Testing Routes

### 1. Health Check
**GET** `/api/ipfs/health`

Check if IPFS service is configured and ready.

**Example Response:**
```json
{
  "success": true,
  "service": "Pinata IPFS",
  "configured": true,
  "authMethod": "JWT",
  "message": "IPFS service is configured and ready"
}
```

---

### 2. Upload File to IPFS
**POST** `/api/ipfs/upload`

Upload a file directly to IPFS via Pinata.

**Request:**
- **Method:** POST
- **Content-Type:** multipart/form-data
- **Body:**
  - `file` (required): File to upload (PDF, Excel, Images, etc.) - Max 50MB
  - `fileName` (optional): Custom filename

**Example Response:**
```json
{
  "success": true,
  "message": "File uploaded to IPFS successfully",
  "data": {
    "cid": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    "ipfsUrl": "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    "size": 1024000,
    "fileName": "report.pdf"
  }
}
```

**Save the CID** - you'll need it to retrieve the file later!

---

### 3. Get IPFS File Info
**GET** `/api/ipfs/info/:cid`

Get metadata about an IPFS file without downloading it.

**Example Request:**
```
GET /api/ipfs/info/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
```

**Example Response:**
```json
{
  "success": true,
  "cid": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "ipfsUrl": "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "message": "Use GET /api/ipfs/retrieve/:cid to download the file"
}
```

---

### 4. Retrieve File from IPFS
**GET** `/api/ipfs/retrieve/:cid`

Download a file from IPFS by CID.

**Example Request:**
```
GET /api/ipfs/retrieve/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG?download=true
```

**Query Parameters:**
- `download` (optional): `true` to force download, `false` for inline display

**Response:** The file will be downloaded to your computer.

---

### 5. Upload File from Filesystem
**POST** `/api/ipfs/upload-file` (Requires Authentication)

Upload an existing file from the server filesystem to IPFS.

**Request:**
- **Method:** POST
- **Content-Type:** application/json
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "filePath": "server/uploads/example.pdf",
    "fileName": "custom-name.pdf"
  }
  ```

**Example Response:**
```json
{
  "success": true,
  "message": "File uploaded to IPFS successfully",
  "data": {
    "cid": "...",
    "ipfsUrl": "ipfs://...",
    "gatewayUrl": "https://gateway.pinata.cloud/ipfs/...",
    "size": 1024000,
    "fileName": "custom-name.pdf"
  }
}
```

## Testing with Postman

1. **Import the Postman Collection:**
   - Open Postman
   - Import `server/NetZero_Agents.postman_collection.json`
   - Set the `baseUrl` variable to `http://localhost:4000`

2. **Test Steps:**
   - **Step 1:** Run "IPFS Health Check" to verify configuration
   - **Step 2:** Run "Upload File to IPFS" - select a test file
   - **Step 3:** The CID is automatically saved to `lastIPFSCid` variable
   - **Step 4:** Run "Get IPFS File Info" using the saved CID
   - **Step 5:** Run "Retrieve File from IPFS" to download the file

## Testing with cURL

### Health Check
```bash
curl http://localhost:4000/api/ipfs/health
```

### Upload File
```bash
curl -X POST \
  http://localhost:4000/api/ipfs/upload \
  -F "file=@/path/to/your/file.pdf" \
  -F "fileName=test-file.pdf"
```

### Get File Info
```bash
curl http://localhost:4000/api/ipfs/info/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
```

### Retrieve File
```bash
curl http://localhost:4000/api/ipfs/retrieve/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG \
  -o downloaded-file.pdf
```

## Error Handling

### Common Errors:

1. **"Pinata credentials not configured"**
   - **Solution:** Add `PINATA_JWT` or `PINATA_API_KEY`/`PINATA_SECRET_KEY` to your `.env` file

2. **"Pinata authentication failed"**
   - **Solution:** Check your credentials are correct and your Pinata account is active

3. **"File too large"**
   - **Solution:** File size limit is 50MB. Use a smaller file or upgrade your Pinata plan.

4. **"IPFS service unavailable"**
   - **Solution:** Check your internet connection and Pinata service status

## Integration with Existing Routes

The IPFS service can be integrated with your existing file upload routes. After a file is uploaded to block storage, you can:

1. Read the file from the filesystem
2. Upload it to IPFS
3. Store the CID in your Report or VendorScope model

Example:
```javascript
import { uploadToIPFS } from '../services/ipfs.service.js';
import fs from 'fs/promises';

// After file is stored locally
const fileBuffer = await fs.readFile(filePath);
const ipfsResult = await uploadToIPFS(fileBuffer, fileName);

// Store CID in your model
report.ipfsLinks[scope] = {
  cid: ipfsResult.cid,
  ipfsUrl: ipfsResult.ipfsUrl,
  gatewayUrl: ipfsResult.gatewayUrl,
  uploadedAt: new Date(),
};
```

## Next Steps

1. ✅ Test basic upload and retrieval
2. ✅ Integrate IPFS upload with existing file upload workflows
3. ✅ Store IPFS CIDs in Report and VendorScope models
4. ✅ Add IPFS links to blockchain metadata
5. ✅ Display IPFS gateway URLs in frontend dashboard

Happy testing! 🚀

