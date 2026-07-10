import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBhhM0WHqlFNuqZsKZXuPc4rm_u4c5-ars",
  authDomain: "ecofandy-control.firebaseapp.com",
  projectId: "ecofandy-control",
  storageBucket: "ecofandy-control.firebasestorage.app",
  messagingSenderId: "746309968310",
  appId: "1:746309968310:web:c4efcf831ed9203de16117"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;