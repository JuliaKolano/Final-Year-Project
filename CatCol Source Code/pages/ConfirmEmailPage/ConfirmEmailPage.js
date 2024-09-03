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
import {useRoute} from '@react-navigation/native';
import {confirmSignUp} from 'aws-amplify/auth';
import {resendSignUpCode} from 'aws-amplify/auth';
import {Snackbar} from 'react-native-paper';

const ConfirmEmailPage = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {email} = route.params;
  const [code, setCode] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleConfirmEmail = async () => {
    try {
      const {nextStep} = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      switch (nextStep.signUpStep) {
        case 'DONE':
          navigation.navigate('Login');
          break;
        case 'COMPLETE_AUTO_SIGN_IN':
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

  const handleResendCode = async () => {
    try {
      await resendSignUpCode({username: email});
      setErrorMessage('Verification code resent');
      setErrorVisible(true);
    } catch (error) {
      setErrorMessage(error.message);
      setErrorVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Confirm Your Email</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Your Confirmation Code"
          value={code}
          onChangeText={setCode}
          accessibilityLabel="Enter Your Confirmation Code"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleConfirmEmail}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Confirm Email">
          <Text style={styles.buttonText}>Confirm Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResendCode}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Resend Code">
          <Text style={styles.resendCodeMessage}>Resend Code</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 70,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 45,
    borderColor: '#AEAEAE',
    borderWidth: 1.5,
    borderRadius: 10,
    marginBottom: 20,
    padding: 10,
    paddingLeft: 20,
  },
  button: {
    width: '80%',
    backgroundColor: 'purple',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  resendCodeMessage: {
    marginTop: 20,
    fontSize: 14,
  },
  errorMessage: {
    marginTop: 20,
    fontSize: 14,
    color: 'red',
  },
});
export default ConfirmEmailPage;
