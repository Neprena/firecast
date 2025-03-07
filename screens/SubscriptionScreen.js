import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, TouchableOpacity, View, ActivityIndicator, Platform } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

const SubscriptionScreen = ({ navigation, styles, email }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function initPurchases() {
      setLoading(true);
      try {
        Purchases.setDebugLogsEnabled(true);
        console.log("Email utilisé pour l'achat intégré:", email);
        // Configuration RevenueCat selon la plateforme
        if (Platform.OS === "ios") {
          console.log("Configuration RevenueCat pour iOS avec clé:", "appl_nWuCAHQSNnWCIEGaVQgqklRFEtM");
          await Purchases.configure({ 
            apiKey: "appl_nWuCAHQSNnWCIEGaVQgqklRFEtM", // Vérifiez cette clé
            appUserID: email 
          });
        } else if (Platform.OS === "android") {
          console.log("Configuration RevenueCat pour Android avec clé:", "goog_anCYAlYeFSEKQbxqplxKKAhsiUJ");
          await Purchases.configure({ 
            apiKey: "goog_anCYAlYeFSEKQbxqplxKKAhsiUJ", // Vérifiez cette clé
            appUserID: email 
          });
        }
        console.log("Configuration RevenueCat réussie dans SubscriptionScreen");
        // Récupération des offres disponibles
        const offerings = await Purchases.getOfferings();
        console.log("Offerings récupérés:", offerings);
        if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
          setPackages(offerings.current.availablePackages);
        } else {
          console.log("Aucun package disponible dans l'offre courante.");
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation des achats intégrés:", error);
      } finally {
        setLoading(false);
      }
    }
    initPurchases();
  }, [email]);

  const purchasePackage = async (pkg) => {
    try {
      console.log("Demande d'achat pour le package:", pkg.identifier);
      const { purchaserInfo, productIdentifier } = await Purchases.purchasePackage(pkg);
      console.log("Info d'achat reçue:", purchaserInfo);
      // Vous pouvez notifier votre backend ici pour mettre à jour l'abonnement
    } catch (error) {
      if (!error.userCancelled) {
        console.error("Erreur lors de la demande d'achat:", error);
      } else {
        console.log("Achat annulé par l'utilisateur.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Abonnement</Text>

      {loading && (
        <ActivityIndicator size="large" color={styles.button?.backgroundColor || "#007AFF"} />
      )}

      {!loading && packages.length > 0 && (
        <View style={{ marginVertical: 20 }}>
          {packages.map((pkg) => (
            <View
              key={pkg.identifier}
              style={{
                marginBottom: 20,
                padding: 15,
                backgroundColor: "#f1f1f1",
                borderRadius: 8,
              }}
            >
              <Text style={[styles.subtitle, { marginBottom: 5 }]}>{pkg.product.title}</Text>
              <Text style={styles.info}>{pkg.product.description}</Text>
              <Text style={[styles.info, { marginTop: 5 }]}>{pkg.product.priceString}</Text>
              <TouchableOpacity
                style={[styles.button, { marginTop: 10 }]}
                onPress={() => purchasePackage(pkg)}
              >
                <Icon name="payment" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Souscrire</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {!loading && packages.length === 0 && (
        <Text style={styles.info}>Aucun abonnement disponible pour le moment.</Text>
      )}

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Profile")}>
        <Icon name="arrow-back" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Retour</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SubscriptionScreen;