// frontend/App.js
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, Alert, FlatList, TouchableOpacity, StyleSheet, RefreshControl, StatusBar, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { SafeAreaView, useSafeAreaInsets, SafeAreaProvider } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";

const API_URL = "http://84.234.18.3:3001"; // Assurez-vous que le backend tourne bien sur cette adresse

function App() {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(colorScheme);
  const isDarkMode = colorScheme === "dark";
  const styles = theme === "dark" ? darkStyles : lightStyles;
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    checkLoginStatus();
    registerForPushNotificationsAsync();
    loadMessagesFromStorage();
    fetchMessages();

    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      fetchMessages();
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isInternetReachable);
      if (state.isInternetReachable) {
        fetchMessages(); // Resynchronisation automatique en ligne
      }
    });

    return () => unsubscribe();
  }, []);

  // Détecter les changements de thème en direct
  useEffect(() => {
    setTheme(colorScheme);
  }, [colorScheme]);

  const checkLoginStatus = async () => {
    const storedEmail = await AsyncStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
      setIsLoggedIn(true);
      fetchMessages();
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("email");
    setIsLoggedIn(false);
    setShowProfile(false);
    setEmail("");
    setPassword("");
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error("Invalid credentials");
      const data = await response.json();
      await AsyncStorage.setItem("email", email);
      setIsLoggedIn(true);
      fetchMessages();
    } catch (error) {
      Alert.alert("Erreur", "Email ou mot de passe incorrect.");
    }
  };

  const registerForPushNotificationsAsync = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        Alert.alert("Erreur", "Les notifications push ne sont pas autorisées.");
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig.extra.eas.projectId })).data;
      setExpoPushToken(token);
    } else {
      //Alert.alert("Erreur", "Les notifications push ne fonctionnent pas sur un simulateur.");
    }
  };

  const loadMessagesFromStorage = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem("messages");
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des messages locaux", error);
    }
  };

  const fetchMessages = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${API_URL}/messages`);
      if (!response.ok) throw new Error("Serveur injoignable");
      const data = await response.json();
      setMessages(data);
      await AsyncStorage.setItem("messages", JSON.stringify(data));
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
      console.warn("⚠ Impossible de récupérer les messages. Utilisation du cache.");
      const storedMessages = await AsyncStorage.getItem("messages");
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages)); // Chargement du cache
      }
    } finally {
      setRefreshing(false);
    }
  };

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach((message) => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);
  const sections = Object.keys(groupedMessages).map((date) => ({
    title: date,
    data: groupedMessages[date],
  }));

  const onRefresh = useCallback(() => {
    fetchMessages();
  }, []);

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        {!isConnected && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>⚠ Connexion au serveur perdue</Text>
          </View>
        )}
        <Text style={styles.title}>Connexion</Text>
        <TextInput placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
        <TextInput placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (showProfile) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.info}>Utilisateur: {email}</Text>
        <Text style={styles.info}>Statut: Connecté</Text>

        {/* Nouveau statut de connexion */}
        <Text style={[styles.info, { color: isConnected ? "green" : "red" }]}>Serveur : {isConnected ? "Connecté ✅" : "Déconnecté ❌"}</Text>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Se déconnecter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowProfile(false)}>
          <Text style={styles.buttonText}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      {!isConnected && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>⚠ Mode hors ligne - Affichage des messages stockés</Text>
        </View>
      )}
      <Text style={styles.title}>Historique des Messages</Text>
      <FlatList
        data={Object.keys(groupedMessages)}
        keyExtractor={(date) => date}
        renderItem={({ item: date }) => (
          <View>
            <Text style={styles.dateHeader}>{date}</Text>
            {groupedMessages[date]?.map((message) => (
              <View key={message.id} style={styles.message}>
                <Text style={styles.messageText}>{message.message}</Text>
                <Text style={styles.timestamp}>{new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
              </View>
            ))}
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      <TouchableOpacity style={styles.profileButton} onPress={() => setShowProfile(true)}>
        <Text style={styles.buttonText}>Profil / A propos</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default function Main() {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
}

const lightStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, color: "#000000" },
  input: { width: "100%", padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, backgroundColor: "#f5f5f5", color: "#000000" },
  button: { backgroundColor: "#007BFF", padding: 14, borderRadius: 8, alignItems: "center", width: "100%" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  message: { backgroundColor: "#f0f0f0", padding: 12, marginVertical: 5, borderRadius: 8, width: "100%" },
  info: { fontSize: 16, marginBottom: 10, color: "#000000" },
  profileButton: { marginTop: 20, padding: 10, backgroundColor: "#444", borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16 },
  secondaryButton: { marginTop: 10, backgroundColor: "#888", padding: 10, borderRadius: 8 },
  warningBanner: { backgroundColor: "#ff4444", padding: 10, width: "100%", alignItems: "center" },
  warningText: { color: "#ffffff", fontWeight: "bold" },
  timestamp: { fontSize: 12, color: "#666", marginTop: 4, alignSelf: "flex-end" },
  dateHeader: { fontSize: 16, fontWeight: "bold", color: "#333", backgroundColor: "#838383", padding: 6, marginTop: 10, borderRadius: 5, textAlign: "center" },
});

const darkStyles = {
  ...lightStyles,
  container: { backgroundColor: "#121212" },
  title: { color: "#ffffff" },
  input: { backgroundColor: "#222", color: "#ffffff", borderColor: "#444" },
  message: { backgroundColor: "#1E1E1E" },
  messageText: { color: "#ffffff" },
  info: { color: "#ffffff" },
  profileButton: { marginTop: 20, padding: 10, backgroundColor: "#ddd", borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#000", fontSize: 16 },
  warningBanner: { backgroundColor: "#aa0000" },
};
