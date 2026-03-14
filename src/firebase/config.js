import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAtcYhX8HlYyo-5GTTYhv8q6y00I-8JavI",
  authDomain: "ventureframe-store.firebaseapp.com",
  projectId: "ventureframe-store",
  storageBucket: "ventureframe-store.firebasestorage.app",
  messagingSenderId: "467700925436",
  appId: "1:467700925436:web:1a6afff65f12da70086879",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export default app;

// if (window.location.hostname === "localhost") {
//   connectFunctionsEmulator(functions, "localhost", 5001);
//   connectAuthEmulator(auth, "http://localhost:9099");
//   connectFirestoreEmulator(db, "localhost", 8080);
//   connectStorageEmulator(storage, "localhost", 9199);
// }

connectFunctionsEmulator(functions, "10.142.110.199", 5001);
connectAuthEmulator(auth, "http://10.142.110.199:9099");
connectFirestoreEmulator(db, "10.142.110.199", 8080);
connectStorageEmulator(storage, "10.142.110.199", 9199);
