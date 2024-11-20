import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { Layout, Text, Button } from '@ui-kitten/components';

const { width } = Dimensions.get('window');

const RoleCard = ({ image, title, description, onPress }) => {
  return (
    <View style={styles.roleCard}>
      <View style={styles.imageContainer}>
        <Image 
          source={image} 
          style={styles.roleImage} 
          resizeMode="contain"
        />
      </View>
      <View style={styles.roleTextContainer}>
        <Text style={styles.roleTitle}>{title}</Text>
        <Text style={styles.roleDescription} appearance="hint">
          {description}
        </Text>
        <Button 
          style={styles.selectButton} 
          size="small" 
          onPress={onPress}
        >
          Select Role
        </Button>
      </View>
    </View>
  );
};

const UserTypeScreen = ({ navigation }) => {
  return (
    <Layout style={styles.container}>
      <Text status='primary' style={styles.screenTitle}>Select Your Role</Text>
      
      <View style={styles.rolesContainer}>
        <RoleCard 
          image={require('../assets/images/adminRole.png')}
          title="Admin"
          description="Manage your business or organization"
          onPress={() => navigation.navigate('Register', { role: 'admin' })}
        />
        <RoleCard 
          image={require('../assets/images/employeeRole.png')}
          title="User"
          description="For people working under an organization"
          onPress={() => navigation.navigate('Register', { role: 'employee' })}
        />
      </View>

      <Button 
        appearance="ghost" 
        onPress={() => navigation.navigate('Login')}
      >
        Already have an account? Login
      </Button>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  rolesContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 30,
    // flex:0.3
  },
  roleCard: {
    backgroundColor: '#2a3457', 
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 10
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  roleImage: {
    width: 70,
    height: 70,
  },
  roleTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  roleDescription: {
    marginBottom: 10,
    color: '#cccccc',
    flexWrap: 'wrap',
  },
  selectButton: {
    alignSelf: 'flex-start',
  },
});

export default UserTypeScreen;