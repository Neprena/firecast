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

  useEffect(() => {
    console.log("Initialisation de l’app...");
    checkLoginStatus();
    registerForPushNotifications();
    loadCachedMessages();
    fetchMessages();

    const netInfoListener = NetInfo.addEventListener((state) => {
      setIsConnected(state.isInternetReachable);
      if (state.isInternetReachable) fetchMessages();
    });

    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification reçue en arrière-plan :", response);
      const data = response.notification.request.content.data || {};
      if (data.type === "new_message" && isLoggedIn) {
        fetchMessages();
      }
    });

    const appStateListener = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && isLoggedIn) {
        console.log("App revenue au premier plan, rechargement des messages...");
        fetchMessages();
      }
    });

    return () => {
      netInfoListener();
      backgroundSubscription.remove();
      appStateListener.remove();
    };
  }, [isLoggedIn]);

  const checkLoginStatus = async () => {
    const storedEmail = await AsyncStorage.getItem("email");
    if (storedEmail) {
      console.log("Email trouvé dans AsyncStorage :", storedEmail);
      setEmail(storedEmail);
      setIsLoggedIn(true);
      fetchMessages();
      if (expoPushToken) {
        console.log("Token existant, enregistrement pour :", storedEmail);
        await registerPushToken(storedEmail);
      } else {
        console.log("Aucun token push disponible au démarrage, génération en cours...");
      }
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
      setIsLoggedIn(true);
      fetchMessages();
      if (expoPushToken) {
        console.log("Token disponible après connexion, enregistrement...");
        await registerPushToken(email);
      } else {
        console.log("Token push non disponible après connexion, tentative de génération...");
        await registerForPushNotifications();
      }
    } catch (error) {
      console.warn("Erreur de connexion :", error.message);
      alert("Erreur", "Email, mot de passe ou clé API incorrect.");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("email");
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    console.log("Déconnexion effectuée");
  };

  const registerForPushNotifications = async () => {
    if (!Device.isDevice) {
      console.warn("Notifications push non disponibles sur simulateur");
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
      } else {
        console.log("Token généré mais pas d’email pour l’enregistrement");
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
    try {
      const response = await fetch(`${API_URL}/messages`, {
        headers: {
          "x-api-key": API_KEY,
        },
      });
      if (!response.ok) throw new Error("Server unreachable or invalid API key");
      const data = await response.json();
      setMessages(data);
      await AsyncStorage.setItem("messages", JSON.stringify(data));
      setIsConnected(true);
      console.log("Messages récupérés avec succès :", data.length);
    } catch (error) {
      setIsConnected(false);
      loadCachedMessages();
      console.warn("Erreur lors de la récupération des messages :", error);
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