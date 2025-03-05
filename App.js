import React, { useState, useEffect } from "react";
import { StatusBar, useColorScheme, Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import MessagesScreen from "./screens/MessagesScreen";
import MessageDetail from "./screens/MessageDetail";
import ProfileScreen from "./screens/ProfileScreen";
import AdminScreen from "./screens/AdminScreen";
import EditUserScreen from "./screens/EditUserScreen";
import NotificationsSettingsScreen from "./screens/NotificationsSettingsScreen";
import { lightStyles, darkStyles } from "./styles";
import messaging from "@react-native-firebase/messaging"; // Import direct

const API_URL = "https://api.ecascan.npna.ch";
const API_KEY = "c80b17dd-5cdc-4b66-b5cf-1d4d62860fbc";
const Stack = createNativeStackNavigator();

const App = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userData, setUserData] = useState(null);
  const [fcmToken, setFcmToken] = useState("");
  const isDarkMode = useColorScheme() === "dark";
  const styles = isDarkMode ? darkStyles : lightStyles;

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("email");
        if (storedEmail) {
          setEmail(storedEmail);
          await fetchUserInfo(storedEmail);
        }
      } catch (error) {
        console.warn("Erreur lors de la vérification du statut de connexion :", error);
      }
    };
    checkLoginStatus();
    registerForPushNotifications();

    const interval = setInterval(() => {
      if (isConnected && email) {
        fetchUserInfo(email);
      }
    }, 60 * 100);

    // Ajout des logs pour les notifications en arrière-plan
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log("App ouverte par notification FCM :", JSON.stringify(remoteMessage, null, 2));
        } else {
          console.log("Aucune notification initiale détectée au démarrage");
        }
      })
      .catch((error) => console.error("Erreur getInitialNotification :", error));

    const unsubscribeBackground = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log("Notification FCM cliquée depuis arrière-plan :", JSON.stringify(remoteMessage, null, 2));
    });

    return () => {
      clearInterval(interval);
      unsubscribeBackground();
    };
  }, [isConnected, email]);

  const fetchUserInfo = async (userEmail) => {
    try {
      const response = await fetch(`${API_URL}/user-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ email: userEmail }),
      });
      const json = await response.json();
      if (response.ok) {
        setUserData({
          email: json.email,
          subscriptionEndDate: json.subscriptionEndDate,
          role: json.role,
          isActive: json.isActive,
        });
        setIsConnected(true);
      } else {
        throw new Error(json.error || "Erreur lors de la récupération des informations utilisateur");
      }
    } catch (error) {
      console.warn("Erreur dans fetchUserInfo :", error.message);
      setIsConnected(false);
    }
  };

  const handleLogin = async (loginEmail, loginPassword) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Erreur de connexion");

      await AsyncStorage.setItem("email", loginEmail);
      setUserData({
        email: json.email,
        subscriptionEndDate: json.subscriptionEndDate,
        role: json.role,
        isActive: json.isActive,
      });
      setEmail(loginEmail);
      setPassword(loginPassword);
      setIsConnected(true);
      if (fcmToken) await registerPushToken(loginEmail);
    } catch (error) {
      console.warn("Erreur lors de la connexion :", error.message);
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem("email");
      setEmail("");
      setPassword("");
      setUserData(null);
      setIsConnected(false);
    } catch (error) {
      console.warn("Erreur lors de la déconnexion :", error.message);
      Alert.alert("Erreur", "Erreur lors de la déconnexion");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userEmail, endDate, startDate) => {
    if (!userEmail) return [];
    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ email: userEmail, endDate, startDate }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Erreur lors de la récupération des messages");
      return json;
    } catch (error) {
      console.warn("Erreur dans fetchMessages :", error.message);
      return [];
    }
  };

  const registerForPushNotifications = async () => {
    if (!Device.isDevice) {
      console.warn("Notifications push non disponibles sur simulateur");
      return;
    }
    try {
      console.log("Demande de permission pour les notifications...");
      const authStatus = await messaging().requestPermission();
      console.log("Statut des permissions :", authStatus);
      if (authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
        // Supprime l’ancien token
        await messaging().deleteToken();
        console.log("Ancien token supprimé, génération d’un nouveau...");
        const token = await messaging().getToken();
        console.log("Nouveau FCM Token généré pour cet appareil :", token);
        // Vérifie si le token semble être pour iOS (pas de préfixe APA91b)
        if (token.startsWith("APA91b")) {
          console.warn("Attention : Le token ressemble à un token Android, pas iOS !");
        } else {
          console.log("Token semble compatible iOS");
        }
        setFcmToken(token);
        if (email) {
          console.log("Enregistrement du token pour l’email :", email);
          await registerPushToken(email);
        } else {
          console.log("Email non disponible, token non enregistré");
        }
      } else {
        console.warn("Permissions de notifications refusées");
      }
    } catch (error) {
      console.error("Erreur lors de la génération ou de l’enregistrement du token FCM :", error);
    }
  };

  const registerPushToken = async (userEmail) => {
    if (!fcmToken || !userEmail) {
      console.warn("Token ou email manquant pour enregistrement");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/register-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ email: userEmail, token: fcmToken }),
      });
      const json = await response.json();
      if (response.ok) {
        console.log("Token enregistré avec succès :", json);
      } else {
        console.warn("Échec de l’enregistrement du token :", json);
      }
    } catch (error) {
      console.error("Erreur lors de l’enregistrement du token :", error);
    }
  };

  return (
    <NavigationContainer>
      <StatusBar style={isDarkMode ? "light" : "dark"} backgroundColor={isDarkMode ? "#121212" : "#fff"} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: isDarkMode ? "#121212" : "#fff" },
        }}
      >
        {isConnected ? (
          <>
            <Stack.Screen name="Messages">
              {(props) => <MessagesScreen {...props} styles={styles} fetchMessages={fetchMessages} isConnected={isConnected} subscriptionEndDate={userData?.subscriptionEndDate} role={userData?.role} email={userData?.email} />}
            </Stack.Screen>
            <Stack.Screen name="Profile">
              {(props) => <ProfileScreen {...props} styles={styles} email={userData.email} handleLogout={handleLogout} isConnected={isConnected} subscriptionEndDate={userData.subscriptionEndDate} role={userData.role} />}
            </Stack.Screen>
            <Stack.Screen name="Admin">{(props) => <AdminScreen {...props} styles={styles} email={userData.email} />}</Stack.Screen>
            <Stack.Screen name="EditUser">{(props) => <EditUserScreen {...props} styles={styles} />}</Stack.Screen>
            <Stack.Screen name="MessageDetail">{(props) => <MessageDetail {...props} styles={styles} />}</Stack.Screen>
            <Stack.Screen name="NotificationsSettings">{(props) => <NotificationsSettingsScreen {...props} styles={styles} role={userData?.role} />}</Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="Login">{(props) => <LoginScreen {...props} setEmail={setEmail} setPassword={setPassword} handleLogin={handleLogin} styles={styles} />}</Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
