import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS } from '../constants';

export default function SplashScreen() {
  return (
    <LinearGradient
      colors={GRADIENTS.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: 'rgba(255,255,255,0.22)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 44 }}>💖</Text>
      </View>
      <Text variant="displaySmall" style={{ color: '#fff', fontWeight: 'bold' }}>
        Glamour
      </Text>
      <Text style={{ color: '#FFE3EF', marginTop: 4, fontSize: 15 }}>
        Beauty & Boutique
      </Text>
      <ActivityIndicator style={{ marginTop: 28 }} size="large" color="#fff" />
    </LinearGradient>
  );
}
