import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const LoginScreen = ({ navigation, setEmail: setParentEmail, setPassword: setParentPassword, handleLogin, styles }) => {
  const [email, setLocalEmail] = useState("");
  const [password, setLocalPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
        source={require('../assets/logo.png')} // Corrigé le chemin si à la racine
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
    </SafeAreaView>
  );
};

export default LoginScreen;