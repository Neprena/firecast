import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, TouchableOpacity, View, FlatList, TextInput, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://84.234.18.3:3001";
const API_KEY = "c80b17dd-5cdc-4b66-b5cf-1d4d62860fbc";

const AdminScreen = ({ navigation, styles, email }) => {
  const [users, setUsers] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("normal");
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, activeFilter]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          adminEmail: email,
          search,
          roleFilter: roleFilter || undefined,
          activeFilter: activeFilter !== null ? activeFilter : undefined,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Erreur lors de la récupération des utilisateurs");
      setUsers(json);
    } catch (error) {
      Alert.alert("Erreur", error.message);
    }
  };

  const refreshUsers = () => {
    fetchUsers();
  };

  const handleAddUser = async () => {
    if (!newEmail || !newPassword) {
      Alert.alert("Erreur", "Email et mot de passe requis");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/admin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ adminEmail: email, newEmail, password: newPassword, role: newRole }),
      });
      const text = await response.text();
      console.log("Réponse brute :", text);
      const json = JSON.parse(text);
      if (!response.ok) throw new Error(json.error || "Erreur lors de la création de l’utilisateur");
      Alert.alert("Succès", "Utilisateur créé avec succès");
      setNewEmail("");
      setNewPassword("");
      setNewRole("normal");
      setIsAdding(false);
      fetchUsers();
    } catch (error) {
      console.error("Erreur dans handleAddUser :", error.message);
      Alert.alert("Erreur", error.message);
    }
  };

  const toggleUserActive = async (targetEmail, currentActive) => {
    console.log(`Toggle isActive pour ${targetEmail} - État actuel : ${currentActive}, Nouvel état : ${!currentActive}`);
    try {
      const response = await fetch(`${API_URL}/admin/update-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          adminEmail: email,
          targetEmail,
          isActive: !currentActive,
        }),
      });
      const text = await response.text();
      console.log(`Réponse brute pour ${targetEmail} : ${text}`);
      const json = JSON.parse(text);
      if (!response.ok) throw new Error(json.error || "Erreur lors de la mise à jour");
      Alert.alert("Succès", `Utilisateur ${currentActive ? "désactivé" : "activé"} avec succès`);
      fetchUsers();
    } catch (error) {
      console.error("Erreur dans toggleUserActive :", error.message);
      Alert.alert("Erreur", error.message);
    }
  };

  const renderUser = ({ item }) => (
    <View style={styles.userItem}>
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => navigation.navigate("EditUser", { user: item, adminEmail: email, onRefresh: refreshUsers })}
      >
        <Text style={styles.info}>{`${item.email} - ${item.isActive ? "Actif" : "Inactif"}`}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.toggleButton, { backgroundColor: item.isActive ? "#ff4444" : "#81b0ff" }]}
        onPress={() => toggleUserActive(item.email, item.isActive)}
      >
        <Text style={styles.buttonText}>{item.isActive ? "Désactiver" : "Activer"}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>ECAScanPhone - Administration</Text>

      <TextInput
        style={styles.input}
        placeholder="Rechercher par email"
        value={search}
        onChangeText={setSearch}
      />
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, roleFilter === "" && { backgroundColor: "#007BFF" }]}
          onPress={() => setRoleFilter("")}
        >
          <Text style={styles.buttonText}>Tous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, roleFilter === "normal" && { backgroundColor: "#007BFF" }]}
          onPress={() => setRoleFilter("normal")}
        >
          <Text style={styles.buttonText}>Normal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, roleFilter === "VIP" && { backgroundColor: "#007BFF" }]}
          onPress={() => setRoleFilter("VIP")}
        >
          <Text style={styles.buttonText}>VIP</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, roleFilter === "admin" && { backgroundColor: "#007BFF" }]}
          onPress={() => setRoleFilter("admin")}
        >
          <Text style={styles.buttonText}>Admin</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === null && { backgroundColor: "#007BFF" }]}
          onPress={() => setActiveFilter(null)}
        >
          <Text style={styles.buttonText}>Tous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === true && { backgroundColor: "#007BFF" }]}
          onPress={() => setActiveFilter(true)}
        >
          <Text style={styles.buttonText}>Actif</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === false && { backgroundColor: "#007BFF" }]}
          onPress={() => setActiveFilter(false)}
        >
          <Text style={styles.buttonText}>Inactif</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => setIsAdding(!isAdding)}>
        <Text style={styles.buttonText}>{isAdding ? "Masquer" : "Ajouter un utilisateur"}</Text>
      </TouchableOpacity>

      {isAdding && (
        <View style={styles.addContainer}>
          <Text style={styles.subtitle}>Nouvel utilisateur</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <Text style={styles.info}>Rôle :</Text>
          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[styles.roleButton, newRole === "normal" && styles.roleButtonSelected]}
              onPress={() => setNewRole("normal")}
            >
              <Text style={styles.buttonText}>Normal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, newRole === "VIP" && styles.roleButtonSelected]}
              onPress={() => setNewRole("VIP")}
            >
              <Text style={styles.buttonText}>VIP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, newRole === "admin" && styles.roleButtonSelected]}
              onPress={() => setNewRole("admin")}
            >
              <Text style={styles.buttonText}>Admin</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleAddUser}>
            <Text style={styles.buttonText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={users}
        keyExtractor={(item) => item.email}
        renderItem={renderUser}
        style={styles.userList}
        ListHeaderComponent={<Text style={styles.subtitle}>Liste des utilisateurs</Text>}
      />

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Profile")}>
        <Text style={styles.buttonText}>Retour</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AdminScreen;