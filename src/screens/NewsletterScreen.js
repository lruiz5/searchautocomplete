import React from "react";
import {
  StyleSheet,
  ScrollView,
  Text,
  TouchableHighlight,
  View,
  Image,
} from "react-native";
import Card from "../components/NewsletterCard";
import newsletterData from "../components/newsfeedData";
import { FlatList } from "react-native";

export function NewsletterHome({ navigation }) {
  return (
    /*  <ScrollView>
      <TouchableHighlight
        onPress={() => navigation.navigate("NewsDetail")}
        underlayColor="white"
      >
        <Card />
      </TouchableHighlight>
      <TouchableHighlight
        onPress={() => navigation.navigate("NewsDetail")}
        underlayColor="white"
      >
        <Card />
      </TouchableHighlight>
      <TouchableHighlight
        onPress={() => navigation.navigate("NewsDetail")}
        underlayColor="white"
      >
        <Card />
      </TouchableHighlight>
      <TouchableHighlight
        onPress={() => navigation.navigate("NewsDetail")}
        underlayColor="white"
      >
        <Card />
      </TouchableHighlight>
    </ScrollView> */
    <View>
      <FlatList
        data={newsletterData}
        keyExtractor={(newsItem) => newsItem.id}
        renderItem={(item) => {
          return (
            <TouchableHighlight
              onPress={() =>
                navigation.navigate("NewsDetail", {
                  date: item.item.date,
                  title: item.item.title,
                  body: item.item.body,
                  author: item.item.author,
                })
              }
              underlayColor="white"
            >
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
                  <Text style={styles.titleText}>{item.item.title}</Text>
                </View>
                <View style={styles.descWrapper}>
                  <Text numberOfLines={5}>{item.item.body}</Text>
                </View>
                <View style={styles.dateWrapper}>
                  <Text>{item.item.date}</Text>
                </View>
              </View>
            </TouchableHighlight>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: Platform.OS == "ios" ? "#ffe066" : "#e0ac9d",
    height: 290,
    margin: 15,
    borderRadius: 10,
    shadowColor: "black",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  imageWrapper: {
    width: "100%",
    height: "30%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden",
  },
  titleWrapper: {
    height: "10%",
    paddingHorizontal: 15,
    marginTop: 12,
  },
  dateWrapper: {
    position: "absolute",
    bottom: 0,
    right: 0,
    paddingHorizontal: 12,
    marginBottom: 7.5,
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
    fontSize: 16,
    color: "black",
    fontWeight: "bold",
  },
});
