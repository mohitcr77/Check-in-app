import React, { useState } from "react";
import {
  Keyboard,
  TouchableWithoutFeedback,
  View,
  Alert,
  StyleSheet,
  ScrollView
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../services/API";
import { Layout, Text, Input, Button, Spinner, Card, Icon } from "@ui-kitten/components";
import { checkIsEmpty } from "../../helpers/errorHelper";

const LoadingIndicator = (props) => (
  <View style={[props.style, styles.indicator]}>
    <Spinner size="small" />
  </View>
);

const KeyIcon = (props) => (
  <Icon {...props} name='hash-outline'/>
);

export default function JoinOrganizationScreen({ navigation }) {
  const [organizationCode, setOrganizationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateInput = () => {
    if (!organizationCode.trim()) {
      setError('Organization code is required');
      return false;
    }
    setError('');
    return true;
  };

  const handleJoinOrganization = async () => {
    try {
      if (!validateInput()) return;
      checkIsEmpty(organizationCode);
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const response = await axios.post(
        `${api}/organizations/join`,
        { orgCode: organizationCode.toLowerCase() },
        { headers: { Authorization: `${token}` } }
      );
      await AsyncStorage.removeItem("token");
      Alert.alert(
        'Success',
        'You have successfully joined the organization',
        [
          {
            text: 'Continue',
            onPress: () => navigation.replace("Login")
          }
        ]
      );
    } catch (error) {
      
      // console.log(error.response);

      Alert.alert(
        "Error joining organization",
        error.response?.data?.msg || "An error occurred"
      );
    }finally{
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Layout style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Text category="h4" style={styles.title}>
              Join Organization
            </Text>
            <Text category="s1" style={styles.subtitle}>
              Enter your organization code to get started
            </Text>
          </View>

          <Card style={styles.formCard}>
            <View style={styles.infoContainer}>
              <Icon
                name="info-outline"
                fill="#8F9BB3"
                style={styles.infoIcon}
              />
              <Text appearance="hint" style={styles.infoText}>
                Contact your organization admin to get the code
              </Text>
            </View>

            <Input
              label="Organization Code"
              placeholder="Enter your organization code"
              value={organizationCode}
              onChangeText={(text) => {
                setOrganizationCode(text);
                setError('');
              }}
              accessoryLeft={KeyIcon}
              status={error ? 'danger' : 'basic'}
              caption={error}
              style={styles.input}
              size="large"
              autoCapitalize="none"
            />

            <Button
              style={styles.joinButton}
              disabled={loading}
              accessoryLeft={loading ? LoadingIndicator : null}
              onPress={handleJoinOrganization}
              size="large"
            >
              {loading ? 'JOINING...' : 'JOIN ORGANIZATION'}
            </Button>
          </Card>
        </ScrollView>
      </Layout>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16
  },
  headerContainer: {
    marginVertical: 24,
    alignItems: 'center'
  },
  title: {
    color: '#fff',
    marginBottom: 8
  },
  subtitle: {
    color: '#8F9BB3',
    textAlign: 'center'
  },
  formCard: {
    backgroundColor: '#2a3457',
    borderRadius: 12,
    padding: 1
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2138',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20
  },
  infoIcon: {
    width: 24,
    height: 24,
    marginRight: 12
  },
  infoText: {
    flex: 1,
    color: '#8F9BB3',
    fontSize: 14
  },
  input: {
    marginBottom: 24
  },
  joinButton: {
    marginBottom: 16
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
