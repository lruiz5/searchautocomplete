import React from "react";
import { View, StyleSheet, Text } from "react-native";
import PropTypes from "prop-types";
import RNPickerSelect from "react-native-picker-select";

const RNPickerComponent = ({
  inputStyle,
  containerStyle,
  touched,
  error,
  ...props
}) => {
  return (
    <View style={containerStyle}>
      <Text style={styles.errorInput}>{touched && error}</Text>
      <RNPickerSelect
        style={pickerStyle}
        placeholder={{
          label: "Select an option",
          value: "",
        }}
        {...props}
      />
    </View>
  );
};

// This creates an object of styles using React Native StyleSheet
const styles = StyleSheet.create({
  containerStyle: {
    marginTop: -3,
  },
  input: {
    borderBottomWidth: 1,
    minHeight: 40,
    padding: 10,
  },
  errorInput: {
    textAlign: "right",
    marginRight: 15,
    marginTop: -12,
    color: "red",
    fontWeight: "bold",
    fontSize: 13,
  },
});

const pickerStyle = {
  inputIOS: {
    height: 40,
    textAlign: "auto",
    width: "95%",
    margin: 10,
    fontSize: 18,
    backgroundColor: "#f1f1f1",
    borderColor: "#ddd",
    borderWidth: 0.5,
    borderRadius: 10,
  },
  inputAndroid: {
    color: "black",
  },
  placeholderColor: "white",
  underline: { borderTopWidth: 1 },
  icon: {
    position: "absolute",
    backgroundColor: "transparent",
    borderTopWidth: 55,
    borderTopColor: "#00000099",
    borderRightWidth: 5,
    borderRightColor: "transparent",
    borderLeftWidth: 5,
    borderLeftColor: "transparent",
    width: 0,
    height: 0,
    top: 20,
    right: 15,
  },
};

// this made me think about TypeScript
// and what it was created to solve😅
const stylePropsType = PropTypes.oneOfType([
  PropTypes.arrayOf(PropTypes.object),
  PropTypes.object,
]);

RNPickerComponent.propTypes = {
  inputStyle: stylePropsType,
  containerStyle: stylePropsType,
  ...RNPickerSelect.propTypes, //this makes the Input component have proptypes of RNPickerSelect
};
RNPickerComponent.defaultProps = {
  inputStyle: styles.input,
  containerStyle: styles.containerStyle,
  touched: false,
  error: null,
};

export default RNPickerComponent;
