import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC5IxO-cElLnCS9OMKbO6hrQ7zYsd-W_wQ',
  authDomain: 'rappang-location-ab5d6.firebaseapp.com',
  projectId: 'rappang-location-ab5d6',
  storageBucket: 'rappang-location-ab5d6.appspot.com',
  messagingSenderId: '926262437983',
  appId: '1:926262437983:web:0cadb5b6f9142bf14a93ea',
  measurementId: 'G-FBHS9SQEVX',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
