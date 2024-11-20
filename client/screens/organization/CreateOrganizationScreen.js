import {
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
  View,
  ScrollView
} from "react-native";
import React, { useState } from "react";
import { 
  Layout, 
  Text, 
  Input, 
  Button, 
  Spinner, 
  Card,
  Icon 
} from "@ui-kitten/components";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { api } from "../../services/API";
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
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    let tempErrors = {};
    if (!name.trim()) tempErrors.name = "Organization name is required";
    if (!code.trim()) tempErrors.code = "Organization code is required";
    if (!address.trim()) tempErrors.address = "Address is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };


  const handleCreateOrganization = async () => {
    try {
      if (!validateInputs()) return;
      setLoading(true);
      // checkIsEmpty(name.trim(), "name");
      // checkIsEmpty(code.trim(), "code");
      // checkIsEmpty(address.trim(), "address");
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
      // console.log(error.response.data);
      Alert.alert(
        "Error creating organization",
        error.response?.data?.msg|| "An error occurred"
      );
    }
  };

  const renderIcon = (props) => (
    <Icon {...props} name='home-outline'/> 
  );
  
  const renderCodeIcon = (props) => (
    <Icon {...props} name='keypad-outline'/> 
  );
  
  const renderLocationIcon = (props) => (
    <Icon {...props} name='navigation-2-outline'/> 
  );
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Layout style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerContainer}>
            <Text category="h4" style={styles.title}>
              Create Organization
            </Text>
            <Text appearance="hint" style={styles.subtitle}>
              Set up your organization details
            </Text>
          </View>

          <Card style={styles.formCard}>
            <Input
              label="Organization Name"
              placeholder="Enter organization name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors({ ...errors, name: null });
              }}
              status={errors.name ? "danger" : "basic"}
              caption={errors.name}
              accessoryLeft={renderIcon}
              style={styles.input}
              size="large"
            />

            <Input
              label="Organization Code"
              placeholder="Create a unique code"
              value={code}
              onChangeText={(text) => {
                setCode(text);
                setErrors({ ...errors, code: null });
              }}
              status={errors.code ? "danger" : "basic"}
              caption={
                errors.code
                  ? errors.code
                  : "Employees will use this code to join"
              }
              accessoryLeft={renderCodeIcon}
              style={styles.input}
              size="large"
            />

            <Input
              label="Address"
              placeholder="Enter organization address"
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                setErrors({ ...errors, address: null });
              }}
              status={errors.address ? "danger" : "basic"}
              caption={errors.address}
              accessoryLeft={renderLocationIcon}
              style={styles.input}
              size="large"
              multiline
              textStyle={{ minHeight: 64 }}
            />

            <Button
              style={styles.createButton}
              disabled={loading}
              accessoryLeft={loading ? LoadingIndicator : null}
              onPress={handleCreateOrganization}
              size="large"
            >
              {loading ? "CREATING..." : "CREATE ORGANIZATION"}
            </Button>
          </Card>
        </ScrollView>
      </Layout>
    </TouchableWithoutFeedback>
  );
};

export default CreateOrganizationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginVertical: 24,
    alignItems: "center",
  },
  scrollContent: { 
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: '100%'
  },
  title: {
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    color: "#8F9BB3",
    textAlign: "center",
  },
  formCard: {
    backgroundColor: '#2a3457', 
    borderRadius: 12,
    padding: 10,
  },
  input: {
    marginBottom: 16,
  },
  createButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  indicator: {
    justifyContent: "center",
    alignItems: "center",
  },
});
