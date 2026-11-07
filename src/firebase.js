import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCgQRMRVcqNqhaBAkj9CYIP9j6ZUoxF5KY",
  authDomain: "ukraine-gta-5f176.firebaseapp.com",
  projectId: "ukraine-gta-5f176",
  storageBucket: "ukraine-gta-5f176.firebasestorage.app",
  messagingSenderId: "443202989884",
  appId: "1:443202989884:web:15115dab51e89b0698b839",
  measurementId: "G-RPL8PL75VD"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)