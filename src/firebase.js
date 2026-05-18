import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyA1Uv2EO7LTtYlZoGXtRe65-N6S3BzTQsg",
  authDomain: "brush-up-salon.firebaseapp.com",
  projectId: "brush-up-salon",
  storageBucket: "brush-up-salon.firebasestorage.app",
  messagingSenderId: "318944477927",
  appId: "1:318944477927:web:1bfe278264fd9095ffd842",
  measurementId: "G-33TZKH7EFX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
