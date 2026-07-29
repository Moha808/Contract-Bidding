import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

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

async function clearDatabase() {
  try {
    console.log('Fetching projects to delete...');
    const projectsSnapshot = await getDocs(collection(db, 'projects'));
    for (const document of projectsSnapshot.docs) {
      await deleteDoc(doc(db, 'projects', document.id));
      console.log('Deleted project:', document.id);
    }

    console.log('Fetching bids to delete...');
    const bidsSnapshot = await getDocs(collection(db, 'bids'));
    for (const document of bidsSnapshot.docs) {
      await deleteDoc(doc(db, 'bids', document.id));
      console.log('Deleted bid:', document.id);
    }
    
    console.log('\nSuccess! All sample data has been completely wiped from your live Firebase database.');
  } catch (err) {
    console.error('Error clearing data:', err);
  }
  process.exit(0);
}

clearDatabase();
