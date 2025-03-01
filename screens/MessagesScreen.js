import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, Text, View, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
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
  const soundRef = useRef(null); // Référence pour le son
  const isFocused = useRef(true); // Suivre si l’écran est actif

  useEffect(() => {
    loadMessagesFromStorage(); // Chargement initial depuis AsyncStorage

    // Charger le son au montage
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/notification.mp3"), // Chemin vers ton fichier son
          { shouldPlay: false } // Ne pas jouer immédiatement
        );
        soundRef.current = sound;
        console.log(`[${new Date().toLocaleString()}] Son chargé avec succès`);
      } catch (error) {
        console.error(`[${new Date().toLocaleString()}] Erreur lors du chargement du son : ${error.message}`);
      }
    };
    loadSound();

    // Nettoyer le son au démontage
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(error => {
          console.error(`[${new Date().toLocaleString()}] Erreur lors du démontage du son : ${error.message}`);
        });
      }
    };
  }, []);

  // Suivre si l’écran est en focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      isFocused.current = true;
    });
    const unsubscribeBlur = navigation.addListener("blur", () => {
      isFocused.current = false;
    });
    return () => {
      unsubscribe();
      unsubscribeBlur();
    };
  }, [navigation]);

  const loadMessagesFromStorage = async () => {
    setLoading(true);
    try {
      const storedMessages = await AsyncStorage.getItem("messages");
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        console.log(`[${new Date().toLocaleString()}] Messages chargés depuis AsyncStorage : ${parsedMessages.length} messages`);
        setAllMessages(parsedMessages);
      } else {
        console.log(`[${new Date().toLocaleString()}] Aucun message en AsyncStorage, récupération initiale depuis le serveur`);
        await fetchMessagesFromServer();
      }
    } catch (error) {
      console.error(`[${new Date().toLocaleString()}] Erreur lors du chargement depuis AsyncStorage : ${error.message}, tentative de récupération serveur`);
      await fetchMessagesFromServer();
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagesFromServer = async () => {
    if (loading) {
      console.log(`[${new Date().toLocaleString()}] Rafraîchissement annulé : une requête est déjà en cours`);
      return;
    }
    setLoading(true);
    try {
      console.log(`[${new Date().toLocaleString()}] Récupération des messages depuis le serveur pour ${email}`);
      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ email }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Erreur lors de la récupération des messages");

      console.log(`[${new Date().toLocaleString()}] Messages récupérés depuis le serveur : ${json.length} messages`);
      setAllMessages(json);
      await AsyncStorage.setItem("messages", JSON.stringify(json));
      console.log(`[${new Date().toLocaleString()}] Messages mis à jour dans AsyncStorage : ${json.length} messages`);
    } catch (error) {
      console.error(`[${new Date().toLocaleString()}] Erreur lors de la récupération depuis le serveur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWebSocketMessage = async (event) => {
    const newMessage = JSON.parse(event.data);
    const animatedMessage = {
      ...newMessage,
      fadeAnim: new Animated.Value(0),
      isNew: true,
    };

    setAllMessages((prevMessages) => {
      const updatedMessages = [animatedMessage, ...prevMessages];
      console.log(`[${new Date().toLocaleString()}] Nouveau message reçu via WebSocket : ${newMessage.message}`);
      // Mettre à jour AsyncStorage
      AsyncStorage.setItem("messages", JSON.stringify(updatedMessages)).then(() => {
        console.log(`[${new Date().toLocaleString()}] Messages mis à jour dans AsyncStorage : ${updatedMessages.length} messages`);
      }).catch((error) => {
        console.error(`[${new Date().toLocaleString()}] Erreur lors de la mise à jour d'AsyncStorage : ${error.message}`);
      });
      return updatedMessages;
    });

    // Jouer le son si l’écran est en focus
    if (isFocused.current && soundRef.current) {
      try {
        await soundRef.current.replayAsync(); // Rejoue le son à chaque nouveau message
        console.log(`[${new Date().toLocaleString()}] Son de notification joué`);
      } catch (error) {
        console.error(`[${new Date().toLocaleString()}] Erreur lors de la lecture du son : ${error.message}`);
      }
    }

    // Lancer l’animation de fade-in
    Animated.timing(animatedMessage.fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // Après 2 secondes, retirer la couleur rouge
      setTimeout(() => {
        setAllMessages((prevMessages) =>
          prevMessages.map(msg =>
            msg.id === animatedMessage.id ? { ...msg, isNew: false } : msg
          )
        );
      }, 2000);
    });
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const filteredMessages = allMessages.filter((msg) =>
    msg.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMessage = ({ item }) => (
    <Animated.View style={{ opacity: item.fadeAnim || 1 }}>
      <View style={[styles.message, item.isNew && { backgroundColor: "#FFCCCB" }]}>
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
        onRefresh={fetchMessagesFromServer}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }} // Espacement autour de la liste
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
        url="ws://84.234.18.3:8080"
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

const API_URL = "http://84.234.18.3:3001";
const API_KEY = "c80b17dd-5cdc-4b66-b5cf-1d4d62860fbc";