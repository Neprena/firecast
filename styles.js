import { StyleSheet } from "react-native";

// Palette de couleurs cohérente
const COLORS = {
  primary: "#007BFF", // Bleu principal pour actions
  secondary: "#6c757d", // Gris pour actions secondaires
  danger: "#dc3545", // Rouge pour suppression
  background: "#ffffff", // Fond clair
  text: "#000000", // Texte principal
  success: "#28a745", // Vert pour succès
};

export const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "normal",
    marginBottom: 20,
    color: COLORS.text,
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    color: COLORS.text,
    flexDirection: "row",
    alignItems: "center",
  },
  inputIcon: {
    marginRight: 10,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonIcon: {
    marginRight: 8,
  },
  message: {
    backgroundColor: "#f0f0f0", // Fond gris clair par défaut
    padding: 12,
    marginVertical: 5, // Séparation verticale
    borderRadius: 8,
    width: "100%",
  },
  messageText: {
    color: COLORS.text,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
    color: COLORS.text,
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
    backgroundColor: COLORS.secondary,
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  warningBanner: {
    backgroundColor: COLORS.danger,
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
    color: COLORS.text,
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
    backgroundColor: COLORS.danger,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
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
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.danger,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  roleSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },
  roleButton: {
    flex: 1,
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  roleButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
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
  loadingContainer: {
    ...lightStyles.loadingContainer,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
};