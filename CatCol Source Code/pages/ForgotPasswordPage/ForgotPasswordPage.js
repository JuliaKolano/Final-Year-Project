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
import {resetPassword} from 'aws-amplify/auth';
import {Snackbar} from 'react-native-paper';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigation = useNavigation();

  const handleResetPassword = async () => {
    try {
      const {nextStep} = await resetPassword({username: email});
      switch (nextStep.resetPasswordStep) {
        case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
          navigation.navigate('ResetPassword', {email: email});
          break;
        case 'DONE':
          navigation.navigate('Login');
          break;
      }
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
        <Text style={styles.title}>Reset Your Password</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Your Email"
          value={email}
          onChangeText={setEmail}
          accessibilityLabel="Enter you Email"
        />

        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text
            style={styles.buttonText}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Send Code">
            Send Code
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
  errorMessage: {
    marginTop: 20,
    fontSize: 14,
    color: 'red',
  },
});
export default ForgotPasswordPage;
