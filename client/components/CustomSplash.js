import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions } from 'react-native';
import { Text } from '@ui-kitten/components';

const { width, height } = Dimensions.get('window');

export default function CustomSplash() {
  const logoScale = new Animated.Value(0);
  const textOpacity = new Animated.Value(0);

  useEffect(() => {
    const animate = async () => {
      // Start animations immediately
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 10,
          friction: 2,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ]).start();
    };
  
    animate();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, {
        transform: [{ scale: logoScale }]
      }]}>
        <Image 
          source={require('../assets/images/logoV2.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View style={{ opacity: textOpacity }}>
        <Text category='h1' style={styles.title}>AttendEase</Text>
        <Text category='s1' style={styles.subtitle}>Track your attendance seamlessly</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: '#1A2138',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
  },
  logo: {
    width: '80%',
    height: '80%',
    borderRadius: width * 0.2,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#8F9BB3',
    textAlign: 'center',
  }
});