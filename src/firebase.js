import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBaxthnJSLhkjkLF8_bXNVkc_YKB3E70yA",
  authDomain: "aislebe.firebaseapp.com",
  databaseURL: "https://aislebe-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aislebe",
  storageBucket: "aislebe.firebasestorage.app",
  messagingSenderId: "640023929786",
  appId: "1:640023929786:web:968124c68474c8538f7383",
  measurementId: "G-X5D49KX8G1"
};

let app = null;
let database = null;

try {
  console.log("Initializing Realtime Database Connection...");
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
} catch (error) {
  console.error("Firebase Initialization Failed. Check your config.", error);
}

export { database };
