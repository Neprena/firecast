import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Constants from "expo-constants"; // Pour récupérer la version

const API_URL = "https://api.ecascan.npna.ch";
const APP_VERSION = Constants.expoConfig?.version || "N/A"; // Version depuis app.json via Constants

const LoginScreen = ({ navigation, setEmail: setParentEmail, setPassword: setParentPassword, handleLogin, styles }) => {
  const [email, setLocalEmail] = useState("");
  const [password, setLocalPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState("Vérification... ⏳");
  const [serverOnline, setServerOnline] = useState(null);

  // Vérification du statut du serveur
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: "check@ecascan.local", password: "test" }),
          timeout: 5000,
        });
        //console.log(`[${new Date().toLocaleString()}] Réponse serveur : Status ${response.status}, OK: ${response.ok}`);
        
        if (response.ok || response.status === 401) {
          setServerStatus("En ligne ✅");
          setServerOnline(true);
        } else {
          setServerStatus("Hors ligne ❌");
          setServerOnline(false);
        }
      } catch (error) {
        console.warn(`[${new Date().toLocaleString()}] Erreur vérification serveur : ${error.message}`);
        setServerStatus("Hors ligne ❌");
        setServerOnline(false);
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const performLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez entrer un email et un mot de passe.");
      return;
    }
    setLoading(true);
    try {
      console.log(`[${new Date().toLocaleString()}] Tentative de connexion pour ${email}`);
      await handleLogin(email, password);
      setParentEmail(email);
      setParentPassword(password);
      console.log(`[${new Date().toLocaleString()}] Connexion réussie pour ${email}`);
    } catch (error) {
      console.error(`[${new Date().toLocaleString()}] Échec de la connexion : ${error.message}`);
      Alert.alert("Erreur", error.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../assets/logo.png")}
        style={{ width: 300, height: 300, alignSelf: "center", marginBottom: 20 }}
      />

      <View style={styles.input}>
        <Icon name="email" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={{ flex: 1 }}
          placeholder="Email"
          value={email}
          onChangeText={setLocalEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.input}>
        <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={{ flex: 1 }}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setLocalPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && { backgroundColor: "#aaa" }]}
        onPress={performLogin}
        disabled={loading}
      >
        <Icon name="login" size={20} color="#fff" style={styles.buttonIcon} />
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text
            style={styles.buttonText}
            allowFontScaling={false}
            numberOfLines={1}
            ellipsizeMode="none"
          >
            Se connecter
          </Text>
        )}
      </TouchableOpacity>

      {/* Statut serveur et version en bas avec marge */}
      <Text
        style={{
          color: serverOnline === null ? "#666" : serverOnline ? "green" : "red",
          fontSize: 12,
          textAlign: "center",
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
        }}
      >
        {serverStatus} | Version {APP_VERSION}
      </Text>
    </SafeAreaView>
  );
};

export default LoginScreen;