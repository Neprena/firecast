import React, { useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View, TextInput, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const LoginScreen = ({
  navigation,
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  styles,
  isConnected,
}) => {
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState(""); // Pour erreurs non spécifiques aux champs

  const validateEmailFormat = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const onLoginPress = async () => {
    setLoading(true);
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    // Validation côté client
    if (!email) {
      setEmailError("L’email est requis");
      setLoading(false);
      return;
    }
    if (!validateEmailFormat(email)) {
      setEmailError("L’email n’est pas valide");
      setLoading(false);
      return;
    }
    if (!password) {
      setPasswordError("Le mot de passe est requis");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setPasswordError("Le mot de passe doit avoir au moins 6 caractères");
      setLoading(false);
      return;
    }

    try {
      await handleLogin();
    } catch (error) {
      if (error.message === "Invalid credentials or API key") {
        setEmailError("Email ou mot de passe incorrect");
        setPasswordError("Email ou mot de passe incorrect");
      } else if (!isConnected) {
        setGeneralError("Impossible de se connecter au serveur. Vérifiez votre connexion.");
      } else {
        setGeneralError(error.message || "Une erreur inattendue s’est produite");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>ECAScanPhone - Connexion</Text>

      <View style={[styles.input, emailError && { borderColor: styles.deleteButton.backgroundColor }]}>
        <Icon name="email" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={{ flex: 1 }}
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError("");
            setGeneralError("");
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      {emailError ? <Text style={styles.warningText}>{emailError}</Text> : null}

      <View style={[styles.input, passwordError && { borderColor: styles.deleteButton.backgroundColor }]}>
        <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={{ flex: 1 }}
          placeholder="Mot de passe"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError("");
            setGeneralError("");
          }}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>
      {passwordError ? <Text style={styles.warningText}>{passwordError}</Text> : null}

      {generalError ? (
        <Text style={[styles.warningText, { marginBottom: 10 }]}>{generalError}</Text>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={onLoginPress} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Icon name="login" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Connexion</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={[styles.info, { color: isConnected ? "green" : "red", marginTop: 20 }]}>
        Serveur : {isConnected ? "Connecté ✅" : "Déconnecté ❌"}
      </Text>
    </SafeAreaView>
  );
};

export default LoginScreen;