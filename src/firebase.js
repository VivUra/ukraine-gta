import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCgQRMRVcqNqhaBAkj9CYIP9j6ZUoxF5KY",
  authDomain: "ukraine-gta-5f176.firebaseapp.com",
  projectId: "ukraine-gta-5f176",
  storageBucket: "ukraine-gta-5f176.firebasestorage.app",
  messagingSenderId: "443202989884",
  appId: "1:443202989884:web:15115dab51e89b0698b839"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)