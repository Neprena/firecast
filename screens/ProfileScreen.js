import React from "react";
import { SafeAreaView, Text, TouchableOpacity } from "react-native";

const ProfileScreen = ({ navigation, email, handleLogout, styles, isConnected }) => (
  <SafeAreaView style={styles.container}>
    <Text style={styles.title}>Profil</Text>
    <Text style={styles.info}>Utilisateur: {email}</Text>
    <Text style={styles.info}>Statut: Connecté</Text>
    <Text style={[styles.info, { color: isConnected ? "green" : "red" }]}>
      Serveur : {isConnected ? "Connecté ✅" : "Déconnecté ❌"}
    </Text>
    <TouchableOpacity style={styles.button} onPress={handleLogout}>
      <Text style={styles.buttonText}>Se déconnecter</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Messages")}>
      <Text style={styles.buttonText}>Retour</Text>
    </TouchableOpacity>
  </SafeAreaView>
);

export default ProfileScreen;