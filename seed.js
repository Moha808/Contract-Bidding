import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const envFile = fs.readFileSync('.env', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  if (line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    envVars[key.trim()] = valueParts.join('=').trim().replace(/['"]/g, '');
  }
});

const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleProjects = [
  {
    title: "Solar Panel Installation for Admin Block",
    budget: 15000000,
    deadline: 60,
    category: "Electrical",
    createdAt: new Date().toISOString()
  },
  {
    title: "Construction of New Student Hostel",
    budget: 250000000,
    deadline: 365,
    category: "Civil/Building",
    createdAt: new Date().toISOString()
  },
  {
    title: "Plumbing and Water Reticulation in Campus B",
    budget: 8000000,
    deadline: 45,
    category: "Plumbing",
    createdAt: new Date().toISOString()
  },
  {
    title: "Perimeter Fencing of the College Farm",
    budget: 12000000,
    deadline: 90,
    category: "Civil/Building",
    createdAt: new Date().toISOString()
  },
  {
    title: "Supply of 500 Desktop Computers for IT Lab",
    budget: 125000000,
    deadline: 30,
    category: "Supplies/IT",
    createdAt: new Date().toISOString()
  }
];

async function seed() {
  try {
    for (const proj of sampleProjects) {
      await addDoc(collection(db, 'projects'), proj);
      console.log('Added project:', proj.title);
    }
    console.log('Seeding complete.');
  } catch (err) {
    console.error('Error seeding data:', err);
  }
  process.exit(0);
}

seed();
