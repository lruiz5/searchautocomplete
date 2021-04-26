import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { CheckBox } from "react-native-elements";
import Input from "../components/Input";
import DateTimePicker from "@react-native-community/datetimepicker";
import RNPickerComponent from "../components/RNPickerComponent";
import { ProgressSteps, ProgressStep } from "react-native-progress-steps";
import Icon from "react-native-vector-icons/MaterialIcons";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import genderItems from "../identifiers/genderIdentity";
import ethnicityItems from "../identifiers/raceEthnicity";
import sexualOrientationItems from "../identifiers/sexualOrientation";

//forms, validation
import { Formik } from "formik";
import * as Yup from "yup";

//amplify
import Amplify from "@aws-amplify/core";
import config from "../../aws-exports";
import API, { graphqlOperation } from "@aws-amplify/api";

Amplify.configure(config);

const Submission = `
    mutation ($form_type: String! $latitude: Float! $longitude: Float! $location_name: String 
              $date: String! $description: String! $involved: String $action_required: String!
              $gender_identity: [String] $ethnicity: String $sexual_orientation: String
              $name: String! $email: String! $phone: String $contact_method: String 
              $confidential: Boolean! $status: String $verified: Boolean!){
      createSubmission(input: {
        form_type: $form_type
        latitude: $latitude
        longitude: $longitude
        location_name: $location_name
        date: $date
        description: $description
        involved: $involved
        action_required: $action_required
        gender_identity: $gender_identity
        ethnicity: $ethnicity
        sexual_orientation: $sexual_orientation
        name: $name
        email: $email
        phone: $phone
        contact_method: $contact_method
        confidential: $confidential
        status: $status
        verified: $verified
      }) {
        id
        form_type 
        latitude
        longitude
        location_name
        date
        description
        involved 
        action_required
        gender_identity
        ethnicity
        sexual_orientation
        name
        email 
        phone 
        contact_method 
        confidential 
        status 
        verified
      }
    }
    `;

const GoodSchema = [
  Yup.object().shape({
    description: Yup.string()
      .min(5, "Minimum character count not met")
      .max(240, "Max characters exceeded")
      .required("*Required"),
  }),
  Yup.object().shape({
    gender_identity: Yup.array().min(1, "Please select one or more values"),
    ethnicity: Yup.string().required("*Required"),
    sexual_orientation: Yup.string().required("*Required"),
  }),
  Yup.object().shape({
    name: Yup.string().required("*Required"),
    phone: Yup.string()
      .min(10, "Minimum length of 10")
      .max(10, "Maximum length of 10"),
    email: Yup.string().email("Invalid email").required("*Required"),
  }),
];

