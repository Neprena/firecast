import React, { useState, useEffect } from "react";
import { StatusBar, useColorScheme, Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const API_URL = "https://api.ecascan.npna.ch";
const API_KEY = "c80b17dd-5cdc-4b66-b5cf-1d4d62860fbc";
const Stack = createNativeStackNavigator();

const App = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userData, setUserData] = useState(null);
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

    const interval = setInterval(() => {
      if (isConnected && email) {
        fetchUserInfo(email);
      }
    }, 60 * 100);

    return () => clearInterval(interval);
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

  const fetchMessages = async () => {
    if (!userData?.email) return [];
    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ email: userData.email }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Erreur lors de la récupération des messages");
      return json;
    } catch (error) {
      console.warn("Erreur dans fetchMessages :", error.message);
      return [];
    }
  };

  return (
    <NavigationContainer>
      <StatusBar
        style={isDarkMode ? "light" : "dark"}
        backgroundColor={isDarkMode ? "#121212" : "#fff"} // Ajout de backgroundColor
      />
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
