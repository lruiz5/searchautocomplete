import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";

export default function MapItemDetail(props) {
  return (
    <View style={styles.detail}>
      <View style={styles.titleWrapper}>
        <Text style={styles.titleText}>{props.route.params.title}</Text>
      </View>
      <View style={styles.descWrapper}>
        <Text>{props.route.params.date}</Text>
        <Text>{props.route.params.category}</Text>
        <Text>{props.route.params.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  detail: {
    backgroundColor: Platform.os == "iOS" ? "#ffe066" : "#e0ac9d",
    height: 700,
    margin: 5,
    borderRadius: 10,
    shadowColor: "black",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  titleWrapper: {
    marginTop: 10,
    paddingHorizontal: 5,
  },
  descWrapper: {
    paddingHorizontal: 5,
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
