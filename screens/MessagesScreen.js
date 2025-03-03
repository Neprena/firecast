import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, Text, View, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Animated, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import WebSocket from "react-native-websocket";
import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";

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
  const [wsConnected, setWsConnected] = useState(true);
  const [oldestDate, setOldestDate] = useState(new Date()); // Date la plus ancienne chargée
  const soundRef = useRef(null);
  const wsRef = useRef(null);
  const isFocused = useRef(true);
  const disconnectTimeoutRef = useRef(null);

  const isSubscriptionExpired = role !== "admin" && (!subscriptionEndDate || new Date(subscriptionEndDate) < new Date());
  const canSeeDebug = role && role.toLowerCase() === "admin";
  const canSeePrioritaire = role && (role.toLowerCase() === "vip" || role.toLowerCase() === "admin");
  const canSeeInfo = true;

  const loadNotificationSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem("notificationSettings");
      const parsedSettings = storedSettings ? JSON.parse(storedSettings) : {
        debug: canSeeDebug ? false : false,
        info: canSeeInfo ? true : false,
        prioritaire: canSeePrioritaire ? false : false,
      };
      setNotificationSettings(parsedSettings);
      console.log(`[${new Date().toLocaleString()}] Notification settings chargés :`, parsedSettings);
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
          debug: canSeeDebug ? false : false,
          info: canSeeInfo ? true : false,
          prioritaire: canSeePrioritaire ? false : false,
        };
        await AsyncStorage.setItem("messageFilters", JSON.stringify(defaultFilters));
        setMessageFilters(defaultFilters);
        console.log(`[${new Date().toLocaleString()}] Filtres de messages initialisés par défaut :`, defaultFilters);
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

  const loadMessagesFromStorage = async (append = false) => {
    setLoading(true);
    try {
      const storedMessages = await AsyncStorage.getItem("messages");
      let messagesToSet = append && allMessages.length ? [...allMessages] : [];
      if (!append && storedMessages) {
        messagesToSet = JSON.parse(storedMessages).map(msg => ({
          ...msg,
          fadeAnim: new Animated.Value(1),
        }));
        console.log(`[${new Date().toLocaleString()}] Messages chargés depuis AsyncStorage : ${messagesToSet.length} messages`);
      }

      const endDate = append ? oldestDate : new Date(); // Si append, on part de la date la plus ancienne, sinon maintenant
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24h avant
      const fetchedMessages = await fetchMessages(email, endDate.toISOString(), startDate.toISOString());
      if (fetchedMessages && Array.isArray(fetchedMessages)) {
        const newMessages = fetchedMessages.map(msg => ({
          ...msg,
          fadeAnim: new Animated.Value(1),
        }));
        messagesToSet = append ? [...messagesToSet, ...newMessages] : newMessages; // Append ou remplace
        const uniqueMessages = Array.from(new Map(messagesToSet.map(item => [item.id, item])).values());
        console.log(`[${new Date().toLocaleString()}] Messages récupérés via fetchMessages (${startDate.toISOString()} - ${endDate.toISOString()}) : ${newMessages.length} messages`);
        await AsyncStorage.setItem("messages", JSON.stringify(uniqueMessages));
        setOldestDate(startDate); // Met à jour la date la plus ancienne chargée
        setAllMessages(uniqueMessages);
      } else if (!append) {
        setAllMessages(messagesToSet); // Si pas de fetch initial, garde AsyncStorage
      }
    } catch (error) {
      console.error(`[${new Date().toLocaleString()}] Erreur lors du chargement des messages : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadMessagesFromStorage(true);
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

    const storedSettings = await AsyncStorage.getItem("notificationSettings");
    const currentSettings = storedSettings ? JSON.parse(storedSettings) : notificationSettings;

    const shouldNotify =
      (newMessage.type === "Debug" && currentSettings.debug && canSeeDebug) ||
      (newMessage.type === "Info" && currentSettings.info && canSeeInfo) ||
      (newMessage.type === "Prioritaire" && currentSettings.prioritaire && canSeePrioritaire);

    console.log(`[${new Date().toLocaleString()}] Évaluation de shouldNotify pour ${newMessage.type} :`, {
      shouldNotify,
      notificationSettings: currentSettings,
      canSeeDebug,
      canSeeInfo,
      canSeePrioritaire,
      isFocused: isFocused.current,
    });

    setAllMessages((prevMessages) => {
      const updatedMessages = [animatedMessage, ...prevMessages];
      const uniqueMessages = Array.from(new Map(updatedMessages.map(item => [item.id, item])).values());
      console.log(`[${new Date().toLocaleString()}] Nouveau message reçu via WebSocket : ${newMessage.message}, type: ${newMessage.type}`);
      AsyncStorage.setItem("messages", JSON.stringify(uniqueMessages)).then(() => {
        console.log(`[${new Date().toLocaleString()}] Messages mis à jour dans AsyncStorage : ${uniqueMessages.length} messages`);
      }).catch((error) => {
        console.error(`[${new Date().toLocaleString()}] Erreur lors de la mise à jour d'AsyncStorage : ${error.message}`);
      });
      return uniqueMessages;
    });

    if (shouldNotify) {
      if (isFocused.current && soundRef.current) {
        try {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded) {
            await soundRef.current.replayAsync();
            console.log(`[${new Date().toLocaleString()}] Son joué pour ${newMessage.type}`);
          } else {
            console.warn(`[${new Date().toLocaleString()}] Son non chargé pour ${newMessage.type}`);
          }
        } catch (error) {
          console.error(`[${new Date().toLocaleString()}] Erreur lors de la lecture du son : ${error.message}`);
        }
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Nouveau message (${newMessage.type})`,
          body: newMessage.message,
          sound: "default",
        },
        trigger: null,
      });
      console.log(`[${new Date().toLocaleString()}] Notification locale déclenchée pour ${newMessage.type}`);
    } else {
      console.log(`[${new Date().toLocaleString()}] Pas de notification pour ${newMessage.type} (shouldNotify: false)`);
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

  const handleWsDisconnect = (event) => {
    console.log(`[${new Date().toLocaleString()}] WebSocket déconnecté temporairement :`, event ? `${event.code} - ${event.reason}` : "Événement non défini");
    disconnectTimeoutRef.current = setTimeout(() => {
      setWsConnected(false);
      console.log(`[${new Date().toLocaleString()}] WebSocket considéré comme hors ligne après période de grâce`);
    }, 5000);
  };

  const handleWsConnect = () => {
    if (disconnectTimeoutRef.current) {
      clearTimeout(disconnectTimeoutRef.current);
      console.log(`[${new Date().toLocaleString()}] Reconexion avant fin de la période de grâce`);
    }
    setWsConnected(true);
    console.log(`[${new Date().toLocaleString()}] WebSocket connecté avec succès`);
  };

  const getMessageBackgroundColor = (type) => {
    switch (type) {
      case "Debug": return "#9dffc7";
      case "Info": return "#f0f0f0";
      case "Prioritaire": return "#ff9d9d";
      default: return "#f0f0f0";
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

  const filteredMessages = allMessages.filter((msg) => {
    const matchesSearch = msg.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      (msg.type === "Debug" && messageFilters.debug && canSeeDebug) ||
      (msg.type === "Info" && messageFilters.info && canSeeInfo) ||
      (msg.type === "Prioritaire" && messageFilters.prioritaire && canSeePrioritaire);
    return matchesSearch && matchesType;
  });

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

    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
        console.log(`[${new Date().toLocaleString()}] Session audio configurée`);
      } catch (error) {
        console.error(`[${new Date().toLocaleString()}] Erreur configuration audio : ${error.message}`);
      }
    };
    configureAudio();

    const unsubscribe = navigation.addListener("focus", () => {
      isFocused.current = true;
    });
    const unsubscribeBlur = navigation.addListener("blur", () => {
      isFocused.current = false;
    });

    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log(`[${new Date().toLocaleString()}] Statut permissions notifications : ${status}`);
      if (status !== "granted") {
        console.warn("Permissions de notification refusées");
      }
    };
    requestPermissions();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(error => {
          console.error(`[${new Date().toLocaleString()}] Erreur lors du démontage du son : ${error.message}`);
        });
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current);
      }
      unsubscribe();
      unsubscribeBlur();
    };
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Alarmes - Messages</Text>

      {isSubscriptionExpired ? (
        <View style={{ alignItems: "center" }}>
          <View style={styles.messageContainer}>
            <Text style={[styles.messageText, { textAlign: "center" }]}>
              Votre abonnement a expiré. Renouvelez-le pour continuer à recevoir les alertes en temps réel.
            </Text>
          </View>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Profile")}>
            <Icon name="person" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText} allowFontScaling={false} numberOfLines={1} ellipsizeMode="none">
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
                  Info {"\n"} (Canton VD)
                </Text>
              </TouchableOpacity>
            )}
            {canSeePrioritaire && (
              <TouchableOpacity
                style={[styles.messageFilterButton, messageFilters.prioritaire ? styles.messageFilterButtonActive : {}]}
                onPress={() => toggleFilter("prioritaire")}
              >
                <Text style={[styles.messageFilterText, messageFilters.prioritaire ? styles.messageFilterTextActive : {}]}>
                  Prioritaire {"\n"} (SDIS BV)
                </Text>
              </TouchableOpacity>
            )}
            {canSeeDebug && (
              <TouchableOpacity
                style={[styles.messageFilterButton, messageFilters.debug ? styles.messageFilterButtonActive : {}]}
                onPress={() => toggleFilter("debug")}
              >
                <Text style={[styles.messageFilterText, messageFilters.debug ? styles.messageFilterTextActive : {}]}>
                  Debug {"\n"} (Tests PP1)
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
            keyExtractor={(item) => item.id ? item.id.toString() : `${item.timestamp}-${Math.random().toString(36).substr(2, 9)}`}
            renderItem={renderMessage}
            ListEmptyComponent={<Text style={styles.info}>Aucun message</Text>}
            ListFooterComponent={
              <TouchableOpacity
                style={[styles.secondaryButton, { marginVertical: 10 }]}
                onPress={handleLoadMore}
                disabled={loading}
              >
                <Icon name="expand-more" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText} allowFontScaling={false} numberOfLines={1} ellipsizeMode="none">
                  Charger plus
                </Text>
              </TouchableOpacity>
            }
            refreshing={loading}
            onRefresh={() => loadMessagesFromStorage(false)}
            contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
          />

          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Profile")}>
            <Icon name="person" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText} allowFontScaling={false} numberOfLines={1} ellipsizeMode="none">
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
        ref={wsRef}
        url="ws://84.234.18.3:8080"
        onOpen={handleWsConnect}
        onMessage={handleWebSocketMessage}
        onError={(error) => console.error("Détails erreur WebSocket :", JSON.stringify(error))}
        onClose={handleWsDisconnect}
        reconnect
      />
    </SafeAreaView>
  );
};

export default MessagesScreen;