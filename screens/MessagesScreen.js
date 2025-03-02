import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, Text, View, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Animated, Linking } from "react-native";
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
  const [notificationSettings, setNotificationSettings] = useState({
    debug: false,
    info: true,
    prioritaire: false,
  });
  const [messageFilters, setMessageFilters] = useState({
    debug: false,
    info: true,
    prioritaire: false,
  });
  const soundRef = useRef(null);
  const isFocused = useRef(true);

  const isSubscriptionExpired = role !== "admin" && (!subscriptionEndDate || new Date(subscriptionEndDate) < new Date());
  const canSeeDebug = role && role.toLowerCase() === "admin";
  const canSeePrioritaire = role && (role.toLowerCase() === "vip" || role.toLowerCase() === "admin");
  const canSeeInfo = true;

  useEffect(() => {
    loadMessagesFromStorage();
    loadNotificationSettings();
    loadMessageFilters();

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

  const loadNotificationSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem("notificationSettings");
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setNotificationSettings({
          debug: canSeeDebug ? (parsedSettings.debug || false) : false,
          info: canSeeInfo ? (parsedSettings.info !== undefined ? parsedSettings.info : true) : false,
          prioritaire: canSeePrioritaire ? (parsedSettings.prioritaire || false) : false,
        });
        console.log(`[${new Date().toLocaleString()}] Paramètres de notifications chargés :`, parsedSettings);
      } else {
        const defaultSettings = {
          debug: canSeeDebug ? true : false,
          info: canSeeInfo ? true : false,
          prioritaire: canSeePrioritaire ? true : false,
        };
        await AsyncStorage.setItem("notificationSettings", JSON.stringify(defaultSettings));
        setNotificationSettings(defaultSettings);
        console.log(`[${new Date().toLocaleString()}] Paramètres de notifications initialisés par défaut`);
      }
    } catch (error) {
      console.warn(`[${new Date().toLocaleString()}] Erreur lors du chargement des paramètres de notifications : ${error.message}`);
    }
  };

  const loadMessageFilters = async () => {
    try {
      const storedFilters = await AsyncStorage.getItem("messageFilters");
      if (storedFilters) {
        const parsedFilters = JSON.parse(storedFilters);
        setMessageFilters({
          debug: canSeeDebug ? (parsedFilters.debug || false) : false,
          info: canSeeInfo ? (parsedFilters.info !== undefined ? parsedFilters.info : true) : false,
          prioritaire: canSeePrioritaire ? (parsedFilters.prioritaire || false) : false,
        });
        console.log(`[${new Date().toLocaleString()}] Filtres de messages chargés :`, parsedFilters);
      } else {
        const defaultFilters = {
          debug: canSeeDebug ? true : false,
          info: canSeeInfo ? true : false,
          prioritaire: canSeePrioritaire ? true : false,
        };
        await AsyncStorage.setItem("messageFilters", JSON.stringify(defaultFilters));
        setMessageFilters(defaultFilters);
        console.log(`[${new Date().toLocaleString()}] Filtres de messages initialisés par défaut`);
      }
    } catch (error) {
      console.warn(`[${new Date().toLocaleString()}] Erreur lors du chargement des filtres de messages : ${error.message}`);
    }
  };

  const toggleFilter = async (type) => {
    const newFilters = { ...messageFilters, [type]: !messageFilters[type] };
    setMessageFilters(newFilters);
    try {
      await AsyncStorage.setItem("messageFilters", JSON.stringify(newFilters));
      console.log(`[${new Date().toLocaleString()}] Filtre ${type} mis à jour : ${newFilters[type]}`);
    } catch (error) {
      console.warn(`[${new Date().toLocaleString()}] Erreur lors de la mise à jour des filtres : ${error.message}`);
    }
  };

  const loadMessagesFromStorage = async () => {
    setLoading(true);
    try {
      const storedMessages = await AsyncStorage.getItem("messages");
      let messagesToSet = [];
      if (storedMessages) {
        messagesToSet = JSON.parse(storedMessages).map(msg => ({
          ...msg,
          fadeAnim: new Animated.Value(1),
        }));
        console.log(`[${new Date().toLocaleString()}] Messages chargés depuis AsyncStorage : ${messagesToSet.length} messages`);
      } else {
        console.log(`[${new Date().toLocaleString()}] Aucun message trouvé dans AsyncStorage`);
      }

      const fetchedMessages = await fetchMessages();
      if (fetchedMessages && Array.isArray(fetchedMessages)) {
        messagesToSet = fetchedMessages.map(msg => ({
          ...msg,
          fadeAnim: new Animated.Value(1),
        }));
        console.log(`[${new Date().toLocaleString()}] Messages récupérés via fetchMessages : ${messagesToSet.length} messages`);
        await AsyncStorage.setItem("messages", JSON.stringify(messagesToSet));
      }

      setAllMessages(messagesToSet);
    } catch (error) {
      console.error(`[${new Date().toLocaleString()}] Erreur lors du chargement des messages : ${error.message}`);
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

    if (isSubscriptionExpired) {
      console.log(`[${new Date().toLocaleString()}] Message reçu mais ignoré (abonnement expiré) : ${newMessage.message}, type: ${newMessage.type}`);
      return;
    }

    const shouldNotify =
      (newMessage.type === "Debug" && notificationSettings.debug && canSeeDebug) ||
      (newMessage.type === "Info" && notificationSettings.info && canSeeInfo) ||
      (newMessage.type === "Prioritaire" && notificationSettings.prioritaire && canSeePrioritaire);

    console.log(`[${new Date().toLocaleString()}] Évaluation de shouldNotify pour ${newMessage.type} :`, {
      shouldNotify,
      notificationSettings,
      canSeeDebug,
      canSeeInfo,
      canSeePrioritaire,
    });

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

    if (isFocused.current && soundRef.current && shouldNotify) {
      try {
        await soundRef.current.replayAsync();
        console.log(`[${new Date().toLocaleString()}] Son de notification joué pour ${newMessage.type}`);
      } catch (error) {
        console.error(`[${new Date().toLocaleString()}] Erreur lors de la lecture du son : ${error.message}`);
      }
    } else {
      console.log(`[${new Date().toLocaleString()}] Pas de son joué pour ${newMessage.type} (shouldNotify: ${shouldNotify})`);
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

  const filteredMessages = allMessages.filter((msg) => {
    const matchesSearch = msg.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      (msg.type === "Debug" && messageFilters.debug && canSeeDebug) ||
      (msg.type === "Info" && messageFilters.info && canSeeInfo) ||
      (msg.type === "Prioritaire" && messageFilters.prioritaire && canSeePrioritaire);
    return matchesSearch && matchesType;
  });

  const getMessageBackgroundColor = (type) => {
    switch (type) {
      case "Debug": return "#9dffc7"; // Vert clair
      case "Info": return "#f0f0f0";  // Gris clair
      case "Prioritaire": return "#ff9d9d"; // Rouge clair
      default: return "#f0f0f0";     // Gris clair
    }
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case "Debug": return "bug-report";
      case "Info": return "info";
      case "Prioritaire": return "warning";
      default: return "info";
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
        body: JSON.stringify({ email, returnUrl: "ecascanphone://payment-success" }),
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

  const handleLogout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem("email");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Erreur", "Erreur lors de la déconnexion");
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("MessageDetail", { message: { message: item.message, timestamp: item.timestamp, type: item.type } })}>
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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>ECAScanPhone - Messages</Text>

      {isSubscriptionExpired ? (
        <View style={{ alignItems: "center" }}>
          <View style={styles.messageContainer}>
            <Text style={[styles.messageText, { textAlign: "center" }]}>
              Votre abonnement a expiré. Renouvelez-le pour continuer à recevoir les alertes en temps réel.
            </Text>
          </View>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Profile")}>
            <Icon name="person" size={20} color="#fff" style={styles.buttonIcon} />
            <Text
              style={styles.buttonText}
              allowFontScaling={false}
              numberOfLines={1}
              ellipsizeMode="none"
            >
              Profil
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={{ flexDirection: "row", marginVertical: 10, paddingHorizontal: 10 }}>
            {canSeeInfo && (
              <TouchableOpacity
                style={[styles.messageFilterButton, messageFilters.info ? styles.messageFilterButtonActive : {}]}
                onPress={() => toggleFilter("info")}
              >
                <Text style={[styles.messageFilterText, messageFilters.info ? styles.messageFilterTextActive : {}]}>
                  Info
                </Text>
              </TouchableOpacity>
            )}
            {canSeePrioritaire && (
              <TouchableOpacity
                style={[styles.messageFilterButton, messageFilters.prioritaire ? styles.messageFilterButtonActive : {}]}
                onPress={() => toggleFilter("prioritaire")}
              >
                <Text style={[styles.messageFilterText, messageFilters.prioritaire ? styles.messageFilterTextActive : {}]}>
                  Prioritaire
                </Text>
              </TouchableOpacity>
            )}
            {canSeeDebug && (
              <TouchableOpacity
                style={[styles.messageFilterButton, messageFilters.debug ? styles.messageFilterButtonActive : {}]}
                onPress={() => toggleFilter("debug")}
              >
                <Text style={[styles.messageFilterText, messageFilters.debug ? styles.messageFilterTextActive : {}]}>
                  Debug
                </Text>
              </TouchableOpacity>
            )}
          </View>

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
            onRefresh={loadMessagesFromStorage}
            contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
          />

          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Profile")}>
            <Icon name="person" size={20} color="#fff" style={styles.buttonIcon} />
            <Text
              style={styles.buttonText}
              allowFontScaling={false}
              numberOfLines={1}
              ellipsizeMode="none"
            >
              Profil
            </Text>
          </TouchableOpacity>
        </>
      )}

      {loading && !isSubscriptionExpired && (
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