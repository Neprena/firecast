import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, Text, View, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons"; // Assure-toi que MaterialIcons est utilisé
import WebSocket from "react-native-websocket";
import { Audio } from "expo-av";

const MessagesScreen = ({
  navigation,
  messages,
  fetchMessages,
  styles,
  isConnected,
  subscriptionEndDate,
  role,
  email,
}) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const soundRef = useRef(null);
  const isFocused = useRef(true);

  useEffect(() => {
    loadMessagesFromStorage();

    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/notification.mp3"),
          { shouldPlay: false }
        );
        soundRef.current = sound;
        console.log(`[${new Date().toLocaleString()}] Son chargé avec succès`);
      } catch (error) {
        console.error(`[${new Date().toLocaleString()}] Erreur lors du chargement du son : ${error.message}`);
      }
    };
    loadSound();

    const unsubscribe = navigation.addListener("focus", () => {
      isFocused.current = true;
    });
    const unsubscribeBlur = navigation.addListener("blur", () => {
      isFocused.current = false;
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(error => {
          console.error(`[${new Date().toLocaleString()}] Erreur lors du démontage du son : ${error.message}`);
        });
      }
      unsubscribe();
      unsubscribeBlur();
    };
  }, [navigation]);

  const loadMessagesFromStorage = async () => {
    setLoading(true);
    try {
      const storedMessages = await AsyncStorage.getItem("messages");
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages).map(msg => ({
          ...msg,
          fadeAnim: new Animated.Value(1), // Messages existants déjà visibles
        }));
        console.log(`[${new Date().toLocaleString()}] Messages chargés depuis AsyncStorage : ${parsedMessages.length} messages`);
        setAllMessages(parsedMessages);
      } else {
        console.log(`[${new Date().toLocaleString()}] Aucun message trouvé dans AsyncStorage`);
      }
      fetchMessages();
    } catch (error) {
      console.error(`[${new Date().toLocaleString()}] Erreur lors du chargement depuis AsyncStorage : ${error.message}`);
      fetchMessages();
    } finally {
      setLoading(false);
    }
  };

  const handleWebSocketMessage = async (event) => {
    const newMessage = JSON.parse(event.data);
    const animatedMessage = {
      ...newMessage,
      fadeAnim: new Animated.Value(0),
      isNew: true, // Toujours marqué comme nouveau pour l’animation initiale
    };

    setAllMessages((prevMessages) => {
      const updatedMessages = [animatedMessage, ...prevMessages];
      console.log(`[${new Date().toLocaleString()}] Nouveau message reçu via WebSocket : ${newMessage.message}, type: ${newMessage.type}`);
      AsyncStorage.setItem("messages", JSON.stringify(updatedMessages)).then(() => {
        console.log(`[${new Date().toLocaleString()}] Messages mis à jour dans AsyncStorage : ${updatedMessages.length} messages`);
      }).catch((error) => {
        console.error(`[${new Date().toLocaleString()}] Erreur lors de la mise à jour d'AsyncStorage : ${error.message}`);
      });
      return updatedMessages;
    });

    if (isFocused.current && soundRef.current) {
      try {
        await soundRef.current.replayAsync();
        console.log(`[${new Date().toLocaleString()}] Son de notification joué`);
      } catch (error) {
        console.error(`[${new Date().toLocaleString()}] Erreur lors de la lecture du son : ${error.message}`);
      }
    }

    Animated.timing(animatedMessage.fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const filteredMessages = allMessages.filter((msg) =>
    msg.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fonction pour déterminer la couleur de fond selon le type (permanente)
  const getMessageBackgroundColor = (type) => {
    switch (type) {
      case "Debug": return "#F5F5F5"; // Gris légèrement plus clair pour Debug
      case "Info": return "#f0f0f0"; // Gris clair standard pour Info
      case "Prioritaire": return "#ff6961"; // Rouge pour Prioritaire
      default: return "#f0f0f0"; // Gris clair par défaut
    }
  };

  // Fonction pour déterminer l’icône selon le type
  const getMessageIcon = (type) => {
    switch (type) {
      case "Debug": return "bug-report"; // Icône pour Debug
      case "Info": return "info"; // Icône pour Info
      case "Prioritaire": return "warning"; // Icône pour Prioritaire
      default: return "info"; // Icône par défaut
    }
  };

  const renderMessage = ({ item }) => (
    <Animated.View style={{ opacity: item.fadeAnim || 1 }}>
      <View style={[styles.message, { backgroundColor: getMessageBackgroundColor(item.type) }]}>
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </Text>
        <Icon name={getMessageIcon(item.type)} size={16} color="#666" style={styles.messageIcon} />
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>ECAScanPhone - Messages</Text>

      <View style={styles.input}>
        <Icon name="search" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={{ flex: 1 }}
          placeholder="Rechercher dans les messages"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filteredMessages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        ListEmptyComponent={<Text style={styles.info}>Aucun message</Text>}
        refreshing={loading}
        onRefresh={fetchMessages}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
      />

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("Profile")}
      >
        <Icon name="person" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Profil</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={styles.button.backgroundColor} />
        </View>
      )}

      <WebSocket
        url="ws://websocket.ecascan.npna.ch:8080" // URL non sécurisée directe
        onOpen={() => console.log("WebSocket connecté avec succès")}
        onMessage={handleWebSocketMessage}
        onError={(error) => console.error("Détails erreur WebSocket :", JSON.stringify(error))}
        onClose={(event) => console.log("WebSocket déconnecté :", event ? `${event.code} - ${event.reason}` : "Événement non défini")}
        reconnect
      />
    </SafeAreaView>
  );
};

export default MessagesScreen;