// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChrsHP0grn-yQG8Zd0TOyE26qfPbOCoUo",
  authDomain: "eduwhisper-portal.firebaseapp.com",
  projectId: "eduwhisper-portal",
  storageBucket: "eduwhisper-portal.firebasestorage.app",
  messagingSenderId: "684140013830",
  appId: "1:684140013830:web:b4443d395ecc29d8f69687",
  measurementId: "G-3Q3DSC8DNB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);