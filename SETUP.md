# Business Monitoring ERP - Setup Instructions

## Project Structure
The project follows the structure outlined in the README.md but adapted for Next.js:

```
limozin/
├── backend/                 # Express.js backend (optional)
│   ├── server.js
│   ├── routes/
│   │   └── records.js
│   └── firebase/
│       └── firestore.js
├── frontend/                # Frontend components and utilities
│   ├── components/
│   │   ├── Chart.js
│   │   ├── Table.js
│   │   ├── AddEditModal.js
│   │   └── Loading.js
│   ├── styles/
│   │   └── globals.css
│   └── utils/
│       └── api.ts
├── app/                     # Next.js App Router
│   ├── api/records/         # API routes
│   ├── layout.js
│   └── page.js
├── firebase/
│   ├── config.js
│   └── utils.ts
└── package.json
```

## Setup Instructions

### 1. Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database
3. Get your Firebase configuration
4. Copy `.env.example` to `.env.local` and add your Firebase credentials

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Application

#### Option 1: Frontend Only (Recommended)
```bash
npm run frontend
```

#### Option 2: Full Stack (Frontend + Backend)
```bash
npm run dev
```

#### Option 3: Backend Only
```bash
npm run backend
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000 (if running)

## Features
- ✅ Dashboard with charts showing business metrics
- ✅ Records table with search and filtering
- ✅ Add/Edit/Delete records functionality
- ✅ Color-coded rows based on document expiry status
- ✅ Firebase integration for data persistence
- ✅ Responsive design with Tailwind CSS

## API Endpoints
- GET /api/records - Get all records
- POST /api/records - Create new record
- PUT /api/records/:id - Update record
- DELETE /api/records/:id - Delete record

## Environment Variables
See `.env.example` for required environment variables.
