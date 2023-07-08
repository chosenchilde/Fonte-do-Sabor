// Configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA6iYqoa6fY-bTIbxx3bHZDCGRHP6Ndx6s",
  authDomain: "fonte-do-sabor.firebaseapp.com",
  projectId: "fonte-do-sabor",
  storageBucket: "fonte-do-sabor.appspot.com",
  messagingSenderId: "646068440753",
  appId: "1:646068440753:web:653ed1f2049eba19b05c90",
  measurementId: "G-2HFEVGCZSF",
};

// Incializa o Firebase
firebase.initializeApp(firebaseConfig);

// Incializa o Firebase Authentication
const auth = firebase.auth();

// Define o provedor de autenticação
var provider = new firebase.auth.GoogleAuthProvider();
