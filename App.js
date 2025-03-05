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
import { messaging } from "./firebaseConfig";

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
          await registerForPushNotifications(storedEmail); // Génère le token après avoir l’email
        }
      } catch (error) {
        console.warn("Erreur lors de la vérification du statut de connexion :", error);
      }
    };
    checkLoginStatus();

    const interval = setInterval(() => {
      if (isConnected && email) {
        fetchUserInfo(email);
      }
    }, 60 * 1000);

    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      console.log("Notification FCM reçue en avant-plan :", JSON.stringify(remoteMessage, null, 2));
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log("App ouverte par notification :", JSON.stringify(remoteMessage, null, 2));
        } else {
          console.log("Aucune notification initiale détectée");
        }
      })
      .catch((error) => console.error("Erreur getInitialNotification :", error));

    const unsubscribeBackground = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log("Notification cliquée depuis arrière-plan :", JSON.stringify(remoteMessage, null, 2));
    });

    return () => {
      clearInterval(interval);
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, [isConnected, email]);

  const fetchUserInfo = async (userEmail) => {
    try {
      const response = await fetch(`${API_URL}/user-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
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
      await registerForPushNotifications(loginEmail); // Génère et enregistre le token après connexion
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
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
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

  const registerForPushNotifications = async (userEmail) => {
    if (!Device.isDevice) {
      console.warn("Notifications push non disponibles sur simulateur");
      return;
    }
    try {
      const authStatus = await messaging().requestPermission();
      console.log("Statut des permissions :", authStatus);
      if (authStatus === 1 || authStatus === 2) { // AUTHORIZED (1) ou PROVISIONAL (2)
        const token = await messaging().getToken();
        console.log("FCM Token généré :", token);
        setFcmToken(token);
        if (userEmail) {
          await registerPushToken(userEmail, token);
        } else {
          console.warn("Email non disponible lors de la génération du token");
        }
      } else {
        console.warn("Permissions de notifications refusées");
      }
    } catch (error) {
      console.error("Erreur lors de la génération du token FCM :", error);
    }
  };

  const registerPushToken = async (userEmail, token) => {
    if (!token || !userEmail) {
      console.warn("Token ou email manquant pour enregistrement");
      return;
    }
    try {
      const storedSettings = await AsyncStorage.getItem("notificationSettings");
      const notificationSettings = storedSettings ? JSON.parse(storedSettings) : { debug: false, info: true, prioritaire: false };
      const response = await fetch(`${API_URL}/register-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify({ email: userEmail, token, notificationSettings }),
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
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: isDarkMode ? "#121212" : "#fff" } }}
      >
        {isConnected ? (
          <>
            <Stack.Screen name="Messages">
              {(props) => (
                <MessagesScreen
                  {...props}
                  styles={styles}
                  fetchMessages={fetchMessages}
                  isConnected={isConnected}
                  subscriptionEndDate={userData?.subscriptionEndDate}
                  role={userData?.role}
                  email={userData?.email}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Profile">
              {(props) => (
                <ProfileScreen
                  {...props}
                  styles={styles}
                  email={userData.email}
                  handleLogout={handleLogout}
                  isConnected={isConnected}
                  subscriptionEndDate={userData.subscriptionEndDate}
                  role={userData.role}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Admin">{(props) => <AdminScreen {...props} styles={styles} email={userData.email} />}</Stack.Screen>
            <Stack.Screen name="EditUser">{(props) => <EditUserScreen {...props} styles={styles} />}</Stack.Screen>
            <Stack.Screen name="MessageDetail">{(props) => <MessageDetail {...props} styles={styles} />}</Stack.Screen>
            <Stack.Screen name="NotificationsSettings">
              {(props) => <NotificationsSettingsScreen {...props} styles={styles} role={userData?.role} />}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setEmail={setEmail} setPassword={setPassword} handleLogin={handleLogin} styles={styles} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;