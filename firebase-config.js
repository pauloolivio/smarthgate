// ============ firebase-config.js ============
const firebaseConfig = {
    apiKey: "AIzaSyASt_vtJMR0jdFhe8oO4_5uvPDAthR7mJM",
    authDomain: "smarthgates.firebaseapp.com",
    databaseURL: "https://smarthgates-default-rtdb.firebaseio.com",
    projectId: "smarthgates",
    storageBucket: "smarthgates.firebasestorage.app",
    messagingSenderId: "534107342905",
    appId: "1:534107342905:web:faca6ace832a86bac125e8",
    measurementId: "G-PF6QSB8011"
};

// Inicializar Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Serviços
const auth = firebase.auth();
const firestore = firebase.firestore();
const database = firebase.database();

// Providers
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Exportar globalmente
window.auth = auth;
window.firestore = firestore;
window.database = database;
window.googleProvider = googleProvider;

console.log('✅ Firebase inicializado com sucesso');