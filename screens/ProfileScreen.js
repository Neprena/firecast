import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, TouchableOpacity, Switch, View, TextInput, Alert, Linking, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import Icon from "react-native-vector-icons/MaterialIcons";

const APP_VERSION = Constants.expoConfig?.version || "1.0.0";

const ProfileScreen = ({ navigation, email, handleLogout, styles, isConnected, subscriptionEndDate, role }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadNotificationSetting = async () => {
      try {
        const value = await AsyncStorage.getItem("notificationsEnabled");
        if (value !== null) {
          setNotificationsEnabled(JSON.parse(value));
        } else {
          await AsyncStorage.setItem("notificationsEnabled", JSON.stringify(true));
        }
      } catch (error) {
        console.warn("Erreur lors du chargement des paramètres de notification :", error);
      }
    };
    loadNotificationSetting();
  }, []);

  const toggleNotifications = async (value) => {
    try {
      setNotificationsEnabled(value);
      await AsyncStorage.setItem("notificationsEnabled", JSON.stringify(value));
      console.log("Notifications mises à jour :", value);
    } catch (error) {
      console.warn("Erreur lors de la mise à jour des notifications :", error);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Erreur", "Tous les champs sont requis.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Erreur", "Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Erreur", "Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://api.ecascan.npna.ch/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "c80b17dd-5cdc-4b66-b5cf-1d4d62860fbc",
        },
        body: JSON.stringify({
          email,
          oldPassword,
          newPassword,
        }),
      });

      const text = await response.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (parseError) {
        console.error("Erreur de parsing JSON :", parseError, "Réponse brute :", text);
        throw new Error("Réponse serveur invalide");
      }

      if (!response.ok) {
        throw new Error(json.error || `Erreur serveur (code ${response.status})`);
      }

      Alert.alert("Succès", "Mot de passe changé avec succès !");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);
    } catch (error) {
      console.error("Erreur dans handleChangePassword :", error.message);
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.ecascan.npna.ch/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "c80b17dd-5cdc-4b66-b5cf-1d4d62860fbc",
        },
        body: JSON.stringify({ email }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Erreur lors de la création de la session de paiement");
      Linking.openURL(json.checkoutUrl);
    } catch (error) {
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  const subscriptionStatus =
    role === "admin"
      ? "Administrateur - Pas d’expiration"
      : subscriptionEndDate
      ? new Date(subscriptionEndDate) > new Date()
        ? `Actif jusqu'au ${new Date(subscriptionEndDate).toLocaleDateString()}`
        : "Expiré"
      : "Non abonné";

  const isSubscriptionExpired = role !== "admin" && (!subscriptionEndDate || new Date(subscriptionEndDate) < new Date());

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>ECAScanPhone</Text>
      <Text style={styles.subtitle}>Version {APP_VERSION}</Text>
      <Text style={styles.subtitle}>Profil</Text>
      <Text style={styles.subtitle}>Utilisateur: {email}</Text>
      <Text style={styles.subtitle}>Statut: Connecté</Text>
      <Text style={styles.subtitle}>Rôle: {role}</Text>
      <Text style={[styles.subtitle, { color: isConnected ? "green" : "red" }]}>
        Serveur : {isConnected ? "Connecté ✅" : "Déconnecté ❌"}
      </Text>
      <Text style={styles.subtitle}>Abonnement: {subscriptionStatus}</Text>

      {isSubscriptionExpired && (
        <TouchableOpacity style={styles.button} onPress={handleSubscribe}>
          <Icon name="payment" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Se réabonner</Text>
        </TouchableOpacity>
      )}
      {role === "admin" && (
        <TouchableOpacity style={[styles.button, { backgroundColor: "#ccc" }]} disabled>
          <Icon name="payment" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Se réabonner</Text>
        </TouchableOpacity>
      )}

      <View style={styles.toggleContainer}>
        <View style={styles.toggleRow}>
          <Icon name="notifications" size={20} color={styles.subtitle.color} style={styles.toggleIcon} />
          <Text style={styles.toggleLabel}>Activer les notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={notificationsEnabled ? "#007BFF" : "#f4f3f4"}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setIsChangingPassword(!isChangingPassword)}
      >
        <Icon name="lock" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>
          {isChangingPassword ? "Annuler" : "Changer le mot de passe"}
        </Text>
      </TouchableOpacity>

      {isChangingPassword && (
        <View style={styles.passwordChangeContainer}>
          <View style={styles.input}>
            <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={{ flex: 1 }}
              placeholder="Ancien mot de passe"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />
          </View>
          <View style={styles.input}>
            <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={{ flex: 1 }}
              placeholder="Nouveau mot de passe"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>
          <View style={styles.input}>
            <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={{ flex: 1 }}
              placeholder="Confirmer le nouveau mot de passe"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
            <Icon name="save" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Valider le changement</Text>
          </TouchableOpacity>
        </View>
      )}

      {role === "admin" && (
        <TouchableOpacity
          style={[styles.button, { marginTop: 20 }]}
          onPress={() => navigation.navigate("Admin")}
        >
          <Icon name="admin-panel-settings" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Administration</Text>
        </TouchableOpacity>
      )}

      <View style={{ flex: 1 }} />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Messages")}>
        <Icon name="arrow-back" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Retour</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={styles.button.backgroundColor} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default ProfileScreen;