import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB8aHCjXqBoorPHoaBq_4C9EyJNtp0BLYk",
  authDomain: "vmtips2026.firebaseapp.com",
  projectId: "vmtips2026",
  storageBucket: "vmtips2026.firebasestorage.app",
  messagingSenderId: "182122621265",
  appId: "1:182122621265:web:20cf07f6f7fe44f7c30b70",
  measurementId: "G-T5G8MY74HW"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);