export default function PositiveForm({ route, navigation }) {
  const ref = useRef(null);
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [display, setDisplay] = useState("calendar");
  const [gendersSelected, setGendersSelected] = useState([]);
  const [activeStep, setActiveStep] = useState(0);

  const currentValidationSchema = GoodSchema[activeStep];
  const { locationName, locLatitude, locLongitude } = route.params;

  var state = {
    form_type: "positive",
    latitude: locLatitude,
    longitude: locLongitude,
    location_name: locationName,
    date: new Date().toLocaleDateString(),
    description: "",
    involved: "",
    gender_identity: gendersSelected,
    ethnicity: "",
    sexual_orientation: "",
    name: "",
    email: "",
    phone: "",
    action_required: "none",
    contact_method: "email",
    confidential: false,
    doNothing: true,
    contactMe: false,
    priorityContact: false,
    contactByPhone: false,
    contactByEmail: true,
    submissions: [],
  };

  const showDatepicker = () => {
    if (Platform.OS === "ios") {
      setDisplay("inline");
    }
    setShow(true);
  };

  function _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function _submitForm(values, actions) {
    await _sleep(1000);

    if (values.email === "" || values.description === "") return;
    const sub = {
      form_type: values.form_type,
      latitude: values.latitude,
      longitude: values.longitude,
      location_name: values.location_name,
      date: values.date,
      description: values.description,
      involved: values.involved,
      action_required: values.action_required,
      gender_identity: values.identifyAs,
      ethnicity: values.ethnicity,
      sexual_orientation: values.sexual_orientation,
      name: values.name,
      email: values.email,
      phone: values.phone,
      contact_method: values.contact_method,
      confidential: values.confidential,
      status: "pending",
      verified: false,
      verified_by: "pending",
      comments: "Add Comments",
    };

    try {
      const submissions = [...values.submissions, sub];
      (state.latitude = 0),
        (state.longitude = 0),
        (state.location_name = ""),
        (state.description = ""),
        (state.name = "");
      state.email = "";
      state.submissions = submissions;

      console.log("submission: ", submissions);
      await API.graphql(graphqlOperation(Submission, sub));
      console.log("success");
      Alert.alert(
        "Thank you for your response",
        "We will be contacting you through your preferred contact method within 1 to 5 business days.",
        [
          {
            text: "Ok",
            onPress: () => navigation.push("homeTabs"),
          },
        ],
        {
          cancelable: false,
        }
      );
    } catch (err) {
      console.log("error: ", err);
    }
  }

  function _handleSubmit(values, actions) {
    if (activeStep === 2) {
      _submitForm(values, actions);
    } else {
      setActiveStep(activeStep + 1);
    }
  }

  function _onPrevious() {
    setActiveStep(activeStep - 1);
  }

  return (
    <View style={styles.container}>
      <View style={{ backgroundColor: "green" }}>
        <View
          style={{
            alignSelf: "flex-end",
            borderColor: "black",
            backgroundColor: "white",
            borderWidth: 1,
            marginRight: 3,
            marginTop: 3,
            height: 30,
            width: 30,
            borderRadius: 50,
          }}
        >
          <Icon
            onPress={() => navigation.goBack()}
            name="close"
            icon="close"
            style={{
              alignSelf: "center",
              top: 4,
              fontSize: 20,
              fontWeight: "bold",
            }}
          ></Icon>
        </View>
        <Text style={styles.header}>Positive Story</Text>
        <Text style={styles.subHeader}>Share your story </Text>
      </View>
      <ScrollView>
        <Formik
          initialValues={state}
          validationSchema={currentValidationSchema}
          onSubmit={_handleSubmit}
        >
          {({
            setFieldValue,
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            touched,
            errors,
            error,
            isSubmitting,
          }) => {
            const onChange = (event, selectedDate) => {
              const currentDate = selectedDate || date;
              const currentDateStr = currentDate.toLocaleDateString();
              setShow(Platform.OS === "ios");
              setDate(currentDateStr);
              setFieldValue("date", currentDateStr);
              setShow(false);
            };

            const onSelectedGenderItemsChange = (selectedItems) => {
              setGendersSelected(selectedItems);
              setFieldValue("gender_identity", selectedItems);
            };

            return (
              <View style={{ flex: 1 }}>
                <View style={{ backgroundColor: "white" }}>
                  <View style={{ marginTop: 5 }}>
                    <ProgressSteps activeStep={activeStep}>
                      <ProgressStep label="Tell your story" removeBtnRow>
                        <View>
                          <Text style={styles.labelStyle}>Date</Text>
                          <TextInput
                            style={styles.inputStyle}
                            onFocus={showDatepicker}
                            value={values.date}
                          />
                          {show && (
                            <DateTimePicker
                              testID="dateTimePicker"
                              value={new Date(date)}
                              mode="date"
                              display={display}
                              minimumDate={new Date(2000, 0, 1)}
                              maximumDate={new Date(new Date())}
                              onChange={onChange}
                            />
                          )}

                          <Input
                            label="What Happened?"
                            style={styles.multilineInput}
                            onChangeText={handleChange("description")}
                            onBlur={handleBlur("description")}
                            value={values.description}
                            touched={touched.description}
                            error={errors.description}
                            multiline
                            numberOfLines={3}
                            maxLength={240}
                          />
                          <Input
                            label="Who made you feel welcomed? (ex. manager/staff,
                            customer, business owner, etc.)"
                            style={styles.inputStyle}
                            onChangeText={handleChange("involved")}
                            onBlur={handleBlur("involved")}
                            value={values.involved}
                            touched={touched.involved}
                            error={errors.involved}
                          />

                          <Text style={styles.labelStyle}>
                            How can we help?
                          </Text>
                          <Icon
                            name="info"
                            icon="info"
                            onPress={() => {
                              this.setState({
                                showModal: !this.state.showModal,
                              });
                            }}
                          />
                          <CheckBox
                            title="I just want to be heard."
                            containerStyle={styles.checkBoxStyle}
                            checked={values.doNothing}
                            onPress={() => {
                              setFieldValue("doNothing", true);
                              setFieldValue("contactMe", false);
                              setFieldValue("priorityContact", false);
                              setFieldValue("action_required", "none");
                            }}
                          />
                          <CheckBox
                            title="I'd like to talk this through a little bit more."
                            containerStyle={styles.checkBoxStyle}
                            checked={values.contactMe}
                            onPress={() => {
                              setFieldValue("contactMe", true);
                              setFieldValue("doNothing", false);
                              setFieldValue("priorityContact", false);
                              setFieldValue("action_required", "non-urgent");
                            }}
                          />
                          <CheckBox
                            title="I would like help pursuing further action."
                            containerStyle={styles.checkBoxStyle}
                            checked={values.priorityContact}
                            onPress={() => {
                              setFieldValue(
                                "priorityContact",
                                !values.priorityContact
                              );
                              setFieldValue("contactMe", false);
                              setFieldValue("doNothing", false);
                              setFieldValue("priorityContact", true);
                              setFieldValue("action_required", "urgent");
                            }}
                          />

                          <TouchableOpacity
                            activeOpacity={0.5}
                            onPress={() => {
                              Alert.alert(
                                "If you choose to have your story displayed your name/contact information will never be made public."
                              );
                            }}
                          >
                            <Text style={styles.privacyText}></Text>
                          </TouchableOpacity>
                          <View style={styles.buttonView}>
                            <TouchableOpacity
                              onPress={() => navigation.goBack()}
                              style={styles.cancelButtonBackground}
                            >
                              <Text
                                style={[
                                  styles.nextButtonText,
                                  {
                                    color: "#FFF",
                                  },
                                ]}
                              >
                                Cancel
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={handleSubmit}
                              style={styles.nextButtonBackground}
                            >
                              <Text style={styles.nextButtonText}>Next</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </ProgressStep>
                      <ProgressStep label="Personal Information" removeBtnRow>
                        <View>
                          <Text
                            style={[styles.labelStyle, styles.extraSpacing]}
                          >
                            How do you identify?
                          </Text>
                          <Text style={styles.errorInput}>
                            {touched.gender_identity && errors.gender_identity}
                          </Text>
                          <SectionedMultiSelect
                            ref={ref}
                            items={genderItems}
                            IconRenderer={Icon}
                            uniqueKey="id"
                            subKey="children"
                            selectText="Select an option..."
                            showDropDowns={false}
                            colors={{
                              primary: "#4caf50",
                            }}
                            onCancel={() => {
                              !values.gender_identity &&
                                ref &&
                                ref.current &&
                                ref.current._removeAllItems();
                            }}
                            expandDropDowns
                            hideSearch
                            showCancelButton
                            modalWithSafeAreaView
                            showRemoveAll
                            readOnlyHeadings={true}
                            onSelectedItemsChange={onSelectedGenderItemsChange}
                            selectedItems={values.gender_identity}
                          />

                          <Text style={styles.labelStyle}>
                            What is your Race/Ethnicity?
                          </Text>
                          <RNPickerComponent
                            touched={touched.ethnicity}
                            error={errors.ethnicity}
                            value={values.ethnicity}
                            onValueChange={handleChange("ethnicity")}
                            placeholder={{
                              label: "Select an option",
                              value: "",
                            }}
                            items={[
                              ...ethnicityItems,
                              {
                                label: "Decline to state",
                                value: "decline-to-state",
                              },
                            ]}
                          />

                          <Text style={styles.labelStyle}>
                            What is your Sexual Orientation?
                          </Text>
                          <RNPickerComponent
                            touched={touched.sexual_orientation}
                            error={errors.sexual_orientation}
                            value={values.sexual_orientation}
                            onValueChange={handleChange("sexual_orientation")}
                            placeholder={{
                              label: "Select an option",
                              value: "",
                            }}
                            items={[
                              ...sexualOrientationItems,
                              {
                                label: "Decline to state",
                                value: "decline-to-state",
                              },
                            ]}
                          />
                          <View style={styles.buttonView}>
                            <TouchableOpacity
                              onPress={_onPrevious}
                              style={styles.nextButtonBackground}
                            >
                              <Text style={styles.nextButtonText}>
                                Previous
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={handleSubmit}
                              style={styles.nextButtonBackground}
                            >
                              <Text style={styles.nextButtonText}>Next</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </ProgressStep>
                      <ProgressStep label="Contact Information" removeBtnRow>
                        <View>
                          <Input
                            label="Name"
                            style={styles.inputStyle}
                            onChangeText={handleChange("name")}
                            onBlur={handleBlur("name")}
                            value={values.name}
                            touched={touched.name}
                            error={errors.name}
                          />

                          <Input
                            label="Email Address"
                            style={styles.inputStyle}
                            keyboardType={"email-address"}
                            onChangeText={handleChange("email")}
                            onBlur={handleBlur("email")}
                            value={values.email}
                            touched={touched.email}
                            error={errors.email}
                          />

                          <Input
                            label="Phone Number"
                            style={styles.inputStyle}
                            keyboardType={"numeric"}
                            onChangeText={handleChange("phone")}
                            onBlur={handleBlur("phone")}
                            value={values.phone}
                            touched={touched.phone}
                            error={errors.phone}
                          />
                          <Text style={styles.labelStyle}>
                            Preferred Contact Method:{" "}
                          </Text>
                          <CheckBox
                            title="Phone"
                            containerStyle={styles.checkBoxStyle}
                            checked={values.contactByPhone}
                            onPress={() => {
                              setFieldValue(
                                "contactByPhone",
                                !values.contactByPhone
                              );
                              setFieldValue(
                                "contactByEmail",
                                values.contactByPhone
                              );
                              setFieldValue("contact_method", "phone");
                            }}
                          />
                          <CheckBox
                            title="E-mail"
                            containerStyle={styles.checkBoxStyle}
                            checked={values.contactByEmail}
                            onPress={() => {
                              setFieldValue(
                                "contactByEmail",
                                !values.contactByEmail
                              );
                              setFieldValue(
                                "contactByPhone",
                                values.contactByEmail
                              );
                              setFieldValue("contact_method", "email");
                            }}
                          />

                          <Text>{"\n"}</Text>
                          <CheckBox
                            title="I don't want my story displayed on the map"
                            checked={values.confidential}
                            onPress={() =>
                              setFieldValue(
                                "confidential",
                                !values.confidential
                              )
                            }
                          />
                          <TouchableOpacity
                            activeOpacity={0.5}
                            onPress={() => {
                              Alert.alert(
                                "If you choose to have your story displayed your name/contact information will never be made public."
                              );
                            }}
                          >
                            <Text style={styles.privacyText}>
                              What does this mean?
                            </Text>
                          </TouchableOpacity>
                          <View style={styles.buttonView}>
                            <TouchableOpacity
                              onPress={_onPrevious}
                              style={styles.nextButtonBackground}
                            >
                              <Text style={styles.nextButtonText}>
                                Previous
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={handleSubmit}
                              style={styles.nextButtonBackground}
                            >
                              <Text style={styles.nextButtonText}>Submit</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </ProgressStep>
                    </ProgressSteps>
                  </View>
                </View>
              </View>
            );
          }}
        </Formik>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonView: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-around",
  },
  cancelButtonBackground: {
    borderRadius: 5,
    padding: 4,
    marginTop: 10,
    marginBottom: 15,
    marginRight: 15,
    backgroundColor: "red",
  },
  container: {
    flex: 1,
    backgroundColor: "#f3f3f3",
    padding: 5,
    paddingTop: 5,
  },
  checkBoxStyle: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  errorInput: {
    textAlign: "right",
    marginRight: 15,
    marginTop: 2,
    marginBottom: -10,
    color: "red",
    fontWeight: "bold",
    fontSize: 13,
  },
  extraSpacing: { marginTop: 15, marginBottom: 0 },
  header: {
    fontSize: 28,
    textAlign: "center",
    marginVertical: 5,
    color: "white",
  },
  subHeader: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 15,
  },
  labelStyle: {
    fontWeight: "bold",
    marginTop: 10,
    marginLeft: 15,
    marginBottom: 0,
    marginTop: 10,
  },
  inputStyle: {
    height: 40,
    textAlign: "auto",
    width: "95%",
    marginHorizontal: 10,
    marginVertical: -1,
    fontSize: 18,
    backgroundColor: "#f1f1f1",
    borderColor: "#ddd",
    borderWidth: 0.5,
    borderRadius: 10,
  },
  multilineInput: {
    height: 140,
    textAlign: "auto",
    width: "95%",
    marginHorizontal: 10,
    marginVertical: -5,
    fontSize: 18,
    backgroundColor: "#f1f1f1",
    borderColor: "#ddd",
    borderWidth: 0.5,
    borderRadius: 7,
  },
  conditionText: {
    fontSize: 12,
    marginVertical: 10,
    marginBottom: 0,
    textAlign: "center",
  },
  nextButtonBackground: {
    borderRadius: 5,
    padding: 4,
    marginTop: 10,
    marginBottom: 15,
    marginRight: 15,
    backgroundColor: "lightgreen",
  },
  nextButtonText: {
    alignSelf: "flex-end",
    padding: 3,
    fontSize: 25,
  },
  privacyText: {
    color: "rgb(51,130,246)",
    textAlign: "center",
  },
});
