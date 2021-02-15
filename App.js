import React, { Component } from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, AnimatedRegion } from "react-native-maps";
import _ from "lodash";
import { Feather } from "@expo/vector-icons";
import apiKey from "./src/google_api_key.js";
import SearchBar from "./src/components/SearchBar";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: "",
      latitude: 0,
      longitude: 0,
      destination: "",
      destinationId: "",
      destinationMarker: [
        { key: null, name: "", coordinate: { latitude: 0, longitude: 0 } },
      ],
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
      5000
    );
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
    //this.mapView.animateToRegion(this.state.initialRegion, 1200);

    return this.getCurrentLocation().then((position) => {
      if (position) {
        this.setState({
          initialRegion: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.003,
            longitudeDelta: 0.003,
          },
        });
      }
    });
  }

  async onChangeDestination(destination) {
    this.setState({ destination });
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}&input=${destination}&location=${this.state.latitude},${this.state.longitude}&radius=32000`;
    try {
      const result = await fetch(apiUrl);
      const jsonResult = await result.json();
      this.setState({ locationPredictions: jsonResult.predictions });
    } catch (error) {
      console.log(error);
    }
  }

  async pressedPrediction(prediction) {
    //console.log(prediction);
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

    this.setState({ destinationMarker: newmark });

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

    this.setState({ destinationMarker: newmark });

    this.mapView.animateToRegion({
      latitude: newmark[0].coordinate.latitude,
      longitude: newmark[0].coordinate.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

  goToInitialLocation() {
    let initialRegion = Object.assign({}, this.state.initialRegion);
    initialRegion["latitudeDelta"] = 0.075;
    initialRegion["longitudeDelta"] = 0.075;
    console.log(initialRegion);

    this.mapView.animateToRegion(initialRegion, 1200);
    this.mapView.setMapBoundaries(
      { latitude: 41.091847, longitude: -123.489767 },
      { latitude: 40.187974, longitude: -124.355229 }
    );
  }

  render() {
    const locationPredictions = this.state.locationPredictions.map(
      (prediction) => (
        <TouchableHighlight
          key={prediction.id}
          onPress={() => this.pressedPrediction(prediction)}
        >
          <Text style={styles.suggestions} key={prediction.id}>
            {prediction.description}
          </Text>
        </TouchableHighlight>
      )
    );
    return (
      <View style={styles.container}>
        <MapView
          showsUserLocation
          followsUserLocation
          showsMyLocationButton
          loadingEnabled
          provider={PROVIDER_GOOGLE}
          ref={(ref) => (this.mapView = ref)}
          onMapReady={this.goToInitialLocation.bind(this)}
          onPoiClick={(e) => this.dropPinOnPress(e)}
          initialRegion={this.state.initialRegion}
          zoomEnabled={true}
          minZoomLevel={12}
          maxZoomLevel={20}
          style={styles.map}
        >
          {this.state.destinationMarker.map((marker) => (
            <MapView.Marker
              key={marker.key}
              title={marker.name}
              coordinate={marker.coordinate}
              draggable
            ></MapView.Marker>
          ))}
        </MapView>
        <SearchBar
          destination={this.state.destination}
          onDestinationChange={(destination) => {
            this.setState({ destination });
            this.onChangeDestinationDebounced(destination);
          }}
        />
        {locationPredictions}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  iconStyle: {
    fontSize: 35,
    alignSelf: "center",
    marginHorizontal: 10,
  },
  locationInput: {
    fontSize: 18,
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  suggestions: {
    backgroundColor: "white",
    padding: 5,
    fontSize: 18,
    borderWidth: 0.5,
    marginHorizontal: 5,
  },
});
