# Block Storage File Upload System

## 📁 Folder Structure

Files are stored in the following structure:

```
server/blockStorage/
  └── {datacenterId}/
        └── {year-quarter}/      # e.g. 2025-Q1
              ├── staff/
              │     └── {staffId}/
              │           ├── scope1/
              │           └── scope2/
              │
              └── vendor/
                    └── {vendorId}/
                          └── scope3/
```

## 📋 Upload Rules

### STAFF Uploads
- **Allowed Scopes:** `scope1`, `scope2` only
- **Allowed File Types:** PDF (`.pdf`), Excel (`.xls`, `.xlsx`)
- **File Size Limit:** 50 MB
- **CANNOT upload scope3**

### VENDOR Uploads
- **Allowed Scope:** `scope3` only
- **Allowed File Types:** PDF, Excel, CSV, ZIP, Images (`.jpg`, `.png`)
- **File Size Limit:** 50 MB
- **Any number of files allowed**

## 🔌 API Endpoints

### 1. Staff File Upload

**Endpoint:** `POST /api/upload/staff`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body (form-data):**
- `file` (file, required): File to upload
- `scope` (string, required): `"scope1"` or `"scope2"`
- `period` (string, optional): Period in format `"YYYY-QN"` (e.g., `"2025-Q1"`). Defaults to current quarter.
- `datacenterId` (string, optional): Data center ID. If not provided, uses user's default datacenter.

**Example Request (cURL):**
```bash
curl -X POST http://localhost:4000/api/upload/staff \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/report.pdf" \
  -F "scope=scope1" \
  -F "period=2025-Q1" \
  -F "datacenterId=692ac0a10d948cf0fe448716"
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "filename": "1234567890-987654321.pdf",
    "originalName": "report.pdf",
    "storedPath": "692ac0a10d948cf0fe448716/2025-Q1/staff/staffId123/scope1/1234567890-987654321.pdf",
    "mimetype": "application/pdf",
    "size": 1024000,
    "uploadedAt": "2025-01-15T10:30:00.000Z",
    "scope": "scope1",
    "datacenterId": "692ac0a10d948cf0fe448716",
    "period": "2025-Q1"
  },
  "report": {
    "id": "reportId123",
    "facilityId": "692ac0a10d948cf0fe448716",
    "period": "2025-Q1",
    "scope": "scope1",
    "fileCount": 1
  }
}
```

### 2. Vendor File Upload

**Endpoint:** `POST /api/upload/vendor`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body (form-data):**
- `file` (file, required): File to upload
- `period` (string, optional): Period in format `"YYYY-QN"` (e.g., `"2025-Q1"`). Defaults to current quarter.
- `datacenterId` (string, optional): Data center ID. If not provided, uses user's default datacenter.

