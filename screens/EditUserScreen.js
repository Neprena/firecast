import React, { useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View, TextInput, Alert, Switch, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const API_URL = "https://api.ecascan.npna.ch";
const API_KEY = "c80b17dd-5cdc-4b66-b5cf-1d4d62860fbc";

const EditUserScreen = ({ route, navigation, styles }) => {
  const { user, adminEmail, onRefresh } = route.params;
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const [loading, setLoading] = useState(false);

  const handleUpdateUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/update-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          adminEmail,
          targetEmail: user.email,
          newEmail: email,
          password: password || undefined,
          role,
          isActive,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Erreur lors de la mise à jour");
      Alert.alert("Succès", "Utilisateur mis à jour avec succès");
      onRefresh();
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>ECAScanPhone - Édition Utilisateur</Text>

      <View style={styles.input}>
        <Icon name="email" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={{ flex: 1 }}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>
      <View style={styles.input}>
        <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={{ flex: 1 }}
          placeholder="Nouveau mot de passe (optionnel)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <Text style={styles.subtitle}>Rôle :</Text>
      <View style={styles.roleSelector}>
        <TouchableOpacity
          style={[styles.roleButton, role === "normal" && styles.roleButtonSelected]}
          onPress={() => setRole("normal")}
        >
          <Text style={styles.buttonText}>Normal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, role === "VIP" && styles.roleButtonSelected]}
          onPress={() => setRole("VIP")}
        >
          <Text style={styles.buttonText}>VIP</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, role === "admin" && styles.roleButtonSelected]}
          onPress={() => setRole("admin")}
        >
          <Text style={styles.buttonText}>Admin</Text>
        </TouchableOpacity>
      </View>

      {/* Toggle "Actif :" adapté comme dans ProfileScreen */}
      <View style={styles.toggleContainer}>
        <View style={styles.toggleRow}>
          <Icon name="toggle-on" size={20} color={styles.subtitle.color} style={styles.toggleIcon} />
          <Text style={styles.toggleLabel}>Actif :</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isActive ? "#007BFF" : "#f4f3f4"}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdateUser}>
        <Icon name="save" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Mettre à jour</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Retour</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={styles.button.backgroundColor} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default EditUserScreen;