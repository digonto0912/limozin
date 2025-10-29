const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to convert date string to Timestamp
const dateToTimestamp = (dateStr) => {
  if (!dateStr) return null;
  return Timestamp.fromDate(new Date(dateStr));
};

const sampleRecords = [
  {
    name: "Rahim Uddin",
    passportNumber: "A1234567",
    passportExpiry: "2026-11-10",
    idNumber: "1234567890",
    idExpiry: "2026-03-15",
    joinDate: "2022-06-12",
    phone: "01712345678",
    dueBalance: 25000,
    notes: "🔴 High due balance - Requires immediate attention"
  },
  {
    name: "Karim Ali",
    passportNumber: "B7654321",
    passportExpiry: "2026-07-01",
    idNumber: "9876543210",
    idExpiry: "2024-05-12",
    joinDate: "2021-03-22",
    phone: "01876543210",
    dueBalance: 0,
    notes: "🟠 ID card expiring soon"
  },
  {
    name: "Mohammad Hassan",
    passportNumber: "C5432167",
    passportExpiry: "2024-12-30",
    idNumber: "5432167890",
    idExpiry: "2026-08-20",
    joinDate: "2023-01-15",
    phone: "01912345678",
    dueBalance: 0,
    notes: "💛 Passport needs renewal soon"
  },
  {
    name: "Abdul Kader",
    passportNumber: "D6789054",
    passportExpiry: "2026-03-25",
    idNumber: "6789054321",
    idExpiry: "2024-04-30",
    joinDate: "2022-09-01",
    phone: "01612345678",
    dueBalance: 18000,
    notes: "🔴 Payment overdue and ID expiring"
  },
  {
    name: "Fatima Begum",
    passportNumber: "E3456789",
    passportExpiry: "2026-05-18",
    idNumber: "3456789012",
    idExpiry: "2026-12-15",
    joinDate: "2023-04-10",
    phone: "01512345678",
    dueBalance: 0,
    notes: "💙 All documents valid and no dues"
  },
  {
    name: "Jamal Ahmed",
    passportNumber: "F8901234",
    passportExpiry: "2024-07-05",
    idNumber: "8901234567",
    idExpiry: "2024-05-28",
    joinDate: "2022-11-20",
    phone: "01812345678",
    dueBalance: 0,
    notes: "🟠 Both ID and passport need attention"
  },
  {
    name: "Nasrin Akter",
    passportNumber: "G4567890",
    passportExpiry: "2026-09-15",
    idNumber: "4567890123",
    idExpiry: "2026-12-31",
    joinDate: "2023-02-05",
    phone: "01712345679",
    dueBalance: 0,
    notes: "💙 Everything up to date"
  },
  {
    name: "Ahmed Khan",
    passportNumber: "H7890123",
    passportExpiry: "2024-08-20",
    idNumber: "7890123456",
    idExpiry: "2026-11-15",
    joinDate: "2023-05-15",
    phone: "01612345670",
    dueBalance: 0,
    notes: "💛 Passport renewal needed"
  },
  {
    name: "Salma Khatun",
    passportNumber: "I2345678",
    passportExpiry: "2026-10-25",
    idNumber: "2345678901",
    idExpiry: "2026-09-30",
    joinDate: "2023-03-01",
    phone: "01912345670",
    dueBalance: 15000,
    notes: "🔴 Has pending balance"
  },
  {
    name: "Omar Faruk",
    passportNumber: "J6789012",
    passportExpiry: "2026-12-01",
    idNumber: "6789012345",
    idExpiry: "2026-10-15",
    joinDate: "2023-06-01",
    phone: "01812345670",
    dueBalance: 0,
    notes: "💙 Regular customer, all clear"
  }
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    for (const record of sampleRecords) {
      // Convert date strings to Timestamps
      const processedRecord = {
        ...record,
        passportExpiry: dateToTimestamp(record.passportExpiry),
        idExpiry: dateToTimestamp(record.idExpiry),
        joinDate: dateToTimestamp(record.joinDate),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(collection(db, 'records'), processedRecord);
      console.log(`Added record for ${record.name}`);
    }
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