**Example Request (cURL):**
```bash
curl -X POST http://localhost:4000/api/upload/vendor \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/scope3-data.xlsx" \
  -F "period=2025-Q1" \
  -F "datacenterId=692ac0a10d948cf0fe448716"
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "filename": "1234567890-987654321.xlsx",
    "originalName": "scope3-data.xlsx",
    "storedPath": "692ac0a10d948cf0fe448716/2025-Q1/vendor/vendorId123/scope3/1234567890-987654321.xlsx",
    "mimetype": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "size": 2048000,
    "uploadedAt": "2025-01-15T10:30:00.000Z",
    "scope": "scope3",
    "datacenterId": "692ac0a10d948cf0fe448716",
    "period": "2025-Q1"
  },
  "vendorScope": {
    "id": "vendorScopeId123",
    "facilityId": "692ac0a10d948cf0fe448716",
    "period": "2025-Q1",
    "status": "submitted",
    "fileCount": 1
  }
}
```

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid scope",
  "message": "Staff can only upload scope1 or scope2 files."
}
```

### 400 File Too Large
```json
{
  "error": "File too large",
  "message": "File size exceeds the maximum limit of 50 MB."
}
```

### 400 Invalid File Type
```json
{
  "error": "Upload validation failed",
  "message": "Invalid file type. Staff can only upload PDF (.pdf) or Excel (.xls, .xlsx) files."
}
```

### 500 Server Error
```json
{
  "error": "Upload failed",
  "message": "Error description here"
}
```

## 📦 MongoDB Storage

### Report Model
Files are stored in the `Report` model:
- `scope1Files[]` - Array of file metadata for scope1
- `scope2Files[]` - Array of file metadata for scope2

Each file entry contains:
```javascript
{
  filename: String,        // Generated unique filename
  storedPath: String,      // Relative path from blockStorage root
  uploadedAt: Date,        // Upload timestamp
  type: String,            // MIME type
  originalName: String,    // Original filename
  size: Number            // File size in bytes
}
```

### VendorScope Model
Files are stored in the `VendorScope` model:
- `scope3Files[]` - Array of file metadata for scope3

Same structure as Report file entries.

## 🔧 Implementation Details

### Automatic Folder Creation
- Folders are created automatically before file upload
- Folder names are sanitized (special characters removed)
- Nested structure is created recursively

### File Naming
- Files are renamed with timestamp and random number
- Original filename is preserved in metadata
- Format: `{timestamp}-{random}.{ext}`

### Period Handling
- If period is not provided, defaults to current quarter
- Period format: `YYYY-QN` (e.g., `2025-Q1`)
- Automatically calculates quarter from date if needed

### Data Center Resolution
- If `datacenterId` is provided, validates user has access
- If not provided, uses user's default datacenter
- Validates based on user role (operator, vendor, staff)

## 📝 Example Usage

### JavaScript/Node.js
```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const form = new FormData();
form.append('file', fs.createReadStream('/path/to/file.pdf'));
form.append('scope', 'scope1');
form.append('period', '2025-Q1');

const response = await axios.post('http://localhost:4000/api/upload/staff', form, {
  headers: {
    ...form.getHeaders(),
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

console.log(response.data);
```

### Python
```python
import requests

url = 'http://localhost:4000/api/upload/staff'
headers = {'Authorization': 'Bearer YOUR_TOKEN'}
files = {'file': open('/path/to/file.pdf', 'rb')}
data = {
    'scope': 'scope1',
    'period': '2025-Q1'
}

response = requests.post(url, headers=headers, files=files, data=data)
print(response.json())
```

## 🛠️ Utility Functions

### Date Utilities (`server/utils/dateUtils.js`)
- `getQuarterFromDate(date)` - Get quarter string from date
- `getCurrentQuarter()` - Get current quarter
- `parsePeriod(period)` - Parse period string
- `isValidPeriod(period)` - Validate period format

### Folder Utilities (`server/utils/folderUtils.js`)
- `buildStaffFolderPath(params)` - Build staff folder path
- `buildVendorFolderPath(params)` - Build vendor folder path
- `createStaffUploadFolder(params)` - Create staff upload folder
- `createVendorUploadFolder(params)` - Create vendor upload folder
- `sanitizeFolderName(name)` - Sanitize folder name
- `ensureFolderExists(path)` - Ensure folder exists

## 🔐 Security Features

- Role-based access control (staff/vendor only)
- File type validation
- Scope validation
- File size limits (50 MB)
- Folder name sanitization
- Data center access validation
- Audit logging for all uploads

## 📊 Audit Logging

All uploads are automatically logged in the `AuditLog` collection:
- File metadata
- User information
- Timestamp
- Entity IDs
- File paths

## 🚀 Next Steps

1. **File Retrieval:** Implement endpoints to download files
2. **File Deletion:** Implement endpoints to delete files
3. **File Listing:** Implement endpoints to list uploaded files
4. **IPFS Integration:** Optional IPFS upload after block storage
5. **File Processing:** Integrate with AI extraction service

