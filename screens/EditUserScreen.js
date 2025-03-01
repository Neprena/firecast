import React, { useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View, TextInput, Alert, Switch } from "react-native";

const API_URL = "http://84.234.18.3:3001";
const API_KEY = "c80b17dd-5cdc-4b66-b5cf-1d4d62860fbc";

const EditUserScreen = ({ navigation, route, styles }) => {
  const { user, adminEmail, onRefresh } = route.params;
  const [newEmail, setNewEmail] = useState(user.email);
  const [newPassword, setNewPassword] = useState("");
  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(Boolean(user.isActive));

  const handleUpdateUser = async () => {
    if (!newEmail) {
      Alert.alert("Erreur", "L’email est requis");
      return;
    }
    try {
      const body = {
        adminEmail,
        targetEmail: user.email,
        newEmail: newEmail || undefined,
        role: role || undefined,
        isActive,
      };
      if (newPassword) {
        body.password = newPassword;
      }
      const response = await fetch(`${API_URL}/admin/update-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify(body),
      });
      const text = await response.text();
      console.log("Réponse brute :", text);
      const json = JSON.parse(text);
      if (!response.ok) throw new Error(json.error || "Erreur lors de la mise à jour");
      Alert.alert("Succès", "Utilisateur mis à jour avec succès");
      onRefresh();
      navigation.goBack();
    } catch (error) {
      console.error("Erreur dans handleUpdateUser :", error.message);
      Alert.alert("Erreur", error.message);
    }
  };

  const handleDeleteUser = async () => {
    Alert.alert(
      "Confirmer la suppression",
      `Voulez-vous vraiment supprimer ${user.email} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/admin/delete-user`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": API_KEY,
                },
                body: JSON.stringify({ adminEmail, targetEmail: user.email }),
              });
              const text = await response.text();
              console.log("Réponse brute :", text);
              const json = JSON.parse(text);
              if (!response.ok) throw new Error(json.error || "Erreur lors de la suppression");
              Alert.alert("Succès", "Utilisateur supprimé avec succès");
              onRefresh();
              navigation.goBack();
            } catch (error) {
              console.error("Erreur dans handleDeleteUser :", error.message);
              Alert.alert("Erreur", error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>ECAScanPhone - Édition</Text>
      <Text style={styles.subtitle}>Modifier {user.email}</Text>

      <TextInput
        style={styles.input}
        placeholder="Nouvel email"
        value={newEmail}
        onChangeText={setNewEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Nouveau mot de passe (optionnel)"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <Text style={styles.info}>Rôle :</Text>
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
      <View style={styles.toggleContainer}>
        <Text style={styles.info}>Actif :</Text>
        <Switch
          value={isActive}
          onValueChange={setIsActive}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isActive ? "#007BFF" : "#f4f3f4"}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleUpdateUser}>
        <Text style={styles.buttonText}>Valider</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteUser}>
        <Text style={styles.buttonText}>Supprimer</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Retour</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default EditUserScreen;