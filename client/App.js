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
import { Image, View, StyleSheet, StatusBar, Platform } from "react-native";
import * as eva from "@eva-design/eva";
import { IconRegistry, ApplicationProvider, useTheme, Spinner } from "@ui-kitten/components";
import AttendanceRecords from "./screens/AttendanceRecords";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import AttendanceHistoryScreen from "./screens/AttendanceHistoryScreen";
import AnalyticsScreen from "./screens/AnalyticsScreen";
import * as SplashScreen from 'expo-splash-screen';
import CustomSplash from './components/CustomSplash'

SplashScreen.preventAutoHideAsync();

function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  // const [appIsReady, setAppIsReady] = useState(false);
  // const [showSplash, setShowSplash] = useState(true);
  const Stack = createStackNavigator();
  const theme = useTheme();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');  
      setIsLoggedIn(!!token);
    };
    checkToken();
  }, []);
  
  // useEffect(() => {
  //   async function prepare() {
  //     try {
  //       await new Promise(resolve => setTimeout(resolve, 1000));
        
  //       const token = await AsyncStorage.getItem('token');  
  //       setIsLoggedIn(!!token);
        
  //       await Promise.all([
  //         // Add resource loading for future
  //         SplashScreen.hideAsync()
  //       ]);

  //     } catch (e) {
  //       console.warn(e);
  //     } finally {
  //       setAppIsReady(true);
  //       setTimeout(() => {
  //         setShowSplash(false);
  //       }, 2000);
  //     }
  //   }

  //   prepare();
  // }, []);

  // const onLayoutRootView = useCallback(async () => {
  //   if (appIsReady) {
  //     await SplashScreen.hideAsync();
  //   }
  // }, [appIsReady]);

  // if (!appIsReady || showSplash) {
  //   return <CustomSplash />;
  // } 

  const LoadingIndicator = (props) => (
    <View style={[props.style, styles.indicator]}>
      <Spinner size='small' />
    </View>
  );

  if (isLoggedIn === null) return <LoadingIndicator/>;


  const navigationScreens = [
    { name: "UserType", component: UserTypeScreen, headerShown: false },
    { name: "Login", component: LoginScreen, headerShown: false },
    { name: "Register", component: RegisterScreen, headerShown: false },
    { name: "Home", component: HomeScreen, headerShown: true },
    { name: "Attendance", component: AttendanceScreen, headerShown: true },
    {
      name: "CreateOrganization",
      component: CreateOrganizationScreen,
      headerShown: false,
    },
    {
      name: "CreateOfficeLocation",
      component: CreateOfficeLocation,
      headerShown: false,
    },
    {
      name: "JoinOrganization",
      component: JoinOrganizationScreen,
      headerShown: false,
    },
    { name: "GetAllUsers", component: GetAllUsers, headerShown: true },
    {
      name: "AttendanceRecords",
      component: AttendanceRecords,
      headerShown: true,
    },
    {
      name: "GetMyRecords",
      component: AttendanceHistoryScreen,
      headerShown: true,
    },
    {
      name: "Analytics",
      component: AnalyticsScreen,
      headerShown: true,
    },
  ];

  // const LoadingIndicator = (props) => (
  //   <View style={[props.style, styles.indicator]}>
  //     <Spinner size='small' />
  //   </View>
  // );

  // if (isLoggedIn === null) return <LoadingIndicator/>;

  return (
    <NavigationContainer  
    // onLayout={onLayoutRootView}
    >
      <StatusBar
        backgroundColor="#1A2138"
        barStyle="light-content"
      />
      <Stack.Navigator
        initialRouteName={isLoggedIn ? 'Home' : 'UserType'}
        screenOptions={{
          headerStyle: {
            backgroundColor: "#1A2138",
            elevation: 0, // Android
            shadowOpacity: 0, // iOS
            borderBottomWidth: 1,
            height: Platform.OS === 'ios' ? 110 : 80,
            borderBottomColor: "#535353"
          },
          headerTintColor: "#fff",
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
                      <View style={styles.headerContainer}>
                        <Image
                          source={require("./assets/images/header.png")}
                          style={styles.headerImage}
                          resizeMode="contain"
                        />
                      </View>
                    ),
                    headerLeft: null,
                  }
                : { headerShown: false }
            }
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222B45'
  },
  headerContainer: {
    paddingHorizontal: 20,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerImage: {
    width: 180,
    height: 50
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});


export default function App() {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.dark}>
        <AppNavigator />
      </ApplicationProvider>
    </>
  );
}
