import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDL6vEHDfvhHx182SsiXypUCvkW92MCEls",
  authDomain: "mysahasync.firebaseapp.com",
  projectId: "mysahasync",
  storageBucket: "mysahasync.firebasestorage.app",
  messagingSenderId: "268272090566",
  appId: "1:268272090566:web:d611cd36405ca1cd2f06c7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);