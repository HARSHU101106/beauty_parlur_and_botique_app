import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import CustomerTabs from './CustomerTabs';
import AdminDrawer from './AdminDrawer';
import SplashScreen from '../components/SplashScreen';
import { RootStackParamList } from './types';
import { User as AppUser } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, setUser, setFirebaseUser, reset } = useAuthStore();
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (!fbUser) {
          reset();
          return;
        }
        setFirebaseUser(fbUser);
        const snap = await getDoc(doc(db, 'users', fbUser.uid));
        if (snap.exists()) {
          setUser({ uid: fbUser.uid, ...snap.data() } as AppUser);
        } else {
          setUser(null);
        }
      } finally {
        setBootstrapping(false);
      }
    });
    return unsub;
  }, []);

  if (bootstrapping) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user.role === 'admin' ? (
          <Stack.Screen name="AdminDrawer" component={AdminDrawer} />
        ) : (
          <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
