import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialIcons";

const MessageDetail = ({ navigation, route, styles }) => {
  const { message } = route.params; // Objet sérialisé { message, timestamp, type }
  const [coordinates, setCoordinates] = useState(null); // { latitude, longitude }
  const [loading, setLoading] = useState(true);

  // Ta clé API Google
  const GOOGLE_API_KEY = "AIzaSyAM54lhiYraHQ9WG-Nm49ZyNZc9pbIu0Lk";

  useEffect(() => {
    geocodeMessage(message.message);
  }, [message]);

  const geocodeMessage = async (text) => {
    setLoading(true);
    console.log(`[${new Date().toLocaleString()}] Début géocodage pour le message :`, text);
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(text)}&key=${GOOGLE_API_KEY}`;
      console.log(`[${new Date().toLocaleString()}] URL de la requête :`, url);

      const response = await fetch(url);
      console.log(`[${new Date().toLocaleString()}] Statut de la réponse HTTP :`, response.status);

      const data = await response.json();
      console.log(`[${new Date().toLocaleString()}] Réponse de Google Geocoding :`, data);

      if (data.status === "OK" && data.results.length > 0) {
        const coords = {
          latitude: data.results[0].geometry.location.lat,
          longitude: data.results[0].geometry.location.lng,
        };
        console.log(`[${new Date().toLocaleString()}] Coordonnées trouvées :`, coords);
        setCoordinates(coords);
      } else {
        console.log(`[${new Date().toLocaleString()}] Aucune coordonnée trouvée dans la réponse, statut :`, data.status);
        throw new Error("Adresse non trouvée");
      }
    } catch (error) {
      console.warn(`[${new Date().toLocaleString()}] Erreur de géocodage :`, error.message);
      Alert.alert("Erreur", "Adresse non trouvée sur la carte", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
      setCoordinates(null);
    } finally {
      setLoading(false);
      console.log(`[${new Date().toLocaleString()}] Fin du géocodage, loading :`, false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Détails</Text>
      
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{message.message}</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={styles.button.backgroundColor} />
        </View>
      ) : coordinates ? (
        <MapView
          style={{ flex: 1, width: "95%", alignSelf: "center" }}
          initialRegion={{
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={coordinates} />
        </MapView>
      ) : (
        <Text style={[styles.info, { flex: 1 }]}>Adresse non trouvée sur la carte</Text>
      )}

      <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
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
    </SafeAreaView>
  );
};

export default MessageDetail;