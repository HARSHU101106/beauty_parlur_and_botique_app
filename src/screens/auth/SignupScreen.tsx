import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { StackScreenProps } from '@react-navigation/stack';
import { auth, db } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';
import { COLORS, SHADOWS } from '../../constants';
import GradientHeader from '../../components/GradientHeader';
import GradientButton from '../../components/GradientButton';
import { AuthStackParamList } from '../../navigation/types';

type Props = StackScreenProps<AuthStackParamList, 'Signup'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{10}$/;

export default function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const { isLoading, error, setLoading, setError, setUser, setFirebaseUser } =
    useAuthStore();

  const validate = (): string | null => {
    if (!name.trim()) return 'Please enter your name';
    if (!EMAIL_RE.test(email.trim())) return 'Please enter a valid email';
    if (!PHONE_RE.test(phone.trim())) return 'Phone number must be 10 digits';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password !== confirm) return 'Passwords do not match';
    return null;
  };

  const onSignup = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const userDoc = {
        uid: cred.user.uid,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: 'customer' as const,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), userDoc);
      setFirebaseUser(cred.user);
      setSuccess('Account created successfully!');
      // Setting user in store triggers RootNavigator to swap to CustomerNavigator.
      setUser(userDoc as any);
    } catch (e: any) {
      setError(e?.message ?? 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
      style={{ backgroundColor: COLORS.surface }}
      keyboardShouldPersistTaps="handled"
    >
      <GradientHeader colors="lavender" style={{ paddingTop: 56, paddingBottom: 40 }}>
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
            <Text style={{ fontSize: 36 }}>🌸</Text>
          </View>
          <Text variant="headlineMedium" style={{ color: '#fff', fontWeight: 'bold' }}>
            Create Account
          </Text>
          <Text style={{ color: '#F1E9FF', marginTop: 4 }}>
            Join the Glamour family
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
          label="Full Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          className="mb-3"
          activeOutlineColor={COLORS.primary}
        />
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          autoCapitalize="none"
          keyboardType="email-address"
          className="mb-3"
          activeOutlineColor={COLORS.primary}
        />
        <TextInput
          label="Phone (10 digits)"
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
          mode="outlined"
          keyboardType="number-pad"
          maxLength={10}
          className="mb-3"
          activeOutlineColor={COLORS.primary}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry={!showPwd}
          right={
            <TextInput.Icon
              icon={showPwd ? 'eye-off' : 'eye'}
              onPress={() => setShowPwd((s) => !s)}
            />
          }
          className="mb-3"
          activeOutlineColor={COLORS.primary}
        />
        <TextInput
          label="Confirm Password"
          value={confirm}
          onChangeText={setConfirm}
          mode="outlined"
          secureTextEntry={!showConfirm}
          right={
            <TextInput.Icon
              icon={showConfirm ? 'eye-off' : 'eye'}
              onPress={() => setShowConfirm((s) => !s)}
            />
          }
          className="mb-5"
          activeOutlineColor={COLORS.primary}
        />

        <GradientButton
          label={isLoading ? 'Creating account...' : 'Sign Up'}
          icon="person-add-outline"
          colors="lavender"
          onPress={onSignup}
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

        <View className="flex-row justify-center mt-7">
          <Text style={{ color: COLORS.textMuted }}>Already have an account? </Text>
          <Text
            onPress={() => navigation.navigate('Login')}
            style={{ color: COLORS.primary, fontWeight: 'bold' }}
          >
            Login
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
