# Vendor Upload Flow

## Step 1: Frontend Upload
When a vendor uploads a file through the UI:

```mermaid
graph TD
    A[Vendor selects file] --> B[UploadForm component]
    B --> C[POST request to /api/emissions/upload]
    C --> D[FormData with file, scope, period]
```

The frontend uses a form with:
- File input (PDF/Excel)
- Scope selection (1, 2, or 3)
- Period selection (e.g., 2025-Q4)

## Step 2: Backend Processing
The server receives the upload and processes it:

```mermaid
graph TD
    E[Server receives upload] --> F[Multer middleware]
    F --> G[Save file to uploads directory]
    G --> H[Move to structured path]
    H --> I[aiExtractor service]
```

### File Storage Structure
```
server/_emissionData/
└── dataCenterName/
    └── period-1764269762118/
        └── section1/
            └── original_filename.pdf
```

## Step 3: AI Extraction
The aiExtractor service processes the file based on MIME type:

```mermaid
graph TD
    J[aiExtractor service] --> K{File Type}
    K -->|PDF| L[pdf-parse library]
    K -->|Excel| M[xlsx library]
    K -->|CSV| N[Direct text reading]
    L --> O[Extract text content]
    M --> O
    N --> O
    O --> P[LLM processing]
```

## Step 4: Data Processing
The extracted text is processed by an LLM to extract emissions data:

```mermaid
graph TD
    P[LLM processing] --> Q[Extraction prompt]
    Q --> R[Structured JSON output]
    R --> S[Compute CO2e values]
    S --> T[Check thresholds]
    T --> U[Identify anomalies]
```

## Step 5: Database Storage
The processed data is saved to the database:

```mermaid
graph TD
    U[Anomaly detection] --> V[EmissionRecord creation]
    V --> W[Save to MongoDB]
    W --> X[Return response to frontend]
```

## Complete Flow
```mermaid
graph TD
    A[Vendor uploads file] --> B[Frontend sends POST request]
    B --> C[Backend receives upload]
    C --> D[Store in structured directory]
    D --> E[Extract text content]
    E --> F[Process with LLM]
    F --> G[Structure emissions data]
    G --> H[Calculate CO2e]
    H --> I[Check against thresholds]
    I --> J[Create database record]
    J --> K[Return structured data]
    K --> L[Display on dashboard]
```

## Key Components
- **Multer**: Handles file uploads and storage
- **pdf-parse**: Extracts text from PDF files
- **xlsx**: Parses Excel/Spreadsheet files
- **OpenAI LLM**: Extracts structured emissions data from text
- **EmissionRecord model**: Stores the processed data in MongoDB
