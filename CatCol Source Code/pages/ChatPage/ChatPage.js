import React, {useEffect, useState} from 'react';
import {StyleSheet, View, FlatList, ActivityIndicator} from 'react-native';
import MenuBar from '../../components/MenuBar';
import SingleChat from '../../components/SingleChat';
import {generateClient} from 'aws-amplify/api';
import {fetchUserAttributes} from 'aws-amplify/auth';
import {listUsers} from '../../graphql/queries';
import {Snackbar} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';

const ChatPage = () => {
  const client = generateClient();

  const [chats, setChats] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // get all users from database
  const fetchUsers = async () => {
    try {
      const userAttributes = await fetchUserAttributes();
      //get all the users in the application
      const users = await client.graphql({query: listUsers});
      //return all the users minus the logged in user
      const chats = users.data.listUsers.items.filter(
        item => item.id !== userAttributes.sub,
      );
      setChats(chats);
    } catch {
      setErrorMessage('There was an error loading the users');
      setErrorVisible(true);
    }
  };

  //when the page loads
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <SafeAreaView style={styles.container}>
        {chats ? (
          <FlatList
            data={chats}
            renderItem={({item}) => <SingleChat chat={item} />}></FlatList>
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
              color="purple"
              accessibilityLabel="Loading"
              accessibilityHint="The chats are being loaded"
            />
          </View>
        )}
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
      </SafeAreaView>
      <MenuBar />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 60,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  errorMessage: {
    marginTop: 20,
    fontSize: 14,
    color: 'red',
  },
});

export default ChatPage;
