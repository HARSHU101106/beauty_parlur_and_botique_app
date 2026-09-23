import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { StackScreenProps } from '@react-navigation/stack';
import { auth, db } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';
import { COLORS, SHADOWS } from '../../constants';
import GradientHeader from '../../components/GradientHeader';
import GradientButton from '../../components/GradientButton';
import { User as AppUser } from '../../types';
import { AuthStackParamList } from '../../navigation/types';

WebBrowser.maybeCompleteAuthSession();

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, error, setLoading, setError, setUser, setFirebaseUser } =
    useAuthStore();

  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: extra.googleWebClientId,
    androidClientId: extra.googleAndroidClientId,
    iosClientId: extra.googleIosClientId,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      const credential = GoogleAuthProvider.credential(idToken);
      handleFirebaseAuth(() => signInWithCredential(auth, credential));
    }
  }, [response]);

  const handleFirebaseAuth = async (signInFn: () => Promise<any>) => {
    try {
      setLoading(true);
      setError(null);
      const cred = await signInFn();
      setFirebaseUser(cred.user);
      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      if (!snap.exists()) {
        setError('User profile not found. Please sign up.');
        return;
      }
      const userData = { uid: cred.user.uid, ...snap.data() } as AppUser;
      // Setting user in store triggers RootNavigator to swap to the correct stack.
      setUser(userData);
    } catch (e: any) {
      setError(e?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const onLoginPress = () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    handleFirebaseAuth(() => signInWithEmailAndPassword(auth, email.trim(), password));
  };

  return (
    <ScrollView
      style={{ backgroundColor: COLORS.surface }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <GradientHeader colors="primary" style={{ paddingTop: 56, paddingBottom: 40 }}>
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
            <Text style={{ fontSize: 36 }}>💖</Text>
          </View>
          <Text variant="headlineMedium" style={{ color: '#fff', fontWeight: 'bold' }}>
            Welcome Back
          </Text>
          <Text style={{ color: '#FFE3EF', marginTop: 4 }}>
            Login to your Glamour account
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
          className="mb-4"
          activeOutlineColor={COLORS.primary}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword((s) => !s)}
            />
          }
          className="mb-2"
          activeOutlineColor={COLORS.primary}
        />

        <Button
          mode="text"
          textColor={COLORS.primary}
          onPress={() => navigation.navigate('ForgotPassword')}
          className="self-end"
        >
          Forgot Password?
        </Button>

        <GradientButton
          label={isLoading ? 'Logging in...' : 'Login'}
          icon="log-in-outline"
          onPress={onLoginPress}
          loading={isLoading}
          style={{ marginTop: 8 }}
        />

        {!!error && (
          <Text className="mt-3 text-center" style={{ color: COLORS.error }}>
            {error}
          </Text>
        )}

        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px" style={{ backgroundColor: COLORS.border }} />
          <Text className="mx-3" style={{ color: COLORS.textMuted }}>OR</Text>
          <View className="flex-1 h-px" style={{ backgroundColor: COLORS.border }} />
        </View>

        <Button
          mode="outlined"
          icon="google"
          onPress={() => promptAsync()}
          disabled={!request || isLoading}
          textColor={COLORS.primary}
          style={{ borderColor: COLORS.primary, borderRadius: 999 }}
          contentStyle={{ paddingVertical: 4 }}
        >
          Login with Google
        </Button>

        <View className="flex-row justify-center mt-7">
          <Text style={{ color: COLORS.textMuted }}>Don't have an account? </Text>
          <Text
            onPress={() => navigation.navigate('Signup')}
            style={{ color: COLORS.primary, fontWeight: 'bold' }}
          >
            Sign up
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
