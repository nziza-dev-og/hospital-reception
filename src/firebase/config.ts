import  { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCjdp4gn0poRVWpmc_5amIm4mbt2uzo5Ac",
  authDomain: "hospital-patient-manager.firebaseapp.com",
  projectId: "hospital-patient-manager",
  storageBucket: "hospital-patient-manager.appspot.com",
  messagingSenderId: "925703856243",
  appId: "1:925703856243:web:48450646e4cd00671f0a06",
  measurementId: "G-PT6442528E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
 