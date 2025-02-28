import React from "react";
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";

const LoginScreen = ({ email, setEmail, password, setPassword, handleLogin, styles, isConnected }) => (
  <SafeAreaView style={styles.container}>
    {!isConnected && (
      <View style={styles.warningBanner}>
        <Text style={styles.warningText}>⚠ Connexion au serveur perdue</Text>
      </View>
    )}
    <Text style={styles.title}>Connexion</Text>
    <TextInput
      placeholder="E-mail"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      style={styles.input}
    />
    <TextInput
      placeholder="Mot de passe"
      value={password}
      onChangeText={setPassword}
      secureTextEntry
      style={styles.input}
    />
    <TouchableOpacity style={styles.button} onPress={handleLogin}>
      <Text style={styles.buttonText}>Se connecter</Text>
    </TouchableOpacity>
  </SafeAreaView>
);

export default LoginScreen;