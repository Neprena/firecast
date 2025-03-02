// styles.js

import { StyleSheet } from "react-native";

// Styles pour le thème clair
export const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
    marginTop: 20,
    marginBottom:10,
    marginHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "#fff",
    minHeight: 50,
    width: "95%",
  },
  inputIcon: {
    marginRight: 5,
  },
  message: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  messageContainer: {
  marginHorizontal: 10,
  marginVertical: 10,
  padding: 15,
  backgroundColor: "#f8f9fa",
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#ddd",
},
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  messageIcon: {
    marginTop: 5,
  },
  info: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 10,
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: "#6c757d",
    padding: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 10,
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 10,
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  toggleButton: {
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    minWidth: 100,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    flexShrink: 1,
    minWidth: 0,
    flex: 1,
    textAlign: "center",
  },
  buttonIcon: {
    marginRight: 5,
  },
  toggleContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleIcon: {
    marginRight: 10,
  },
  toggleLabel: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  passwordChangeContainer: {
    marginHorizontal: 10,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  userRow: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "95%",
    marginBottom: 10,
    marginHorizontal: 10,
  },
  filterButton: {
    flex: 1,
    backgroundColor: "#ccc",
    paddingVertical: 12, // Augmenté de 8 à 12 pour plus de hauteur
    paddingHorizontal: 15, // Légèrement augmenté pour cohérence
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 2,
    minHeight: 40, // Ajouté pour garantir une hauteur minimale
  },
  addContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  roleSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  roleButton: {
    backgroundColor: "#e9ecef",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  roleButtonSelected: {
    backgroundColor: "#007AFF",
  },
  userList: {
    flex: 1,
    width: "100%",
  },
});

// Styles pour le thème sombre
export const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "left",
    marginVertical: 10,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "#1e1e1e",
    color: "#fff",
    minHeight: 50,
    width: "100%",
  },
  inputIcon: {
    marginRight: 5,
  },
  message: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: "#1e1e1e",
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },
  messageContainer: {
  marginHorizontal: 10,
  marginVertical: 10,
  padding: 15,
  backgroundColor: "#2c2c2c",
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#444",
},
  timestamp: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 5,
  },
  messageIcon: {
    marginTop: 5,
  },
  info: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#1e90ff",
    padding: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 10,
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: "#6c757d",
    padding: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 10,
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 10,
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  toggleButton: {
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    minWidth: 100,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    flexShrink: 1,
    minWidth: 0,
    flex: 1,
    textAlign: "center",
  },
  buttonIcon: {
    marginRight: 5,
  },
  toggleContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#2c2c2c",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleIcon: {
    marginRight: 10,
  },
  toggleLabel: {
    fontSize: 16,
    color: "#fff",
    flex: 1,
  },
  passwordChangeContainer: {
    marginHorizontal: 10,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  userRow: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  filterButton: {
    backgroundColor: "#343a40",
    paddingVertical: 12, // Augmenté de 8 à 12 pour plus de hauteur
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: "center",
    minHeight: 40, // Ajouté pour garantir une hauteur minimale
    flex: 1, // Conservé pour l’étirement horizontal
    marginHorizontal: 2, // Ajouté pour un léger espacement
  },
  addContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#2c2c2c",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  roleSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  roleButton: {
    backgroundColor: "#343a40",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  roleButtonSelected: {
    backgroundColor: "#1e90ff",
  },
  userList: {
    flex: 1,
  },
});