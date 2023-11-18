// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, GoogleAuthProvider} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC39bWOT0z0bbTEU35NIuC6xwoKNYQELmg",
  authDomain: "hack23-c6a2e.firebaseapp.com",
  projectId: "hack23-c6a2e",
  storageBucket: "hack23-c6a2e.appspot.com",
  messagingSenderId: "169057854644",
  appId: "1:169057854644:web:78b8b013a9204954dea3e1",
  measurementId: "G-9ZRPM5NH5C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export {auth, provider};