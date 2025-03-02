import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from "react-native"; // Ajouté Image
import Icon from "react-native-vector-icons/MaterialIcons";

const LoginScreen = ({ navigation, setEmail: setParentEmail, setPassword: setParentPassword, handleLogin, styles }) => {
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
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../assets/logo.png')} // Chemin vers ton logo
        style={{ width: 300, height: 300, alignSelf: "center", marginBottom: 20 }} // Grand logo
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
    </SafeAreaView>
  );
};

export default LoginScreen;