import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "./screens/LoginScreen";
import { createStackNavigator } from "@react-navigation/stack";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import AttendanceScreen from "./screens/AttendanceScreen";
import UserTypeScreen from "./screens/UserTypeScreen";
import CreateOrganizationScreen from "./screens/organization/CreateOrganizationScreen";
import CreateOfficeLocation from "./screens/officeLocation/CreateOfficeLocation";
import JoinOrganizationScreen from "./screens/organization/JoinOrganizationScreen";
import GetAllUsers from "./screens/organization/GetAllUsers";
import { Image } from "react-native";
import * as eva from "@eva-design/eva";
import { ApplicationProvider, useTheme } from "@ui-kitten/components";
import AttendanceRecords from "./screens/AttendanceRecords";

function AppNavigator() {
  const Stack = createStackNavigator();
  const theme = useTheme();

  const navigationScreens = [
    { name: "UserType", component: UserTypeScreen, headerShown: false },
    { name: "Login", component: LoginScreen, headerShown: false },
    { name: "Register", component: RegisterScreen, headerShown: false },
    { name: "Home", component: HomeScreen, headerShown: true },
    { name: "Attendance", component: AttendanceScreen, headerShown: true },
    { name: "CreateOrganization", component: CreateOrganizationScreen, headerShown: false },
    { name: "CreateOfficeLocation", component: CreateOfficeLocation, headerShown: false },
    { name: "JoinOrganization", component: JoinOrganizationScreen, headerShown: false },
    { name: "GetAllUsers", component: GetAllUsers, headerShown: true },
    { name: "AttendanceRecords", component: AttendanceRecords, headerShown: true }
  ];

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="UserType"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#33415c", 
          },
          headerTintColor: "#fff", // Global back button and text color
          headerTitleAlign: "center",
        }}
      >
        {navigationScreens.map((screen, index) => (
          <Stack.Screen
            key={index}
            name={screen.name}
            component={screen.component}
            options={
              screen.headerShown
                ? {
                    headerTitle: () => (
                      <Image
                        source={require("./assets/images/header.png")}
                        style={{ width: 200, height: 60 }}
                        resizeMode="contain"
                      />
                    ),
                    headerLeft: () => null, 
                  }
                : { headerShown: false }
            }
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ApplicationProvider {...eva} theme={eva.dark}>
      <AppNavigator />
    </ApplicationProvider>
  );
}
