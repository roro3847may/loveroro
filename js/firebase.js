import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get, set, push, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0hej85_8SB698ln8Jk4wfbvuwkH4LIbg",
  authDomain: "loveroro-88b39.firebaseapp.com",
  databaseURL: "https://loveroro-88b39-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "loveroro-88b39",
  storageBucket: "loveroro-88b39.firebasestorage.app",
  messagingSenderId: "202297152203",
  appId: "1:202297152203:web:c8770f9dc0932f5ecc414e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, get, set, push, onValue };
