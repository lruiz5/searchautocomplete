import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

const SearchBar = ({ destination, onDestinationChange }) => {
  return (
    <View style={styles.backgroundStyle}>
      <Feather name="search" style={styles.iconStyle} />
      <TextInput
        selectTextOnFocus
        style={styles.inputStyle}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Search"
        value={destination}
        onChangeText={onDestinationChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundStyle: {
    backgroundColor: "#FFFF",
    height: 40,
    borderRadius: 5,
    marginHorizontal: 10,
    marginTop: 60,
    flexDirection: "row",
    marginBottom: 5,
  },
  inputStyle: {
    fontSize: 18,
    flex: 1,
  },
  iconStyle: {
    fontSize: 35,
    alignSelf: "center",
    marginHorizontal: 10,
  },
});

export default SearchBar;
