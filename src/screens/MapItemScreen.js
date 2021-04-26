import React, { useState, useEffect } from "react";
import MapView, {
  Marker,
  ProviderPropType,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";

import subs from "../components/mapData";

//aws
import Amplify from "@aws-amplify/core";
import config from "../../aws-exports";
import API, { graphqlOperation } from "@aws-amplify/api";

Amplify.configure(config);

const ListSubmissions = `
query {
  listSubmissions {
    items {
      id  status form_type confidential date description latitude longitude location_name
    }
  }
}
`;

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = 220;
const CARD_WIDTH = width * 0.8;
const SPACING_FOR_CARD_INSET = width * 0.1 - 10;

const ASPECT_RATIO = width / height;
const LAT = 40.78614;
const LONG = -124.161308;
const LAT_DELTA = 0.0922;
const LONG_DELTA = 0.0421;
let id = 0;

const MapMarker = ({ navigation }) => {
  const initialMapState = {
    markers: [],
    region: {
      latitude: LAT,
      longitude: LONG,
      latitudeDelta: LAT_DELTA,
      longitudeDelta: LONG_DELTA,
    },
  };

  const [state, setState] = useState({
    markers: subs,
    region: {
      latitude: LAT,
      longitude: LONG,
      latitudeDelta: LAT_DELTA,
      longitudeDelta: LONG_DELTA,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await API.graphql(graphqlOperation(ListSubmissions));
        console.log("results: ", results);
        setState({ markers: results.data.listSubmissions.items });
      } catch (err) {
        console.log("error: ", err);
      }
    };

    //fetchData();
  }, []);

  let mapIndex = 0;
  let mapAnimation = new Animated.Value(0);

  useEffect(() => {
    mapAnimation.addListener(({ value }) => {
      let index = Math.floor(value / CARD_WIDTH + 0.3); // animate 30% away from landing on the next item
      if (index >= state.markers.length) {
        index = state.markers.length - 1;
      }
      if (index <= 0) {
        index = 0;
      }

      clearTimeout(regionTimeout);

      const regionTimeout = setTimeout(() => {
        if (mapIndex !== index) {
          mapIndex = index;
          const coordinate = {
            latitude: state.markers[index].latitude,
            longitude: state.markers[index].longitude,
          };
          _map.current.animateToRegion(
            {
              ...coordinate,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            },
            350
          );
        }
      }, 10);
    });
  });

  const interpolations = state.markers.map((marker, index) => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];

    const scale = mapAnimation.interpolate({
      inputRange,
      outputRange: [1, 1.65, 1],
      extrapolate: "clamp",
    });

    return { scale };
  });

  const onMarkerPress = (mapEventData) => {
    const markerId = mapEventData._targetInst.return.key;
    let x = markerId * CARD_WIDTH + markerId * 20;
    if (Platform.OS === "ios") {
      x = x - SPACING_FOR_CARD_INSET;
    }

    _scrollView.current.scrollTo({ x: x, y: 0, animated: true });
  };

  const _map = React.useRef(null);
  const _scrollView = React.useRef(null);

  return (
    <View style={styles.container}>
      <MapView
        ref={_map}
        initialRegion={state.region}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
      >
        {state.markers.map((marker, index) => {
          const scaleStyle = {
            transform: [{ scale: interpolations[index].scale }],
          };
          return (
            !marker.confidential && (
              <Marker
                key={index}
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                pinColor={marker.form_type ? "#297045" : "#931F1D"}
                onCalloutPress={() => {
                  navigation.navigate("MapItemDetail", {
                    title: marker.title,
                    date: marker.date,
                    category: marker.bias_type,
                    description: marker.description,
                  });
                }}
                onPress={(e) => onMarkerPress(e)}
              >
                <Animated.View style={[styles.markerWrap]}>
                  <Animated.Image
                    source={require("../../assets/map_marker.png")}
                    style={[
                      styles.marker,
                      scaleStyle,
                      {
                        tintColor:
                          marker.form_type === "positive"
                            ? "#297045"
                            : "#931F1D",
                      },
                    ]}
                    resizeMode="cover"
                  />
                </Animated.View>
              </Marker>
            )
          );
        })}
      </MapView>
      <Animated.ScrollView
        ref={_scrollView}
        horizontal
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        pagingEnabled
        snapToInterval={CARD_WIDTH + 20}
        snapToAlignment="center"
        contentInset={{
          top: 0,
          left: SPACING_FOR_CARD_INSET,
          bottom: 0,
          right: SPACING_FOR_CARD_INSET,
        }}
        contentContainerStyle={{
          paddingHorizontal:
            Platform.OS === "android" ? SPACING_FOR_CARD_INSET : 0,
        }}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  x: mapAnimation,
                },
              },
            },
          ],
          { useNativeDriver: true }
        )}
      >
        {state.markers.map(
          (marker, index) =>
            !marker.confidential && (
              <View style={styles.card} key={index}>
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("MapItemDetail", {
                        location: marker.location_name,
                        date: marker.date,
                        category: marker.bias_type,
                        description: marker.description,
                      });
                    }}
                  >
                    <Text numberOfLines={1} style={styles.cardTitle}>
                      {marker.location_name}
                    </Text>
                    <Text style={styles.cardCategory} numberOfLines={1}>
                      Date: {marker.date}
                    </Text>
                    <Text style={styles.cardCategory} numberOfLines={1}>
                      Category: {marker.bias_type}
                    </Text>
                    <Text style={styles.cardDescription} numberOfLines={1}>
                      {marker.description}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
        )}
      </Animated.ScrollView>
    </View>
  );
};

MapMarker.propTypes = {
  provider: ProviderPropType,
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  bubble: {
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  latlng: {
    width: 200,
    alignItems: "stretch",
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent",
  },
  card: {
    elevation: 2,
    backgroundColor: "#FFF",
    borderRadius: 6,
    marginHorizontal: 10,
    marginTop: 3,
    marginBottom: 10,
    shadowColor: "#000",
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: { x: 2, y: -2 },
    height: CARD_HEIGHT / 1.5,
    width: CARD_WIDTH,
    overflow: "hidden",
  },
  cardCategory: {
    marginLeft: 7,
    marginBottom: 5,
    fontSize: 13,
    color: "#444",
  },
  cardTitle: {
    fontSize: 20,
    marginVertical: 5,
    marginHorizontal: 5,
    fontWeight: "bold",
  },
  cardDescription: {
    marginLeft: 7,
    marginHorizontal: 5,
    fontSize: 16,
    color: "#444",
  },
  marker: {
    width: 30,
    height: 30,
  },
  markerWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
  },
  scrollView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },
});

export default MapMarker;
