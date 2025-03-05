import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, Text, View, FlatList, TouchableOpacity, TextInput, Animated, Linking, useColorScheme, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import WebSocket from "react-native-websocket";
import { Audio } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import { messaging } from "../firebaseConfig";

const API_URL = "https://api.ecascan.npna.ch";
const API_KEY = "c80b17dd-5cdc-4b66-b5cf-1d4d62860fbc";

const MessagesScreen = ({ fetchMessages, styles, isConnected, subscriptionEndDate, role, email }) => {
  const navigation = useNavigation();
  const [explicitLoading, setExplicitLoading] = useState(false);
  const [silentLoading, setSilentLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({ debug: false, info: true, prioritaire: false });
  const [messageFilters, setMessageFilters] = useState({ debug: false, info: true, prioritaire: false });
  const [wsConnected, setWsConnected] = useState(true);
  const [oldestDate, setOldestDate] = useState(new Date());
  const soundRef = useRef(null);
  const wsRef = useRef(null);
  const isFocused = useRef(true);
  const disconnectTimeoutRef = useRef(null);
  const isDarkMode = useColorScheme() === "dark";

  const isSubscriptionExpired = role !== "admin" && (!subscriptionEndDate || new Date(subscriptionEndDate) < new Date());
  const canSeeDebug = role && role.toLowerCase() === "admin";
  const canSeePrioritaire = role && (role.toLowerCase() === "vip" || role.toLowerCase() === "admin");
  const canSeeInfo = true;

  const loadNotificationSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem("notificationSettings");
      const defaultSettings = { debug: canSeeDebug ? false : false, info: canSeeInfo ? true : false, prioritaire: canSeePrioritaire ? false : false };
      const parsedSettings = storedSettings ? JSON.parse(storedSettings) : defaultSettings;
      setNotificationSettings(parsedSettings);
      console.log(`[${new Date().toLocaleString()}] Notification settings chargés :`, parsedSettings);
      await syncNotificationSettings(parsedSettings);
    } catch (error) {
      console.warn(`[${new Date().toLocaleString()}] Erreur lors du chargement des paramètres de notifications : ${error.message}`);
    }
  };

  const syncNotificationSettings = async (settings) => {
    try {
      const token = await messaging().getToken();
      const response = await fetch(`${API_URL}/register-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify({ email, token, notificationSettings: settings }),
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

  const loadMessageFilters = async () => {
    try {
      const storedFilters = await AsyncStorage.getItem("messageFilters");
      if (storedFilters) {
        const parsedFilters = JSON.parse(storedFilters);
        setMessageFilters({
          debug: canSeeDebug ? parsedFilters.debug || false : false,
          info: canSeeInfo ? (parsedFilters.info !== undefined ? parsedFilters.info : true) : false,
          prioritaire: canSeePrioritaire ? parsedFilters.prioritaire || false : false,
        });
        console.log(`[${new Date().toLocaleString()}] Filtres de messages chargés :`, parsedFilters);
      } else {
        const defaultFilters = { debug: canSeeDebug ? false : false, info: canSeeInfo ? true : false, prioritaire: canSeePrioritaire ? false : false };
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

  const loadMessagesFromStorage = async (append = false, isSilent = false) => {
    const setLoading = isSilent ? setSilentLoading : setExplicitLoading;
    setLoading(true);
    try {
      const storedMessages = await AsyncStorage.getItem("messages");
      let messagesToSet = append && allMessages.length ? [...allMessages] : [];
      if (!append && storedMessages) {
        messagesToSet = JSON.parse(storedMessages).map((msg) => ({
          ...msg,
          fadeAnim: new Animated.Value(1),
        }));
        console.log(`[${new Date().toLocaleString()}] Messages chargés depuis AsyncStorage : ${messagesToSet.length} messages`);
      }

      const endDate = append ? oldestDate : new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
      const fetchedMessages = await fetchMessages(email, endDate.toISOString(), startDate.toISOString());
      if (fetchedMessages && Array.isArray(fetchedMessages)) {
        const newMessages = fetchedMessages.map((msg) => ({
          ...msg,
          fadeAnim: new Animated.Value(1),
        }));
        messagesToSet = append ? [...messagesToSet, ...newMessages] : newMessages;
        const uniqueMessages = Array.from(new Map(messagesToSet.map((item) => [item.id, item])).values());
        console.log(
          `[${new Date().toLocaleString()}] Messages récupérés via fetchMessages (${startDate.toLocaleString()} - ${endDate.toLocaleString()}) : ${newMessages.length} messages`
        );
        await AsyncStorage.setItem("messages", JSON.stringify(uniqueMessages));
        setOldestDate(startDate);
        setAllMessages((prev) => {
          const prevIds = new Set(prev.map((m) => m.id));
          const updated = uniqueMessages.filter((m) => !prevIds.has(m.id)).concat(prev);
          return updated.slice(0, prev.length + newMessages.length);
        });
      } else if (!append) {
        setAllMessages(messagesToSet);
      }
    } catch (error) {
      console.error(`[${new Date().toLocaleString()}] Erreur lors du chargement des messages : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadMessagesFromStorage(true, false);
  };

  const handleWebSocketMessage = async (event) => {
    const newMessage = JSON.parse(event.data);
    const animatedMessage = { ...newMessage, fadeAnim: new Animated.Value(0), isNew: true };

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
      const uniqueMessages = Array.from(new Map(updatedMessages.map((item) => [item.id, item])).values());
      console.log(`[${new Date().toLocaleString()}] Nouveau message reçu via WebSocket : ${newMessage.message}, type: ${newMessage.type}`);
      AsyncStorage.setItem("messages", JSON.stringify(uniqueMessages)).catch((error) =>
        console.error(`[${new Date().toLocaleString()}] Erreur lors de la mise à jour d'AsyncStorage : ${error.message}`)
      );
      return uniqueMessages;
    });

    if (shouldNotify && isFocused.current && soundRef.current) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          await soundRef.current.replayAsync();
          console.log(`[${new Date().toLocaleString()}] Son joué pour ${newMessage.type}`);
        }
      } catch (error) {
        console.error(`[${new Date().toLocaleString()}] Erreur lors de la lecture du son : ${error.message}`);
      }
    }

    Animated.timing(animatedMessage.fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    loadMessagesFromStorage(false, false); // Rafraîchit complètement après réception WebSocket
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleSubscribe = async () => {
    setExplicitLoading(true);
    try {
      const response = await fetch("https://api.ecascan.npna.ch/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": "c80b17dd-5cdc-4b66-b5cf-1d4d62860fbc" },
        body: JSON.stringify({ email, returnUrl: "ecascanphone://payment-success" }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Erreur lors de la création de la session de paiement");
      Linking.openURL(json.checkoutUrl);
    } catch (error) {
      Alert.alert("Erreur", error.message);
    } finally {
      setExplicitLoading(false);
    }
  };

  const handleLogout = async () => {
    setExplicitLoading(true);
    try {
      await AsyncStorage.removeItem("email");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Erreur", "Erreur lors de la déconnexion");
    } finally {
      setExplicitLoading(false);
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
      case "Debug":
        return isDarkMode ? styles.messageDebugBackground.backgroundColor : styles.messageDebugBackground.backgroundColor;
      case "Info":
        return isDarkMode ? styles.messageInfoBackground.backgroundColor : styles.messageInfoBackground.backgroundColor;
      case "Prioritaire":
        return isDarkMode ? styles.messagePrioritaireBackground.backgroundColor : styles.messagePrioritaireBackground.backgroundColor;
      default:
        return isDarkMode ? styles.messageInfoBackground.backgroundColor : styles.messageInfoBackground.backgroundColor;
    }
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case "Debug":
        return "bug-report";
      case "Info":
        return "info";
      case "Prioritaire":
        return "warning";
      default:
        return "info";
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
          <Icon name={getMessageIcon(item.type)} size={16} color={styles.messageIcon?.color || "#666"} style={styles.messageIcon} />
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
    //console.log(`[${new Date().toLocaleString()}] Filtrage message ID ${msg.id}: matchesSearch=${matchesSearch}, matchesType=${matchesType}, type=${msg.type}, filters=${JSON.stringify(messageFilters)}`);
    return matchesSearch && matchesType;
  });

  useEffect(() => {
    loadMessagesFromStorage(false, true);
    loadNotificationSettings();
    loadMessageFilters();

    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(require("../assets/notification.mp3"), { shouldPlay: false });
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

    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      console.log("Notification FCM reçue en avant-plan :", JSON.stringify(remoteMessage, null, 2));
      const data = remoteMessage.data || {};
      if (data.type === "new_message" && !isSubscriptionExpired) {
        const storedSettings = await AsyncStorage.getItem("notificationSettings");
        const currentSettings = storedSettings ? JSON.parse(storedSettings) : notificationSettings;
        const messageType = remoteMessage.notification?.title?.includes("Prioritaire")
          ? "Prioritaire"
          : remoteMessage.notification?.title?.includes("Info")
          ? "Info"
          : "Debug";
        const shouldNotify =
          (messageType === "Debug" && currentSettings.debug && canSeeDebug) ||
          (messageType === "Info" && currentSettings.info && canSeeInfo) ||
          (messageType === "Prioritaire" && currentSettings.prioritaire && canSeePrioritaire);

        if (shouldNotify) {
          if (isFocused.current && soundRef.current) {
            try {
              const status = await soundRef.current.getStatusAsync();
              if (status.isLoaded) {
                await soundRef.current.replayAsync();
                console.log(`[${new Date().toLocaleString()}] Son joué pour FCM ${messageType}`);
              }
            } catch (error) {
              console.error(`[${new Date().toLocaleString()}] Erreur lors de la lecture du son FCM : ${error.message}`);
            }
          }
          loadMessagesFromStorage(false, false); // Rafraîchit complètement après réception FCM
        }
      }
    });

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Notification FCM en arrière-plan reçue :", JSON.stringify(remoteMessage, null, 2));
      const data = remoteMessage.data || {};
      if (data.type === "new_message" && !isSubscriptionExpired) {
        const storedSettings = await AsyncStorage.getItem("notificationSettings");
        const currentSettings = storedSettings ? JSON.parse(storedSettings) : notificationSettings;
        const messageType = remoteMessage.notification?.title?.includes("Prioritaire")
          ? "Prioritaire"
          : remoteMessage.notification?.title?.includes("Info")
          ? "Info"
          : "Debug";
        const shouldNotify =
          (messageType === "Debug" && currentSettings.debug && canSeeDebug) ||
          (messageType === "Info" && currentSettings.info && canSeeInfo) ||
          (messageType === "Prioritaire" && currentSettings.prioritaire && canSeePrioritaire);

        if (shouldNotify) {
          loadMessagesFromStorage(false, true);
        }
      }
    });

    const unsubscribeFocus = navigation.addListener("focus", () => {
      isFocused.current = true;
      console.log(`[${new Date().toLocaleString()}] MessagesScreen en focus, rechargement des messages`);
      loadMessagesFromStorage(false, true);
    });

    const unsubscribeBlur = navigation.addListener("blur", () => {
      isFocused.current = false;
      console.log(`[${new Date().toLocaleString()}] MessagesScreen hors focus`);
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch((error) => {
          console.error(`[${new Date().toLocaleString()}] Erreur lors du démontage du son : ${error.message}`);
        });
      }
      if (wsRef.current) {
        console.log(`[${new Date().toLocaleString()}] Fermeture du WebSocket`);
        wsRef.current.close();
      }
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current);
      }
      unsubscribeForeground();
      unsubscribeFocus();
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
            <Icon name="search" size={20} color={styles.inputIcon?.color || "#666"} style={styles.inputIcon} />
            <TextInput
              style={{ flex: 1, color: styles.messageText?.color || "#333" }}
              placeholder="Rechercher dans les messages"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>

          <FlatList
            data={filteredMessages}
            keyExtractor={(item) => (item.id ? item.id.toString() : `${item.timestamp}-${Math.random().toString(36).substr(2, 9)}`)}
            renderItem={renderMessage}
            ListEmptyComponent={<Text style={styles.info}>Aucun message</Text>}
            ListFooterComponent={
              <TouchableOpacity style={[styles.secondaryButton, { marginVertical: 10 }]} onPress={handleLoadMore} disabled={explicitLoading}>
                <Icon name="expand-more" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText} allowFontScaling={false} numberOfLines={1} ellipsizeMode="none">
                  Charger plus
                </Text>
              </TouchableOpacity>
            }
            refreshing={explicitLoading}
            onRefresh={() => loadMessagesFromStorage(false, false)}
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

      {explicitLoading && !isSubscriptionExpired && (
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