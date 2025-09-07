// firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDJjCX_kw8QPCCJcDYd_VfQk3fzMPo1xKU',
  authDomain: 'auraweb-23082025.firebaseapp.com',
  projectId: 'auraweb-23082025',
  storageBucket: 'auraweb-23082025.appspot.com',
  messagingSenderId: '791085170086',
  appId: '1:791085170086:web:0abd8b9622fe086a79a367',
  measurementId: 'G-XXXXXX',
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };