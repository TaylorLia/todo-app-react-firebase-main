import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCr_loArFGElmHVD4Xw8TvAgu6wuhFd46A",
  authDomain: "todo-8327e.firebaseapp.com",
  projectId: "todo-8327e",
  storageBucket: "todo-8327e.appspot.com",
  messagingSenderId: "767387852502",
  appId: "1:767387852502:web:8271d4ce6abc7491adf377",
  measurementId: "G-Q46JKE0403"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)