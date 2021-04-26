import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  Image,
  Alert,
  TouchableHighlight,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import NewsDetailView from "../screens/NewsletterDetailScreen";

function Card({ navigation }) {
  onPressButton = () => {};
  return (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri:
              "https://mailrelay.com/wp-content/uploads/2016/12/newsletter.jpg",
          }}
          style={styles.image}
        />
      </View>
      <View style={styles.titleWrapper}>
        <Text style={styles.titleText}>Dummy Title</Text>
      </View>
      <View style={styles.descWrapper}>
        <Text>This is a dummy description</Text>
      </View>
    </View>
  );
}

export default Card;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Platform.OS == "ios" ? "#ffe066" : "#e0ac9d",
    height: 300,
    margin: 20,
    borderRadius: 10,
    shadowColor: "black",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  imageWrapper: {
    width: "100%",
    height: "40%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden",
  },
  titleWrapper: {
    height: "10%",
    paddingHorizontal: 15,
    marginTop: 15,
  },
  descWrapper: {
    paddingHorizontal: 15,
    marginTop: 5,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
