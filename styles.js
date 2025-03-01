import { StyleSheet } from "react-native";

export const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#000000",
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "normal",
    marginBottom: 20,
    color: "#000000",
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    color: "#000000",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  message: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    marginVertical: 5,
    borderRadius: 8,
    width: "100%",
  },
  messageText: {
    color: "#000000",
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
    color: "#000000",
  },
  profileButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#444",
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButton: {
    marginTop: 20,
    backgroundColor: "#888",
    padding: 10,
    borderRadius: 8,
  },
  warningBanner: {
    backgroundColor: "#ff4444",
    padding: 10,
    width: "100%",
    alignItems: "center",
  },
  warningText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    backgroundColor: "#838383",
    padding: 6,
    marginTop: 10,
    borderRadius: 5,
    textAlign: "center",
  },
  notificationToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  notificationLabel: {
    fontSize: 16,
    color: "#000000",
    flexShrink: 1,
  },
  switchStyle: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
    marginLeft: 10,
  },
  passwordChangeContainer: {
    width: "100%",
    marginVertical: 20,
  },
  logoutButton: {
    backgroundColor: "#ff4444",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  versionText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  userList: {
    width: "100%",
    marginTop: 10,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    width: "100%",
  },
  userRow: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  addContainer: {
    width: "100%",
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  picker: {
    width: "100%",
    height: 50,
    marginBottom: 12,
    paddingVertical: 5,
    fontSize: 16,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
    minWidth: 100,
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    backgroundColor: "#ccc",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 2,
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  roleSelector: { // Nouveau style pour les boutons radio
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },
  roleButton: { // Style par défaut
    flex: 1,
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  roleButtonSelected: { // Style quand sélectionné
    backgroundColor: "#007BFF",
  },
});

export const darkStyles = {
  ...lightStyles,
  container: {
    ...lightStyles.container,
    backgroundColor: "#121212",
  },
  title: {
    ...lightStyles.title,
    color: "#ffffff",
  },
  subtitle: {
    ...lightStyles.subtitle,
    color: "#ffffff",
  },
  input: {
    ...lightStyles.input,
    backgroundColor: "#222",
    color: "#ffffff",
    borderColor: "#444",
  },
  message: {
    ...lightStyles.message,
    backgroundColor: "#1E1E1E",
  },
  messageText: {
    color: "#ffffff",
  },
  info: {
    ...lightStyles.info,
    color: "#ffffff",
  },
  profileButton: {
    ...lightStyles.profileButton,
    backgroundColor: "#ddd",
  },
  buttonText: {
    ...lightStyles.buttonText,
    color: "#000",
  },
  warningBanner: {
    ...lightStyles.warningBanner,
    backgroundColor: "#aa0000",
  },
  notificationLabel: {
    ...lightStyles.notificationLabel,
    color: "#ffffff",
  },
  logoutButton: {
    ...lightStyles.logoutButton,
    backgroundColor: "#aa0000",
  },
  versionText: {
    ...lightStyles.versionText,
    color: "#999",
  },
  userItem: {
    ...lightStyles.userItem,
    backgroundColor: "#1E1E1E",
  },
  addContainer: {
    ...lightStyles.addContainer,
    backgroundColor: "#1E1E1E",
  },
  modalContent: {
    ...lightStyles.modalContent,
    backgroundColor: "#1E1E1E",
  },
  picker: {
    ...lightStyles.picker,
    color: "#ffffff",
    backgroundColor: "#222",
  },
  toggleButton: {
    ...lightStyles.toggleButton,
  },
  filterContainer: {
    ...lightStyles.filterContainer,
  },
  filterButton: {
    ...lightStyles.filterButton,
    backgroundColor: "#444",
  },
  deleteButton: {
    ...lightStyles.deleteButton,
    backgroundColor: "#aa0000",
  },
  roleSelector: {
    ...lightStyles.roleSelector,
  },
  roleButton: {
    ...lightStyles.roleButton,
    backgroundColor: "#444",
  },
  roleButtonSelected: {
    ...lightStyles.roleButtonSelected,
    backgroundColor: "#81b0ff",
  },
};