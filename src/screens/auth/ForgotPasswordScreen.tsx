import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { sendPasswordResetEmail } from 'firebase/auth';
import { StackScreenProps } from '@react-navigation/stack';
import { auth } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';
import { COLORS, SHADOWS } from '../../constants';
import GradientHeader from '../../components/GradientHeader';
import GradientButton from '../../components/GradientButton';
import { AuthStackParamList } from '../../navigation/types';

type Props = StackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const { isLoading, error, setLoading, setError } = useAuthStore();

  const onSubmit = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess('Check your email for reset link');
    } catch (e: any) {
      setError(e?.message ?? 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      style={{ backgroundColor: COLORS.surface }}
      keyboardShouldPersistTaps="handled"
    >
      <GradientHeader colors="sunset" style={{ paddingTop: 56, paddingBottom: 40 }}>
        <View className="items-center">
          <View
            style={{
              width: 76,
              height: 76,
              borderRadius: 38,
              backgroundColor: 'rgba(255,255,255,0.22)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 36 }}>🔑</Text>
          </View>
          <Text variant="headlineMedium" style={{ color: '#fff', fontWeight: 'bold' }}>
            Forgot Password
          </Text>
          <Text style={{ color: '#FFE9E3', marginTop: 4, textAlign: 'center' }}>
            Enter your email to receive a reset link
          </Text>
        </View>
      </GradientHeader>

      <View
        className="px-6 pt-7 pb-8"
        style={[
          {
            backgroundColor: COLORS.card,
            marginHorizontal: 16,
            marginTop: -24,
            borderRadius: 24,
          },
          SHADOWS.md,
        ]}
      >
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          autoCapitalize="none"
          keyboardType="email-address"
          className="mb-5"
          activeOutlineColor={COLORS.primary}
        />

        <GradientButton
          label={isLoading ? 'Sending...' : 'Send Reset Link'}
          icon="mail-outline"
          colors="sunset"
          onPress={onSubmit}
          loading={isLoading}
        />

        {!!error && (
          <Text className="mt-3 text-center" style={{ color: COLORS.error }}>
            {error}
          </Text>
        )}
        {!!success && (
          <Text className="mt-3 text-center" style={{ color: COLORS.success }}>
            {success}
          </Text>
        )}

        <Button
          mode="text"
          textColor={COLORS.primary}
          onPress={() => navigation.navigate('Login')}
          className="mt-6"
        >
          Back to Login
        </Button>
      </View>
    </ScrollView>
  );
}
