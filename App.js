import React, { useState, useEffect } from "react";
import { StatusBar, useColorScheme, AppState } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import NetInfo from "@react-native-community/netinfo";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import MessagesScreen from "./screens/MessagesScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AdminScreen from "./screens/AdminScreen";
import EditUserScreen from "./screens/EditUserScreen"; // Ajout de l’importation
import { lightStyles, darkStyles } from "./styles";

const API_URL = "http://84.234.18.3:3001";
const API_KEY = Constants.expoConfig?.extra?.apiKey || "c80b17dd-5cdc-4b66-b5cf-1d4d62860fbc";
const Stack = createNativeStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const styles = isDarkMode ? darkStyles : lightStyles;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(null);
  const [role, setRole] = useState("normal");

  useEffect(() => {
    console.log("Initialisation de l’app...");
    checkLoginStatus();
    loadNotificationSetting();
    registerForPushNotifications();
    loadCachedMessages();
    fetchMessages();

    const netInfoListener = NetInfo.addEventListener((state) => {
      setIsConnected(state.isInternetReachable);
      if (state.isInternetReachable) {
        fetchMessages();
        refreshUserInfo();
      }
    });

    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification reçue en arrière-plan :", response);
      const data = response.notification.request.content.data || {};
      if (data.type === "new_message" && isLoggedIn && notificationsEnabled) {
        fetchMessages();
      }
    });

    const appStateListener = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && isLoggedIn) {
        console.log("App revenue au premier plan, rechargement des messages et infos utilisateur...");
        fetchMessages();
        refreshUserInfo();
      }
    });

    const intervalId = setInterval(() => {
      if (isLoggedIn) {
        refreshUserInfo();
      }
    }, 5 * 60 * 1000);

    return () => {
      netInfoListener();
      backgroundSubscription.remove();
      appStateListener.remove();
      clearInterval(intervalId);
    };
  }, [isLoggedIn, notificationsEnabled]);

  const loadNotificationSetting = async () => {
    try {
      const value = await AsyncStorage.getItem("notificationsEnabled");
      if (value !== null) {
        setNotificationsEnabled(JSON.parse(value));
      }
    } catch (error) {
      console.warn("Erreur lors du chargement des paramètres de notification :", error);
    }
  };

  const checkLoginStatus = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem("email");
      const storedSubscriptionEndDate = await AsyncStorage.getItem("subscriptionEndDate");
      const storedRole = await AsyncStorage.getItem("role");

      if (storedEmail) {
        console.log("Email trouvé dans AsyncStorage :", storedEmail);
        setEmail(storedEmail);
        setSubscriptionEndDate(storedSubscriptionEndDate ? storedSubscriptionEndDate : null);
        setRole(storedRole ? storedRole : "normal");
        setIsLoggedIn(true);
        fetchMessages();
        if (expoPushToken && notificationsEnabled) {
          console.log("Token existant, enregistrement pour :", storedEmail);
          await registerPushToken(storedEmail);
        }
        await refreshUserInfo();
      }
    } catch (error) {
      console.warn("Erreur lors de la vérification du statut de connexion :", error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ email, password }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Invalid credentials or API key");
      console.log("Connexion réussie :", json);
      await AsyncStorage.setItem("email", email);
      await AsyncStorage.setItem("subscriptionEndDate", json.subscriptionEndDate || "");
      await AsyncStorage.setItem("role", json.role || "normal");
      setIsLoggedIn(true);
      setSubscriptionEndDate(json.subscriptionEndDate);
      setRole(json.role);
      fetchMessages();
      if (expoPushToken && notificationsEnabled) {
        console.log("Token disponible après connexion, enregistrement...");
        await registerPushToken(email);
      }
    } catch (error) {
      console.warn("Erreur de connexion :", error.message);
      alert("Erreur", "Email, mot de passe ou clé API incorrect.");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("email");
    await AsyncStorage.removeItem("subscriptionEndDate");
    await AsyncStorage.removeItem("role");
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    setSubscriptionEndDate(null);
    setRole("normal");
    console.log("Déconnexion effectuée");
  };

  const registerForPushNotifications = async () => {
    if (!Device.isDevice) {
      console.warn("Notifications push non disponibles sur simulateur");
      return;
    }
    if (!notificationsEnabled) {
      console.log("Notifications désactivées, pas de génération de token");
      return;
    }
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log("Statut des permissions actuel :", existingStatus);
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log("Nouveau statut des permissions :", finalStatus);
      }
      if (finalStatus !== "granted") {
        console.warn("Permissions de notification non accordées");
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig?.extra?.eas?.projectId })).data;
      console.log("Expo Push Token généré :", token);
      setExpoPushToken(token);
      if (email) {
        console.log("Email disponible, enregistrement du token pour :", email);
        await registerPushToken(email);
      }
    } catch (error) {
      console.error("Erreur lors de la génération du token push :", error);
    }
  };

  const registerPushToken = async (userEmail) => {
    if (!expoPushToken || !userEmail) {
      console.warn("Token ou email manquant pour l’enregistrement :", { expoPushToken, userEmail });
      return;
    }
    try {
      const response = await fetch(`${API_URL}/register-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ email: userEmail, token: expoPushToken }),
      });
      const json = await response.json();
      if (response.ok) {
        console.log("Token enregistré avec succès :", json);
      } else {
        console.warn("Échec de l’enregistrement du token :", json);
      }
    } catch (error) {
      console.warn("Erreur lors de l’enregistrement du token :", error);
    }
  };

  const loadCachedMessages = async () => {
    try {
      const cachedMessages = await AsyncStorage.getItem("messages");
      if (cachedMessages) {
        setMessages(JSON.parse(cachedMessages));
        console.log("Messages chargés depuis le cache");
      }
    } catch (error) {
      console.warn("Erreur lors du chargement des messages en cache :", error);
    }
  };

  const fetchMessages = async () => {
    if (!email) {
      console.warn("Aucun email disponible pour fetchMessages");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || "Server unreachable or invalid API key");
      }
      const data = await response.json();
      setMessages(data);
      await AsyncStorage.setItem("messages", JSON.stringify(data));
      setIsConnected(true);
      console.log("Messages récupérés avec succès :", data.length);
    } catch (error) {
      setIsConnected(false);
      loadCachedMessages();
      console.warn("Erreur lors de la récupération des messages :", error);
      if (error.message === "Abonnement expiré") {
        alert("Erreur", "Votre abonnement a expiré. Veuillez vous réabonner.");
      }
    }
  };

  const refreshUserInfo = async () => {
    if (!email) return;
    try {
      const response = await fetch(`${API_URL}/user-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ email }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Erreur lors de la récupération des infos utilisateur");

      setSubscriptionEndDate(json.subscriptionEndDate);
      setRole(json.role);
      await AsyncStorage.setItem("subscriptionEndDate", json.subscriptionEndDate || "");
      await AsyncStorage.setItem("role", json.role || "normal");
      console.log("Infos utilisateur rafraîchies :", { role: json.role, subscriptionEndDate: json.subscriptionEndDate });
    } catch (error) {
      console.warn("Erreur lors du rafraîchissement des infos utilisateur :", error.message);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isLoggedIn ? (
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  handleLogin={handleLogin}
                  styles={styles}
                  isConnected={isConnected}
                />
              )}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Messages">
                {(props) => (
                  <MessagesScreen
                    {...props}
                    messages={messages}
                    fetchMessages={fetchMessages}
                    styles={styles}
                    isConnected={isConnected}
                    subscriptionEndDate={subscriptionEndDate}
                    role={role}
                    email={email} // Ajouté ici
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Profile">
                {(props) => (
                  <ProfileScreen
                    {...props}
                    email={email}
                    handleLogout={handleLogout}
                    styles={styles}
                    isConnected={isConnected}
                    subscriptionEndDate={subscriptionEndDate}
                    role={role}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Admin">
                {(props) => (
                  <AdminScreen
                    {...props}
                    email={email}
                    styles={styles}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="EditUser">
                {(props) => (
                  <EditUserScreen
                    {...props}
                    styles={styles}
                  />
                )}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}