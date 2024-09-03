import React, {useState} from 'react';
import {SelectList} from 'react-native-dropdown-select-list';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {signUp} from 'aws-amplify/auth';
import {Snackbar} from 'react-native-paper';

const CreateAccountPage = () => {
  const [occupation, setOccupation] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const navigation = useNavigation();
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const occupations = [
    {key: '1', value: 'Musician'},
    {key: '2', value: 'Promoter'},
    {key: '3', value: 'Event Manager'},
  ];

  const handleCreateAccount = async () => {
    if (occupation === '') {
      setErrorMessage('Please select the occupation');
      setErrorVisible(true);
    } else if (password != repeatPassword) {
      setErrorMessage("The passwords don't match");
      setErrorVisible(true);
    } else {
      try {
        const {nextStep} = await signUp({
          username: email,
          password,
          options: {
            userAttributes: {
              email,
              name,
              nickname: occupation,
            },
          },
        });
        switch (nextStep.signUpStep) {
          case 'CONFIRM_SIGN_UP':
            navigation.navigate('ConfirmEmail', {email: email});
            break;
        }
      } catch (error) {
        setErrorMessage(error.message);
        setErrorVisible(true);
      }
    }
  };

  const handleSignInRequest = () => {
    setOccupation('');
    setName('');
    setEmail('');
    setPassword('');
    setRepeatPassword('');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create Account</Text>

        <View
          style={styles.occupationInput}
          accessibilityRole="spinbutton"
          accessibilityLabel="Occupation"
          accessibilityState={{
            selected: occupation != '',
          }}>
          <SelectList
            style={styles.input}
            placeholder="Occupation"
            setSelected={val => setOccupation(val)}
            data={occupations}
            save="value"
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          accessibilityLabel="Name Input"
        />

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

        <TextInput
          style={styles.input}
          placeholder="Repeat Password"
          secureTextEntry
          value={repeatPassword}
          onChangeText={setRepeatPassword}
          accessibilityLabel="Repeat Password Input"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateAccount}
          accessible={true}
          accessibilityLabel="Create Account"
          accessibilityRole="button">
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignInRequest}
          accessible={true}
          accessibilityLabel="Already have an Account? Sign In"
          accessibilityRole="button">
          <Text style={styles.signInMessage}>
            Already have an account? Sign In
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 70,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  label: {
    marginTop: -10,
    fontSize: 14,
    width: '80%',
    alignSelf: 'flex-start',
    paddingLeft: '10%',
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
  occupationInput: {
    width: '80%',
    marginBottom: 20,
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
  signInMessage: {
    marginTop: 20,
    fontSize: 14,
  },
  errorMessage: {
    marginTop: 20,
    fontSize: 14,
    color: 'red',
  },
});
export default CreateAccountPage;
