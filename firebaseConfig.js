import { initializeApp, getApps } from "@react-native-firebase/app"; // Changement d'import
import messaging from "@react-native-firebase/messaging"; // Import direct

// Remplace ces valeurs par celles de ton Firebase Console > Paramètres du projet > Général > "Vos applications"
const firebaseConfig = {
  apiKey: "AIzaSyDLBKZ254IsfE6UczDosE5kuMvR1Nf7QoI",
  authDomain: "yr-ecascan.firebaseapp.com",
  projectId: "yr-ecascan",
  storageBucket: "yr-ecascan.appspot.com",
  messagingSenderId: "915032574766",
  appId: "1:915032574766:ios:9904cd218854be1fa288bf",
};

// Initialise Firebase si ce n’est pas déjà fait
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export { app, messaging };
