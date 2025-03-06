import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, TouchableOpacity, View, ActivityIndicator, Platform } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import RNIap from "react-native-iap";

const itemSkus = Platform.select({
  ios: ["abo-firecast-annuel","abo-firecast-mensuel"],       // Remplace par ton identifiant produit iOS
  android: ["com.ecascan.subscription1"],    // Remplace par ton identifiant produit Android
});

const SubscriptionScreen = ({ navigation, styles, email }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);

    useEffect(() => {
    async function initIAP() {
        setLoading(true);
        try {
        await RNIap.initConnection();
        const products = await RNIap.getSubscriptions(itemSkus);
        setSubscriptions(products);
        } catch (error) {
        console.error("Erreur IAP :", error);
        } finally {
        setLoading(false);
        }
    }
    initIAP();

    return () => {
        if (RNIap && typeof RNIap.endConnection === "function") {
        RNIap.endConnection();
        }
    };
    }, []);

  const requestSubscription = async (sku) => {
    try {
      await RNIap.requestSubscription(sku);
    } catch (error) {
      console.error("Erreur lors de la demande d’abonnement :", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Abonnement</Text>

      {loading && (
        <ActivityIndicator size="large" color={styles.button?.backgroundColor || "#007AFF"} />
      )}

      {!loading && subscriptions.length > 0 && (
        <View style={{ marginVertical: 20 }}>
          {subscriptions.map((sub) => (
            <View
              key={sub.productId}
              style={{
                marginBottom: 20,
                padding: 15,
                backgroundColor: "#f1f1f1",
                borderRadius: 8,
              }}
            >
              <Text style={[styles.subtitle, { marginBottom: 5 }]}>{sub.title}</Text>
              <Text style={styles.info}>{sub.description}</Text>
              <Text style={[styles.info, { marginTop: 5 }]}>{sub.localizedPrice}</Text>
              <TouchableOpacity
                style={[styles.button, { marginTop: 10 }]}
                onPress={() => requestSubscription(sub.productId)}
              >
                <Icon name="payment" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Souscrire</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {!loading && subscriptions.length === 0 && (
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