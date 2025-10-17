import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyASodoImTjzwF0rZuiQWdut3jtzYcQJ3cE",
  authDomain: "roulette-372ab.firebaseapp.com",
  projectId: "roulette-372ab",
  storageBucket: "roulette-372ab.firebasestorage.app",
  messagingSenderId: "689004074045",
  appId: "1:689004074045:web:ee74ce800d6590ea468654",
  measurementId: "G-ZH17Y9807B"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
