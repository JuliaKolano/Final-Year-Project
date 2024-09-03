import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {signIn} from 'aws-amplify/auth';
import {Snackbar} from 'react-native-paper';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    try {
      const {nextStep} = await signIn({
        username: email,
        password,
      });
      switch (nextStep.signInStep) {
        case 'CONFIRM_SIGN_UP':
          navigation.navigate('ConfirmEmail', {email: email});
          break;
        case 'DONE':
          {
            nextStep && navigation.navigate('Home');
          }
          break;
      }
    } catch (error) {
      setErrorMessage(error.message);
      setErrorVisible(true);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Log In</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          accessibilityLabel="Email Input"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          accessibilityLabel="Password Input"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleForgotPassword}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Forgot your password? Click here to reset it">
          <Text style={styles.forgotPasswordMessage}>
            Forgot your password? Click here to reset it
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <Snackbar
        visible={errorVisible}
        onDismiss={() => setErrorVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setErrorVisible(false),
        }}
        accessibilityRole="alert"
        accessibilityState={{busy: errorVisible}}
        accessibilityLabel="Error Message"
        accessibilityHint="Press or wait to dismiss">
        {errorMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  button: {
    backgroundColor: 'purple',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  forgotPasswordMessage: {
    marginTop: 20,
    fontSize: 14,
  },
  forgotPasswordLink: {
    paddingLeft: 5,
    paddingRight: 5,
    color: 'purple',
    textDecorationLine: 'underline',
  },
  errorMessage: {
    marginTop: 20,
    fontSize: 14,
    color: 'red',
  },
});
export default LoginPage;
