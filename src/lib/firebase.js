import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, query, orderBy, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCxDibM3nQS6ZJlQ72WbG6Gk1sP9574oh0",
  authDomain: "white-screen-production.firebaseapp.com",
  projectId: "white-screen-production",
  storageBucket: "white-screen-production.firebasestorage.app",
  messagingSenderId: "638125497769",
  appId: "1:638125497769:web:9dd9d20014f013420c78b8",
  measurementId: "G-676MDV4LWL"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc
};
