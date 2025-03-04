import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, useColorScheme, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialIcons";

// Style personnalisé pour le mode sombre (spécifique à MapView)
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
];

const GOOGLE_MAPS_API_KEY = "AIzaSyAM54lhiYraHQ9WG-Nm49ZyNZc9pbIu0Lk";

const MessageDetail = ({ route, navigation, styles }) => {
  const { message } = route.params;
  const isDarkMode = useColorScheme() === "dark";
  const [mapType, setMapType] = useState("standard");
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  // Géocodage de l'adresse
  useEffect(() => {
    const geocodeAddress = async () => {
      try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(message.message)}&key=${GOOGLE_MAPS_API_KEY}`);
        const data = await response.json();
        if (data.status === "OK" && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          setRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          setLoading(false);
        } else {
          throw new Error(`Géocodage échoué : ${data.status}`);
        }
      } catch (error) {
        console.error(`[${new Date().toLocaleString()}] Erreur géocodage : ${error.message}`);
        Alert.alert("Erreur", "Impossible de localiser l'adresse. Retour à la liste des messages.", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    };

    geocodeAddress();
  }, [message.message, navigation]);

  const toggleMapType = () => {
    setMapType((prevType) => (prevType === "standard" ? "satellite" : "standard"));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.info}>Chargement de la carte...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Détails du message</Text>
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{message.message}</Text>
        <Text style={styles.timestamp}>
          {new Date(message.timestamp).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </Text>
      </View>

      {/* Carte */}
      <MapView style={styles.map} region={region} mapType={mapType} customMapStyle={isDarkMode && mapType === "standard" ? darkMapStyle : undefined}>
        {region && <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />}
      </MapView>

      {/* Bouton pour changer le style de carte */}
      <TouchableOpacity style={styles.secondaryButton} onPress={toggleMapType}>
        <Icon name={mapType === "standard" ? "satellite" : "map"} size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>{mapType === "standard" ? "Vue Satellite" : "Vue Plan"}</Text>
      </TouchableOpacity>

      {/* Bouton retour */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Retour</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MessageDetail;
