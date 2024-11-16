import {
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
  View,
} from "react-native";
import React, { useState } from "react";
import { api } from "../../services/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Layout, Text, Input, Button, Spinner } from "@ui-kitten/components";
import { checkIsEmpty } from "../../helpers/errorHelper";

const LoadingIndicator = (props) => (
  <View style={[props.style, styles.indicator]}>
    <Spinner size="small" />
  </View>
);

const CreateOrganizationScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateOrganization = async () => {
    try {
      setLoading(true);
      checkIsEmpty(name, "name");
      checkIsEmpty(code, "code");
      checkIsEmpty(address, "address");
      const token = await AsyncStorage.getItem("token");

      const response = await axios.post(
        `${api}/organizations/register`,
        { name, code, address },
        { headers: { Authorization: `${token}` } }
      );

      setLoading(false);
      Alert.alert("Organization created successfully");
      navigation.navigate("CreateOfficeLocation");
    } catch (error) {
      setLoading(false);
      console.log(error.response.data);
      Alert.alert(
        "Error creating organization",
        error.response?.data?.message || "An error occurred"
      );
    }
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Layout style={styles.container}>
        <Text style={styles.title} status="primary">Enter your organization details</Text>
        <Text style={styles.text} appearance="hint">
          Hint : Your employees can join your organization using Organization Code.
        </Text>
        <Input
          size="large"
          style={styles.input}
          placeholder="Organization Name"
          value={name}
          onChangeText={setName}
        />
        <Input
          size="large"
          style={styles.input}
          placeholder="Set Organization Code"
          value={code}
          onChangeText={setCode}
        />
        <Input
          size="large"
          style={styles.input}
          placeholder="Organization Address"
          value={address}
          onChangeText={setAddress}
        />
        <Button
        disabled={loading}
          accessoryLeft={loading && LoadingIndicator}
          status="primary"
          appearance="outline"
          onPress={handleCreateOrganization}
        >
          {loading ? "" : "Create Organization"}
        </Button>
      </Layout>
    </TouchableWithoutFeedback>
  );
};

export default CreateOrganizationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  text: {
    margin: 2,
    padding: 10,
    alignSelf: "center",
    letterSpacing: 2,
    textAlign: 'center'
  },
  title: {
    fontSize: 25,
    marginBottom: 20,
    textAlign: "center",
  },
});
