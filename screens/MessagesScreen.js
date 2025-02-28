import React, { useCallback, useEffect } from "react";
import { SafeAreaView, Text, FlatList, TouchableOpacity, View, RefreshControl } from "react-native";
import * as Notifications from "expo-notifications";

const MessagesScreen = ({ navigation, messages, fetchMessages, styles, isConnected }) => {
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

  useEffect(() => {
    // Listener pour les notifications reçues quand l'app est au premier plan
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const { request } = notification;
      const data = request.content.data;
      // Vérifie si la notification concerne un nouveau message
      if (data && data.type === "new_message") {
        fetchMessages(); // Rafraîchit la liste
      }
    });

    // Nettoyage du listener
    return () => subscription.remove();
  }, [fetchMessages]);

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