import React, { useCallback, useEffect } from "react";
import { SafeAreaView, Text, FlatList, TouchableOpacity, View, RefreshControl } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MessagesScreen = ({ navigation, messages, fetchMessages, styles, isConnected, subscriptionEndDate, role }) => {
  const groupMessagesByDate = (msgs) => {
    const grouped = {};
    msgs.forEach((msg) => {
      const date = new Date(msg.timestamp).toLocaleDateString();
      grouped[date] = grouped[date] || [];
      grouped[date].push(msg);
    });
    return Object.keys(grouped).map((date) => ({ title: date, data: grouped[date] }));
  };

  const sections = groupMessagesByDate(messages);
  const onRefresh = useCallback(() => fetchMessages(), []);

  // Les admins ne sont pas concernés par l’expiration
  const isSubscriptionActive = role === "admin" || (subscriptionEndDate && new Date(subscriptionEndDate) > new Date());

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(async (notification) => {
      console.log("Notification reçue au premier plan :", notification);
      const data = notification.request.content.data || {};
      const notificationsEnabled = JSON.parse(await AsyncStorage.getItem("notificationsEnabled") || "true");
      if (data.type === "new_message" && notificationsEnabled) {
        console.log("Nouveau message détecté, rafraîchissement...");
        fetchMessages();
      }
    });

    return () => subscription.remove();
  }, [fetchMessages]);

  if (!isSubscriptionActive) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Abonnement expiré</Text>
        <Text style={styles.info}>Votre abonnement a expiré. Veuillez vous réabonner depuis votre profil pour accéder aux messages.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Profile")}>
          <Text style={styles.buttonText}>Aller au profil</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!isConnected && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>⚠ Mode hors ligne - Affichage des messages stockés</Text>
        </View>
      )}
      <Text style={styles.title}>Historique des Messages</Text>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View>
            <Text style={styles.dateHeader}>{item.title}</Text>
            {item.data.map((msg) => (
              <View key={msg.id} style={styles.message}>
                <Text style={styles.messageText}>{msg.message}</Text>
                <Text style={styles.timestamp}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            ))}
          </View>
        )}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
      />
      <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate("Profile")}>
        <Text style={styles.buttonText}>Profil / À propos</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MessagesScreen;