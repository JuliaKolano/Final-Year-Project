import React from 'react';
import {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, View, Image} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {fetchUserAttributes} from 'aws-amplify/auth';
import {Hub} from 'aws-amplify/utils';

import Logo from '../assets/Logo_round.png';
import CreateAccountPage from '../pages/CreateAccountPage';
import LoginPage from '../pages/LoginPage';
import ConfirmEmailPage from '../pages/ConfirmEmailPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import HomePage from '../pages/HomePage';
import ProfilePage from '../pages/ProfilePage';
import EditProfilePage from '../pages/EditProfilePage';
import ChatPage from '../pages/ChatPage';
import MessagesPage from '../pages/MessagesPage';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    isUserLoggedIn();
  }, []);

  useEffect(() => {
    const listener = data => {
      if (
        data.payload.event === 'signedIn' ||
        data.payload.event === 'signedOut'
      ) {
        isUserLoggedIn();
      }
    };

    Hub.listen('auth', listener);
    return () => Hub.remove('auth', listener);
  }, []);

  const isUserLoggedIn = async () => {
    try {
      const userAttributes = await fetchUserAttributes();
      setUser(userAttributes);
    } catch (error) {
      setUser(null);
    }
  };

  if (user === undefined) {
    return (
      <View style={styles.splashScreen}>
        <Image source={Logo} style={styles.logo}></Image>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomePage} />
            <Stack.Screen name="Profile" component={ProfilePage} />
            <Stack.Screen name="EditProfile" component={EditProfilePage} />
            <Stack.Screen name="Chat" component={ChatPage} />
            <Stack.Screen name="Messages" component={MessagesPage} />
          </>
        ) : (
          <>
            <Stack.Screen name="CreateAccount" component={CreateAccountPage} />
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="ConfirmEmail" component={ConfirmEmailPage} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordPage}
            />
            <Stack.Screen name="ResetPassword" component={ResetPasswordPage} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
});

export default Navigation;
