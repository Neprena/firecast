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
    marginBottom: 10,
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
  inputText: {
    flex: 1,
    color: "#333",
    placeholderTextColor: "#666",
  },
  inputIcon: {
    marginRight: 5,
  },
  message: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
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
    paddingHorizontal: 30, // Augmenté pour plus d’espace
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
    paddingHorizontal: 30, // Augmenté pour plus d’espace
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
    paddingHorizontal: 30, // Augmenté pour plus d’espace
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
    textAlign: "center",
    flex: 1,            // Prend tout l’espace disponible après l’icône
    flexShrink: 1,      // Rétrécit si nécessaire
    flexWrap: "wrap",   // Autorise le wrapping
    minWidth: 0,        // Évite les débordements
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
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 2,
    minHeight: 40,
  },
  messageFilterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
  },
  messageFilterButtonActive: {
    backgroundColor: "#007BFF",
  },
  messageFilterText: {
    fontSize: 14,
    textAlign: "center",
    color: "#000",
  },
  messageFilterTextActive: {
    color: "#fff",
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
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
  },
  roleButtonSelected: {
    backgroundColor: "#007AFF",
  },
  userList: {
    flex: 1,
    width: "100%",
  },
  messageDebugBackground: {
    backgroundColor: "#9dffc7",
  },
  messageInfoBackground: {
    backgroundColor: "#f0f0f0",
  },
  messagePrioritaireBackground: {
    backgroundColor: "#ff9d9d",
  },
  map: {
    flex: 1,
    marginVertical: 10,
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
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 20,
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
    minHeight: 50,
    width: "95%",
  },
  inputText: {
    flex: 1,
    color: "#eee",
    placeholderTextColor: "#aaa",
  },
  inputIcon: {
    marginRight: 5,
    color: "#bbb",
  },
  message: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  messageText: {
    fontSize: 16,
    color: "#eee",
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
    color: "#bbb",
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
    paddingHorizontal: 30, // Augmenté pour plus d’espace
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
    paddingHorizontal: 30, // Augmenté pour plus d’espace
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
    paddingHorizontal: 30, // Augmenté pour plus d’espace
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
    backgroundColor: "#343a40",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,            // Prend tout l’espace disponible après l’icône
    flexShrink: 1,      // Rétrécit si nécessaire
    flexWrap: "wrap",   // Autorise le wrapping
    minWidth: 0,        // Évite les débordements
  },
  buttonIcon: {
    marginRight: 5,
    color: "#fff",
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
    color: "#bbb",
  },
  toggleLabel: {
    fontSize: 16,
    color: "#eee",
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
    justifyContent: "space-between",
    width: "95%",
    marginBottom: 10,
    marginHorizontal: 10,
  },
  filterButton: {
    flex: 1,
    backgroundColor: "#343a40",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 2,
    minHeight: 40,
  },
  messageFilterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: "#333",
  },
  messageFilterButtonActive: {
    backgroundColor: "#1e90ff",
  },
  messageFilterText: {
    fontSize: 14,
    textAlign: "center",
    color: "#ccc",
  },
  messageFilterTextActive: {
    color: "#fff",
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
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
  },
  roleButtonSelected: {
    backgroundColor: "#1e90ff",
  },
  userList: {
    flex: 1,
    width: "100%",
  },
  messageDebugBackground: {
    backgroundColor: "#335533",
  },
  messageInfoBackground: {
    backgroundColor: "#333333",
  },
  messagePrioritaireBackground: {
    backgroundColor: "#553333",
  },
  map: {
    flex: 1,
    marginVertical: 10,
  },
});