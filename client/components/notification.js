import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";

// Configure how notifications should be displayed
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.error("Failed to get notification permissions!");
    return false;
  }

  return true;
};

// Send a local notification
export const sendNotification = async (title, body) => {
  const hasPermission = await requestNotificationPermissions();

  if (!hasPermission) {
    console.error("No permission to display notifications");
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true,
      },
      trigger: null, // Immediately show the notification
    });

    console.log("Notification sent:", { title, body });
  } catch (error) {
    console.error("Error sending notification:", error.message);
  }
};
