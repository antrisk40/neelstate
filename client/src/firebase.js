// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "neel-estate.firebaseapp.com",
  projectId: "neel-estate",
  storageBucket: "neel-estate.appspot.com",
  messagingSenderId: "894203387438",
  appId: "1:894203387438:web:72383a7e659a3cd0d6c9bf",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
