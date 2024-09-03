import React, {useEffect} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {PaperProvider} from 'react-native-paper';
import Navigation from './src/navigation';
import {Amplify} from 'aws-amplify';
import {generateClient} from 'aws-amplify/api';
import {Hub} from 'aws-amplify/utils';
import {fetchUserAttributes} from 'aws-amplify/auth';
import {createUser} from './src/graphql/mutations';
import config from './src/aws-exports';

Amplify.configure(config, {});

function App() {
  const client = generateClient();

  // set up the listener for the SignIn() function
  useEffect(() => {
    const removeListener = Hub.listen('auth', async data => {
      if (data.payload.event === 'signedIn') {
        try {
          // add a user to the database when they log in
          const userAttributes = await fetchUserAttributes();
          const user = {
            id: userAttributes.sub,
            occupation: userAttributes.nickname,
            name: userAttributes.name,
            email: userAttributes.email,
          };
          await client.graphql({
            query: createUser,
            variables: {
              input: user,
            },
          });
          // will return an error if the user already exists, which is to be expected
        } catch {}
      }
    });
    return () => {
      removeListener();
    };
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <PaperProvider>
        <Navigation />
      </PaperProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
