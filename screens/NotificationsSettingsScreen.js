import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, Switch, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

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
    const loadSettings = async () => {
      setLoading(true);
      try {
        const storedSettings = await AsyncStorage.getItem("notificationSettings");
        const canSeeDebug = role && role.toLowerCase() === "admin";
        const canSeePrioritaire = role && (role.toLowerCase() === "vip" || role.toLowerCase() === "admin");
        const canSeeInfo = true;

        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setNotificationSettings({
            debug: canSeeDebug ? (parsedSettings.debug || false) : false,
            info: canSeeInfo ? (parsedSettings.info !== undefined ? parsedSettings.info : true) : false,
            prioritaire: canSeePrioritaire ? (parsedSettings.prioritaire || false) : false,
          });
        } else {
          const defaultSettings = {
            debug: canSeeDebug ? false : false,
            info: canSeeInfo ? true : false,
            prioritaire: canSeePrioritaire ? false : false,
          };
          await AsyncStorage.setItem("notificationSettings", JSON.stringify(defaultSettings));
          setNotificationSettings(defaultSettings);
          await syncSettingsWithBackend(defaultSettings);
        }
      } catch (error) {
        console.warn(`Erreur lors du chargement des paramètres : ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [role]);

  const syncSettingsWithBackend = async (settings) => {
    try {
      const email = await AsyncStorage.getItem("email");
      if (email) {
        const response = await fetch(`${API_URL}/update-notification-settings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
          },
          body: JSON.stringify({ email, notificationSettings: settings }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        console.log(`Paramètres synchronisés pour ${email}:`, result);
      }
    } catch (error) {
      console.warn(`Erreur lors de la synchronisation avec le backend : ${error.message}`);
    }
  };

  const toggleNotification = async (type, value) => {
    setLoading(true);
    try {
      const newSettings = { ...notificationSettings, [type]: value };
      setNotificationSettings(newSettings);
      await AsyncStorage.setItem("notificationSettings", JSON.stringify(newSettings));
      await syncSettingsWithBackend(newSettings);
    } catch (error) {
      console.warn(`Erreur lors de la mise à jour des paramètres : ${error.message}`);
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
            <Text style={styles.toggleLabel}>Notifications Debug</Text>
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
            <Text style={styles.toggleLabel}>Notifications Info</Text>
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
            <Text style={styles.toggleLabel}>Notifications Prioritaires</Text>
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
        <Text
          style={styles.buttonText}
          allowFontScaling={false}
          numberOfLines={1}
          ellipsizeMode="none"
        >
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