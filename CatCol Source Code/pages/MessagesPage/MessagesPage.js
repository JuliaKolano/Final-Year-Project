import React, {useState, useEffect, useCallback} from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {fetchUserAttributes} from 'aws-amplify/auth';
import {generateClient} from 'aws-amplify/api';
import {createMessage} from '../../graphql/mutations';
import {listMessagesByChat} from '../../graphql/queries';
import {onCreateMessage} from '../../graphql/subscriptions';
import {Snackbar} from 'react-native-paper';
import MenuBar from '../../components/MenuBar';
import Message from '../../components/Message';
import sendButtonIcon from '../../assets/send.png';

const MessagesPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const client = generateClient();
  const chatInfo = route.params;
  const chatID = route.params.id;

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userID, setUserID] = useState('');
  const [text, setText] = useState(null);
  const [messages, setMessages] = useState(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    //fetch user data from Cognito
    fetchUser();
    //fetch all the messages of the chat
    fetchMessages();

    //set up a listener for the keyboard
    const keyboardOpenedListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardOpen(true);
      },
    );
    const keyboardClosedListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardOpen(false);
      },
    );
    // remove listeners
    return () => {
      keyboardOpenedListener.remove();
      keyboardClosedListener.remove();
    };
  }, []);

  //set messaged user's name as the text of the top tab
  useEffect(() => {
    navigation.setOptions({title: chatInfo.name});
  }, [chatInfo.name]);

  const fetchUser = async () => {
    try {
      const userAttributes = await fetchUserAttributes();
      setUserID(userAttributes.sub);
    } catch (error) {
      setErrorMessage('There was an error fetching user data');
      setErrorVisible(true);
    }
  };

  const fetchMessages = async () => {
    //fetch the messages
    const chatData = await client.graphql({
      query: listMessagesByChat,
      variables: {chatID, sortDirection: 'DESC'},
    });
    setMessages(chatData.data.listMessagesByChat.items);

    //track the creation of a new message
    const messageSubscription = client
      .graphql({
        query: onCreateMessage,
        variables: {filter: {chatID: {eq: chatID}}},
      })
      .subscribe({
        next: ({data}) => {
          setMessages(message => [data.onCreateMessage, ...message]);
        },
        error: error => (setErrorMessage(error.message), setErrorVisible(true)),
      });

    return () => messageSubscription.unsubscribe();
  };

  //send the message to database
  const handleSubmit = useCallback(async () => {
    if (!text) {
      return;
    }

    try {
      const newMessage = {
        chatID: chatID,
        content: text,
        userID: userID,
      };

      await client.graphql({
        query: createMessage,
        variables: {input: newMessage},
      });
    } catch (error) {
      setErrorMessage('There was an error sending the message');
      setErrorVisible(true);
      return;
    }

    // reset text in input field
    setText(null);
  }, [text, chatID, userID]);

  return (
    <>
      {messages && userID ? (
        <>
          <View
            style={[
              styles.messagesContainer,
              {
                height: keyboardOpen ? '88%' : '84%',
              },
            ]}>
            {messages.length === 0 ? (
              <Text style={styles.noMessageText}> No messages yet </Text>
            ) : (
              <FlatList
                data={messages}
                inverted={true}
                renderItem={({item}) => (
                  <Message key={item.id} message={item} userID={userID} />
                )}
              />
            )}
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Message..."
              style={styles.inputBox}
              accessibilityLabel="Message Input"
            />
            <TouchableOpacity
              onPress={handleSubmit}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Send Message">
              <Image
                // send icon obatined from https://icons8.com/icons/set/send--static--c-a020f0
                source={sendButtonIcon}
                style={styles.sendIcon}
                alt="Send Message Icon"></Image>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator
            size="large"
            color="purple"
            accessibilityLabel="Loading"
            accessibilityHint="The messages are being loaded"
          />
        </View>
      )}
      {!keyboardOpen && <MenuBar />}
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
    </>
  );
};

const styles = StyleSheet.create({
  messagesContainer: {
    backgroundColor: '#fff',
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#e6e6e6',
    padding: 2,
    paddingVertical: 5,
  },
  inputBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 0,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginHorizontal: 10,
  },
  sendIcon: {
    marginTop: 4,
    marginRight: 5,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  noMessageText: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    fontSize: 20,
  },
  errorMessage: {
    marginTop: 20,
    fontSize: 14,
    color: 'red',
  },
});

export default MessagesPage;
