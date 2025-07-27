// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQmqmkExb5uG9ch6Uyx3eoCkNlx0B5WQc",
  authDomain: "jagga-bazar.firebaseapp.com",
  projectId: "jagga-bazar",
  storageBucket: 'mern-estate.appspot.com',
  messagingSenderId: "495036906071",
  appId: "1:495036906071:web:21414d6be45be914eec112"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);