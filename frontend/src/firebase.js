import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDfSQhxL32tLare2AWpo4AB-Q62Z4xIExU",
  authDomain: "sim-activation-portal-1820a.firebaseapp.com",
  projectId: "sim-activation-portal-1820a",
  storageBucket: "sim-activation-portal-1820a.firebasestorage.app",
  messagingSenderId: "211842325877",
  appId: "1:211842325877:web:49698e71a832584f63873c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
