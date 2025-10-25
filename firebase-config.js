// Firebase Configuration for Yaya Starchild Website
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAckKED5ITmEOAtrrR1plBHpDvPbLpDGTc",
  authDomain: "yaya-starchild.firebaseapp.com",
  projectId: "yaya-starchild",
  storageBucket: "yaya-starchild.firebasestorage.app",
  messagingSenderId: "961392646015",
  appId: "1:961392646015:web:d2a2a91f3e40d68bb82c4a",
  measurementId: "G-Y32J55R36M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Make db available globally for easy access
window.db = db;

console.log('🔥 Firebase initialized successfully');
console.log('📊 Analytics enabled');
console.log('💾 Firestore database ready');

// Export for use in other modules
export { db, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, analytics };
