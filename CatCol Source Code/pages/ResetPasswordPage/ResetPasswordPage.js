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
import {confirmResetPassword} from 'aws-amplify/auth';
import {Snackbar} from 'react-native-paper';

const ResetPasswordPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {email} = route.params;
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleResetPassword = async () => {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
      navigation.navigate('Login');
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
          placeholder="Enter Your Password Reset Code"
          value={code}
          onChangeText={setCode}
          accessibilityLabel="Enter your password reset code"
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Your New Password"
          value={newPassword}
          secureTextEntry
          onChangeText={setNewPassword}
          accessibilityLabel="Enter your new password"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleResetPassword}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Submit">
          <Text style={styles.buttonText}>Submit</Text>
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
export default ResetPasswordPage;
