import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  Image,
  ScrollView,
} from "react-native";

function NewsDetailView(props) {
  return (
    <View style={styles.detail}>
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
        <Text style={styles.titleText}>{props.route.params.title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.descWrapper}>
        <Text style={{ marginBottom: 30, fontSize: 15 }}>
          {props.route.params.body}
        </Text>
      </ScrollView>
      <View style={styles.dateWrapper}>
        <Text>
          By: {props.route.params.author} on {props.route.params.date}
        </Text>
      </View>
    </View>
  );
}

export default NewsDetailView;

const styles = StyleSheet.create({
  detail: {
    backgroundColor: Platform.OS == "ios" ? "#ffe066" : "#e0ac9d",
    height: "95%",
    margin: 5,
    borderRadius: 10,
    shadowColor: "black",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  imageWrapper: {
    width: "100%",
    height: "20%",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    overflow: "hidden",
  },
  titleWrapper: {
    marginTop: 15,
    marginHorizontal: 25,
  },
  descWrapper: {
    marginHorizontal: 25,
    marginTop: 10,
    marginBottom: 10,
  },
  dateWrapper: {
    bottom: 0,
    right: 0,
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    marginTop: 5,
    marginBottom: 7.5,
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
