import React, { Component } from "react";
import {
  Alert,
  Image,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  Callout,
  Marker,
  CalloutSubview,
} from "react-native-maps";
import { Icon } from "react-native-elements";
import _ from "lodash";
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import { Ionicons } from "@expo/vector-icons";

//import components
import SearchBar from "../components/SearchBar";
import apiKey from "../../assets/keys/google_api_key";

const CopilotText = walkthroughable(Text);

class MapScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      copilotVisible: false,
      selectFormAlertVisible: false,
      error: "",
      locationName: "unknown",
      latitude: 0,
      longitude: 0,
      showModal: false,
      destination: "",
      destinationId: "",
      marker: [],
      locationPredictions: [],
      destinationDetails: {},
      destinationLatitude: 0,
      destinationLongitude: 0,
      mapRegion: {
        latitude: 40.875463,
        longitude: -124.082455,
        latitudeDelta: 0.0092,
        longitudeDelta: 0.0092,
      },
      initialRegion: {
        latitude: 40.787271,
        longitude: -124.158716,
        latitudeDelta: 0.009,
        longitudeDelta: 0.0009,
      },
      lastLat: 0,
      lastLong: 0,
    };
    this.onChangeDestinationDebounced = _.debounce(
      this.onChangeDestination,
      2500
    );
  }

  handleStartButtonPress() {
    this.props.start();
  }

  async getCurrentLocation() {
    //Get current location and set initial region to this
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        //user full location
        let region = {
          latitude: parseFloat(position.coords.latitude),
          longitude: parseFloat(position.coords.longitude),
          latitudeDelta: 5,
          longitudeDelta: 5,
        };
        await this.setState({
          initialRegion: region,
        });
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        //console.log(this.initialRegion);
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );
  }

  componentDidMount() {
    return this.getCurrentLocation().then((position) => {
      this.props.copilotEvents.on("stepChange", this.handleStepChange);
      this.props.copilotEvents.on("stop", () => {
        this.setState({ copilotVisible: false });
      });
      this.props.start();
      if (position) {
        this.setState({
          initialRegion: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.003,
            longitudeDelta: 0.003,
          },
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      }
    });
  }

  componentWillUnmount() {
    // Don't forget to disable event handlers to prevent errors
    this.props.copilotEvents.off("stop");
  }

  handleStepChange = (step) => {
    console.log(`Current step is: ${step.name}`);
  };

  async onChangeDestination(destination) {
    this.setState({ destination });
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}&input=${destination}&location=${this.state.latitude},${this.state.longitude}&radius=40000&strictbounds`;
    try {
      const result = await fetch(apiUrl);
      const jsonResult = await result.json();
      this.setState({ locationPredictions: jsonResult.predictions });
    } catch (error) {
      console.log(error);
    }
  }

  async pressedPrediction(prediction) {
    Keyboard.dismiss();

    const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?key=${apiKey}&place_id=${prediction.place_id}&fields=name,geometry`;
    try {
      const result = await fetch(apiUrl);
      const jsonResult = await result.json();
      //console.log(jsonResult);
      this.setState({
        destinationDetails: jsonResult.result,
      });
    } catch (error) {
      console.log(error);
    }

    this.setState({
      locationPredictions: [],
      destination: prediction.description,
      destinationId: prediction.place_id,
    });
    Keyboard;

    this.dropPin();
  }

  onLocationPress() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newmark = [
          {
            key: 888,
            name: "current location",
            coordinate: {
              latitude: this.state.latitude,
              longitude: this.state.longitude,
            },
          },
        ];

        this.setState({ marker: newmark });

        this.mapView.animateToRegion({
          latitude: newmark[0].coordinate.latitude,
          longitude: newmark[0].coordinate.longitude,
          latitudeDelta: 0.0005,
          longitudeDelta: 0.0005,
        });
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  }

  onReportFabPress() {
    this.onLocationPress();
  }

  dropPin = () => {
    const newmark = [
      {
        coordinate: {
          latitude: this.state.destinationDetails.geometry.location.lat,
          longitude: this.state.destinationDetails.geometry.location.lng,
        },
        key: 888,
        name: this.state.destinationDetails.name,
      },
    ];

    this.setState({ marker: newmark });

    this.mapView.animateToRegion({
      latitude: newmark[0].coordinate.latitude,
      longitude: newmark[0].coordinate.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

  dropPinOnPress = (e) => {
    const newmark = [
      {
        coordinate: e.nativeEvent.coordinate,
        key: 888,
        name: e.nativeEvent.name,
      },
    ];

    this.setState({ marker: newmark });

    this.mapView.animateToRegion({
      latitude: newmark[0].coordinate.latitude,
      longitude: newmark[0].coordinate.longitude,
      latitudeDelta: 0.00055,
      longitudeDelta: 0.00055,
    });
  };

  goToInitialLocation() {
    let initialRegion = Object.assign({}, this.state.initialRegion);
    initialRegion["latitudeDelta"] = 0.075;
    initialRegion["longitudeDelta"] = 0.075;

    this.mapView.animateToRegion(initialRegion, 1000);
    this.mapView.setMapBoundaries(
      { latitude: 41.091847, longitude: -123.489767 },
      { latitude: 40.187974, longitude: -124.355229 }
    );
  }

  //copilot
  handleStartButtonPress() {
    this.props.start();
    console.log("start tutorial");
  }

  render() {
    const locationPredictions = this.state.locationPredictions.map(
      (prediction) => (
        <TouchableHighlight
          key={prediction.place_id}
          onPress={() => this.pressedPrediction(prediction)}
        >
          <Text style={styles.suggestions} key={prediction.place_id}>
            {prediction.description}
          </Text>
        </TouchableHighlight>
      )
    );
    return (
      <View style={styles.container}>
        <MapView
          showsUserLocation={Platform.OS === "ios" ? true : false}
          followsUserLocation
          loadingEnabled
          provider={PROVIDER_GOOGLE}
          ref={(ref) => (this.mapView = ref)}
          onMapReady={this.goToInitialLocation.bind(this)}
          onPoiClick={(e) => this.dropPinOnPress(e)}
          initialRegion={this.state.initialRegion}
          zoomEnabled={true}
          minZoomLevel={13}
          maxZoomLevel={20}
          style={styles.mapStyle}
          onLongPress={(e) => this.dropPinOnPress(e)}
        >
          {this.state.marker.map((marker) => (
            <Marker
              draggable
              key={marker.key}
              coordinate={marker.coordinate}
              ref={(ref) => {
                this.marker = ref;
              }}
            >
              <Callout
                tooltip
                onPress={() => {
                  {
                    Platform.OS === "android"
                      ? Alert.alert(
                          JSON.stringify(marker.name),
                          "Please choose a form you would like to fill out",
                          [
                            {
                              text: "Cancel",
                              style: "cancel",
                            },
                            {
                              text: "There was bias",
                              onPress: () => {
                                this.props.navigation.navigate("MapNegForm", {
                                  locationName: marker.name,
                                  locLongitude: marker.coordinate.longitude,
                                  locLatitude: marker.coordinate.latitude,
                                });
                              },
                            },
                            {
                              text: "I felt welcomed",
                              onPress: () => {
                                this.props.navigation.push("MapPosForm", {
                                  locationName: marker.name,
                                  locLongitude: marker.coordinate.longitude,
                                  locLatitude: marker.coordinate.latitude,
                                });
                              },
                            },
                          ],
                          {
                            cancelable: false,
                          }
                        )
                      : console.log("ios");
                  }
                }}
              >
                <View>
                  <View>
                    <View style={styles.bubbleView}>
                      <View>
                        <Text style={styles.calloutName}>{marker.name}</Text>
                        <Text style={styles.calloutDetails}>
                          Please select a form
                        </Text>
                        {Platform.OS === "ios" && (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "stretch",
                              justifyContent: "space-between",
                              marginBottom: -3,
                            }}
                          >
                            <CalloutSubview
                              style={{
                                backgroundColor: "green",
                                borderWidth: 1,
                                borderColor: "black",
                                borderRadius: 5,
                                padding: 5,
                                marginRight: 5,
                                alignSelf: "flex-start",
                              }}
                              onPress={() => {
                                this.props.navigation.navigate("MapPosForm", {
                                  locationName: marker.name,
                                  locLongitude: marker.coordinate.longitude,
                                  locLatitude: marker.coordinate.latitude,
                                });
                              }}
                            >
                              <Text>Positive</Text>
                            </CalloutSubview>
                            <CalloutSubview
                              style={{
                                backgroundColor: "red",
                                borderWidth: 1,
                                borderColor: "black",
                                borderRadius: 5,
                                padding: 5,
                              }}
                              onPress={() => {
                                this.props.navigation.navigate("MapNegForm", {
                                  locationName: marker.name,
                                  locLongitude: marker.coordinate.longitude,
                                  locLatitude: marker.coordinate.latitude,
                                });
                              }}
                            >
                              <Text>Negative</Text>
                            </CalloutSubview>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.arrowBorder} />
                    <View style={styles.arrow} />
                  </View>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
        {this.state.selectFormAlertVisible &&
          Alert.alert(
            JSON.stringify(marker.name),
            "Please select a form to fill out",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "There was bias",
                onPress: () => {
                  this.props.navigation.navigate("MapNegForm", {
                    locationName: marker.name,
                    locLongitude: marker.coordinate.longitude,
                    locLatitude: marker.coordinate.latitude,
                  });
                },
              },
              {
                text: "I felt welcomed",
                onPress: () => {
                  this.props.navigation.push("MapPosForm", {
                    locationName: marker.name,
                    locLongitude: marker.coordinate.longitude,
                    locLatitude: marker.coordinate.latitude,
                  });
                },
              },
            ],
            {
              cancelable: false,
            }
          )}

        <SearchBar
          destination={this.state.destination}
          onDestinationChange={(destination) => {
            this.setState({ destination });
            this.onChangeDestinationDebounced(destination);
          }}
        />
        {locationPredictions}
        <View style={{ left: "45%" }}>
          <Icon
            name="info"
            icon="info"
            onPress={() => {
              this.setState({ showModal: !this.state.showModal });
            }}
          />
        </View>
        <View style={styles.myLocationButton}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => this.onReportFabPress()}
            style={styles.getLocationStyle}
          >
            <Text style={styles.fabText}>Report an Incident</Text>
          </TouchableOpacity>
        </View>

        <View style={{ top: "56.5%", left: "5%" }}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              console.log("Starting Tutorial");
              this.setState({ copilotVisible: true });
              this.handleStartButtonPress();
            }}
            style={[
              styles.getLocationStyle,
              { backgroundColor: "skyblue", top: "65%" },
            ]}
          >
            <Text style={styles.fabText}>Start the Tutorial</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.showModal}
        >
          <View style={styles.centeredView}>
            <View style={{ ...styles.modalView, opacity: 0.75 }}>
              <Text style={styles.modalText}>
                To share your story, start by choosing a location.
              </Text>
              <Image
                style={styles.tinyLogo}
                source={require("../../assets/longPress.png")}
              />
              <Text style={styles.modalText}>
                <Text style={{ fontWeight: "bold" }}>
                  Press down on the map{" "}
                </Text>
                {"\n"}
                or {"\n"}
                <Text style={{ fontWeight: "bold" }}>
                  click the location button
                </Text>
                , {"\n"}
                Click on the pin then choose which form you would like to fill
                out.
              </Text>
              <TouchableHighlight
                style={{ ...styles.openButton, backgroundColor: "2295F2" }}
                onPress={() => {
                  this.setState({ showModal: !this.state.showModal });
                }}
              >
                <Text style={styles.textStyle}>Hide</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
        {this.state.copilotVisible && (
          <View style={styles.wizContainer}>
            <View>
              <CopilotStep
                active={true}
                text="Welcome to {AppName}! Check out what you can do..."
                order={1}
                name="openApp"
              >
                <CopilotText style={styles.title}> {"Title/Logo"}</CopilotText>
              </CopilotStep>
            </View>
            <View style={styles.row}>
              <CopilotStep
                text="Here is the Home Page. Use this to..."
                order={4}
                name="homeTSab"
              >
                <CopilotText style={styles.tabItem}>
                  <Ionicons name="home" size={50} color="#888" />
                </CopilotText>
              </CopilotStep>
              <CopilotStep
                text="Here is the Stories Page. Check out the latest..."
                order={5}
                name="storiesTab"
              >
                <CopilotText style={styles.tabItem}>
                  <Ionicons name="library" size={50} color="#888" />
                </CopilotText>
              </CopilotStep>
              <CopilotStep
                text="Here is the Newsfeed. Stay up to date by..."
                order={6}
                name="newsTab"
              >
                <CopilotText style={styles.tabItem}>
                  <Ionicons name="newspaper" size={50} color="#888" />
                </CopilotText>
              </CopilotStep>
              <CopilotStep
                text="This is the 'About Us' page. See what were up to..."
                order={7}
                name="aboutUsTab"
              >
                <CopilotText style={styles.tabItem}>
                  <Ionicons name="people" size={50} color="#888" />
                </CopilotText>
              </CopilotStep>
            </View>
            <View style={{ width: "95%" }}>
              <CopilotStep
                text="Not at the location you want to report from? As long at it is within the bounds of Humboldt County, you can find it here!"
                order={3}
                name="searchbar"
              >
                <CopilotText
                  style={{
                    marginTop: -15,
                    height: 40,
                  }}
                ></CopilotText>
              </CopilotStep>
            </View>

            <View style={styles.middleView}>
              <View style={styles.copMyLocationButton}>
                <View style={styles.copGetLocationStyle}>
                  <CopilotStep
                    style={{ borderRadius: 16 }}
                    text="Report a story from your current location!"
                    order={2}
                    name="fabReport"
                  >
                    <CopilotText style={styles.fabText}>
                      {"Report an Incident"}
                    </CopilotText>
                  </CopilotStep>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wizContainer: {
    flex: 1,
    backgroundColor: "#ffffffbb",
    marginTop: -375,
    alignItems: "center",
    paddingTop: 15,
    opacity: 0.35,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 55,
  },
  middleView: {
    flex: 1,
    alignItems: "center",
  },
  bubbleView: {
    flexDirection: "row",
    alignSelf: "flex-start",
    backgroundColor: "#FFF",
    borderRadius: 6,
    borderColor: "#CCC",
    borderWidth: 0.5,
    padding: 10,
    width: "auto",
  },
  arrow: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderTopColor: "#fff",
    borderWidth: 16,
    alignSelf: "center",
    marginTop: -33,
  },
  arrowBorder: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderTopColor: "#CCC",
    borderWidth: 16,
    alignSelf: "center",
    marginTop: -0.5,
  },
  calloutName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  calloutDetails: {
    fontSize: 14,
    paddingBottom: 6,
  },
  button: {
    backgroundColor: "#2980b9",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    bottom: "9%",
  },
  tabItem: {
    flex: 1,
    textAlign: "center",
  },
  copGetLocationStyle: {
    width: 85,
    height: 85,
    alignItems: "center",
    alignContent: "center",
    borderRadius: 45,
    padding: 5,
    backgroundColor: "#EA6748",
    opacity: 0.5,
    shadowColor: "grey",
    shadowOffset:
      Platform.OS === "ios"
        ? {
            width: 0,
            height: 3,
          }
        : null,
    shadowOpacity: Platform.OS === "ios" ? 0.9 : null,
  },
  copMyLocationButton: {
    alignContent: "center",
    width: 51,
    top: 300,
    borderRadius: 50,
    left: Platform.OS === "ios" ? "30.5%" : "74.5%",
    top: Platform.OS === "ios" ? "85.5%" : "70.5%",
  },
  centeredView: {
    flex: 1,
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  fabText: {
    flex: 1,
    color: "#FFF",
    fontWeight: "bold",
    paddingTop: 8,
    textAlign: "center",
    width: 60,
    height: 60,
  },
  getLocationStyle: {
    width: 85,
    height: 85,
    alignItems: "center",
    alignContent: "center",
    borderRadius: 45,
    padding: 5,
    backgroundColor: "#EA6748",
    shadowColor: "grey",
    shadowOffset:
      Platform.OS === "ios"
        ? {
            width: 0,
            height: 3,
          }
        : null,
    shadowOpacity: Platform.OS === "ios" ? 0.9 : null,
  },
  mapStyle: {
    ...StyleSheet.absoluteFillObject,
  },
  modalText: {
    color: "white",
    marginBottom: 15,
    textAlign: "center",
    alignContent: "center",
  },
  modalView: {
    backfaceVisibility: "hidden",
    height: "70%",
    width: "95%",
    margin: 10,
    backgroundColor: "black",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  myLocationButton: {
    alignContent: "center",
    width: 51,
    top: 300,
    borderRadius: 50,
    left: Platform.OS === "ios" ? "74.5%" : "74.5%",
    top: Platform.OS === "ios" ? "75.5%" : "70.5%",
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  suggestions: {
    backgroundColor: "white",
    padding: 5,
    fontSize: 18,
    borderWidth: 0.5,
    marginHorizontal: 5,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  tinyLogo: {
    tintColor: "white",
    width: 75,
    height: 75,
  },
});

const circleSvgPath = ({ position, canvasSize }) =>
  `M0,0H${canvasSize.x}V${canvasSize.y}H0V0ZM${position.x._value},${position.y._value}Za50 50 0 1 0 100 0 50 50 0 1 0-100 0`;

export default copilot({
  tooltipStyle: {
    borderRadius: 10,
    paddingTop: 5,
  },
  arrowColor: "#FFF",
  //backdropColor: "rgba(50, 50, 100, 0.9)",
  animated: true, // Can be true or false
  overlay: "svg", // Can be either view or svg
  //svgMaskPath:  circleSvgPath,
})(MapScreen);
