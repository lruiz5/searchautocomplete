import React, { useState } from "react";
import { StatusBar } from "react-native";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  Modal,
  TouchableHighlight,
  Dimensions,
  Component,
  Image,
} from "react-native";
import { Header, Icon } from "react-native-elements";

const MyHeader = () => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header
        backgroundColor="#fff"
        //rightComponent={<Icon name="info" icon="info" onPress={()=>{setModalVisible(!modalVisible)}}/>}
        centerComponent={{ text: "Title/Logo" }}
      />
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
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
              <Text style={{ fontWeight: "bold" }}>Press down on the map </Text>
              {"\n"}
              or {"\n"}
              <Text style={{ fontWeight: "bold" }}>
                click the location button
              </Text>
              , {"\n"}
              then choose which form you would like to fill out.
            </Text>
            <TouchableHighlight
              style={{ ...styles.openButton, backgroundColor: "2295F2" }}
              onPress={() => {
                setModalVisible(!modalVisible);
              }}
            >
              <Text style={styles.textStyle}>Hide</Text>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MyHeader;

const styles = StyleSheet.create({
  header: {
    marginTop: 40,
    backgroundColor: "white",
    padding: 5,
    borderBottomColor: "#ffffff",
    borderBottomWidth: 1,
  },
  title: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 20,
    color: "#ffffff",
  },
  centeredView: {
    flex: 1,
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
  },
  tinyLogo: {
    tintColor: "white",
    width: 75,
    height: 75,
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
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    color: "white",
    marginBottom: 15,
    textAlign: "center",
    alignContent: "center",
  },
});
