import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, Switch, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { messaging } from "../firebaseConfig"; // Importer messaging pour récupérer le token FCM

const API_URL = "https://api.ecascan.npna.ch";
const API_KEY = "c80b17dd-5cdc-4b66-b5cf-1d4d62860fbc";

const NotificationsSettingsScreen = ({ navigation, styles, role }) => {
  const [loading, setLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    debug: false,
    info: true,
    prioritaire: false,
  });

  useEffect(() => {
    console.log(`[${new Date().toLocaleString()}] useEffect déclenché avec rôle : ${role}`);
    const loadSettings = async () => {
      setLoading(true);
      try {
        const storedSettings = await AsyncStorage.getItem("notificationSettings");
        const canSeeDebug = role && role.toLowerCase() === "admin";
        const canSeePrioritaire = role && (role.toLowerCase() === "vip" || role.toLowerCase() === "admin");
        const canSeeInfo = true;

        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          const settings = {
            debug: canSeeDebug ? (parsedSettings.debug || false) : false,
            info: canSeeInfo ? (parsedSettings.info !== undefined ? parsedSettings.info : true) : false,
            prioritaire: canSeePrioritaire ? (parsedSettings.prioritaire || false) : false,
          };
          setNotificationSettings(settings);
          console.log(`[${new Date().toLocaleString()}] Paramètres chargés depuis AsyncStorage :`, parsedSettings);
          // Synchronise avec le backend au chargement initial
          await syncNotificationSettings(settings);
        } else {
          const defaultSettings = {
            debug: canSeeDebug ? false : false,
            info: canSeeInfo ? true : false,
            prioritaire: canSeePrioritaire ? false : false,
          };
          await AsyncStorage.setItem("notificationSettings", JSON.stringify(defaultSettings));
          setNotificationSettings(defaultSettings);
          console.log(`[${new Date().toLocaleString()}] Paramètres initialisés par défaut :`, defaultSettings);
          // Synchronise avec le backend pour les réglages par défaut
          await syncNotificationSettings(defaultSettings);
        }
      } catch (error) {
        console.warn(`[${new Date().toLocaleString()}] Erreur lors du chargement des paramètres : ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [role]);

  const syncNotificationSettings = async (settings, email) => {
    try {
      const token = await messaging().getToken();
      const storedEmail = email || (await AsyncStorage.getItem("email")); // Récupère l'email depuis AsyncStorage si non fourni
      if (!storedEmail) {
        console.warn(`[${new Date().toLocaleString()}] Email non disponible pour synchronisation`);
        return;
      }
      const response = await fetch(`${API_URL}/register-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify({ email: storedEmail, token, notificationSettings: settings }),
      });
      const json = await response.json();
      if (response.ok) {
        console.log(`[${new Date().toLocaleString()}] Notification settings synchronisés avec le backend :`, json);
      } else {
        console.warn(`[${new Date().toLocaleString()}] Échec de la synchronisation des notification settings :`, json);
      }
    } catch (error) {
      console.error(`[${new Date().toLocaleString()}] Erreur lors de la synchronisation des notification settings : ${error.message}`);
    }
  };

  const toggleNotification = async (type, value) => {
    setLoading(true);
    try {
      const newSettings = { ...notificationSettings, [type]: value };
      setNotificationSettings(newSettings);
      await AsyncStorage.setItem("notificationSettings", JSON.stringify(newSettings));
      console.log(`[${new Date().toLocaleString()}] Paramètre ${type} mis à jour localement :`, newSettings);
      // Synchronise avec le backend immédiatement après la mise à jour locale
      await syncNotificationSettings(newSettings);
    } catch (error) {
      console.warn(`[${new Date().toLocaleString()}] Erreur lors de la mise à jour des paramètres : ${error.message}`);
      Alert.alert("Erreur", "Impossible de sauvegarder les paramètres");
    } finally {
      setLoading(false);
    }
  };

  const canSeeDebug = role && role.toLowerCase() === "admin";
  const canSeePrioritaire = role && (role.toLowerCase() === "vip" || role.toLowerCase() === "admin");
  const canSeeInfo = true;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Paramètres des notifications</Text>

      {canSeeDebug && (
        <View style={styles.toggleContainer}>
          <View style={styles.toggleRow}>
            <Icon name="bug-report" size={20} color={styles.subtitle.color} style={styles.toggleIcon} />
            <Text style={styles.toggleLabel}>Notifications debug</Text>
            <Switch
              value={notificationSettings.debug}
              onValueChange={(value) => toggleNotification("debug", value)}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={notificationSettings.debug ? "#007BFF" : "#f4f3f4"}
            />
          </View>
        </View>
      )}

      {canSeeInfo && (
        <View style={styles.toggleContainer}>
          <View style={styles.toggleRow}>
            <Icon name="info" size={20} color={styles.subtitle.color} style={styles.toggleIcon} />
            <Text style={styles.toggleLabel}>Notifications (Canton VD)</Text>
            <Switch
              value={notificationSettings.info}
              onValueChange={(value) => toggleNotification("info", value)}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={notificationSettings.info ? "#007BFF" : "#f4f3f4"}
            />
          </View>
        </View>
      )}

      {canSeePrioritaire && (
        <View style={styles.toggleContainer}>
          <View style={styles.toggleRow}>
            <Icon name="warning" size={20} color={styles.subtitle.color} style={styles.toggleIcon} />
            <Text style={styles.toggleLabel}>Notifications prioritaires (SDIS Broye-vully)</Text>
            <Switch
              value={notificationSettings.prioritaire}
              onValueChange={(value) => toggleNotification("prioritaire", value)}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={notificationSettings.prioritaire ? "#007BFF" : "#f4f3f4"}
            />
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("Profile")}
      >
        <Icon name="arrow-back" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText} allowFontScaling={false} numberOfLines={1} ellipsizeMode="none">
          Retour
        </Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={styles.button.backgroundColor} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default NotificationsSettingsScreen;