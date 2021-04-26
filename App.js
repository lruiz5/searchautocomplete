import React from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

//import screens
import MapScreen from "./src/screens/MapScreen";
import { NewsletterHome } from "./src/screens/NewsletterScreen";
import MyHeader from "./src/components/Header";
import NewsDetailView from "./src/screens/NewsletterDetailScreen";
import PositiveForm from "./src/screens/PositiveForm";
import NegativeForm from "./src/screens/NegativeForm";
import MapMarker from "./src/screens/MapItemScreen";
import MapItemDetail from "./src/screens/MapItemDetailScreen";
import AboutUs from "./src/screens/About";

const HomeTab = createMaterialTopTabNavigator();

function HomeTabs() {
  return (
    <HomeTab.Navigator
      initialRouteName="MapScreen"
      backBehavior="history"
      style={styles.tabs}
      tabBarOptions={{
        showIcon: true,
        showLabel: true,
        indicatorStyle: { backgroundColor: "black" },
        activeTintColor: "black",
        inactiveTintColor: "grey",
      }}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Stories") {
            iconName = focused ? "library" : "library-outline";
          } else if (route.name === "News") {
            iconName = focused ? "newspaper" : "newspaper-outline";
          } else if (route.name === "About Us") {
            iconName = focused ? "people" : "people-outline";
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={25} color={color} />;
        },
      })}
    >
      <HomeTab.Screen name="Home" component={MapScreen} />
      <HomeTab.Screen name="Stories" component={MapMarker} />
      <HomeTab.Screen name="News" component={NewsletterHome} />
      <HomeTab.Screen name="About Us" component={AboutUs} />
    </HomeTab.Navigator>
  );
}

const MapItemStack = createStackNavigator();

function MapItemStackScreen() {
  return (
    <MapItemStack.Navigator screenOptions={{ headerShown: false }}>
      <MapItemStack.Screen name="homeTabs" component={HomeTabs} />
      <MapItemStack.Screen name="MapItemDetail" component={MapItemDetail} />
      <MapItemStack.Screen name="NewsDetail" component={NewsDetailView} />
      <MapItemStack.Screen name="MapPosForm" component={PositiveForm} />
      <MapItemStack.Screen name="MapNegForm" component={NegativeForm} />
    </MapItemStack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <MyHeader />
      <MapItemStackScreen></MapItemStackScreen>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabs: {
    paddingTop: -1,
  },
});
