import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";

const LoginScreen = ({ navigation, setEmail: setParentEmail, setPassword: setParentPassword, handleLogin }) => {
  const [email, setLocalEmail] = useState("");
  const [password, setLocalPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "https://api.ecascan.npna.ch";
  const API_KEY = "c80b17dd-5cdc-4b66-b5cf-1d4d62860fbc";

  const performLogin = async () => {
    setLoading(true);
    try {
      console.log(`[${new Date().toLocaleString()}] Tentative de connexion pour ${email} vers ${API_URL}/login`);
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ email, password }),
      });
      console.log(`[${new Date().toLocaleString()}] Réponse serveur : statut ${response.status}`);
      
      const json = await response.json();
      if (!response.ok) {
        console.error(`[${new Date().toLocaleString()}] Erreur serveur : ${json.error || "Erreur inconnue"}, statut: ${response.status}`);
        throw new Error(json.error || "Erreur lors de la connexion");
      }

      console.log(`[${new Date().toLocaleString()}] Connexion réussie pour ${email}`);
      setParentEmail(email);
      setParentPassword("");
      handleLogin();
    } catch (error) {
      console.error(`[${new Date().toLocaleString()}] Échec de la connexion : ${error.message}, détails : ${error.stack || "Aucun détail supplémentaire"}`);
      Alert.alert("Erreur", error.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion à ECAScanPhone</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setLocalEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setLocalPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={performLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Se connecter</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#aaa",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoginScreen;