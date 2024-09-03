import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import defaultPicture from '../assets/profile-user.png';
import {useNavigation} from '@react-navigation/native';
import {generateClient} from 'aws-amplify/api';
import {fetchUserAttributes} from 'aws-amplify/auth';
import {createChat, createUserChat} from '../graphql/mutations';
import {getUrl} from 'aws-amplify/storage';
import {getUserChats} from '../customGraphql/getUserChats';
import PropTypes from 'prop-types';

const SingleChat = ({chat}) => {
  const navigation = useNavigation();
  const client = generateClient();
  const [userPictureUrl, setUserPictureUrl] = useState('');

  //when component loads
  useEffect(() => {
    fetchUserPicture();
  }, []);

  const fetchUserPicture = async () => {
    try {
      if (chat.profilePicture) {
        //download profile picture url
        const getUserPictureUrl = await getUrl({
          key: chat.profilePicture,
        });
        setUserPictureUrl(getUserPictureUrl.url);
      }
    } catch (error) {
      setUserPictureUrl('');
    }
  };

  const goToChat = async () => {
    //don't create a chat if it already exists
    const existingChat = await getCommonChat();
    if (existingChat) {
      navigation.navigate('Messages', {
        id: existingChat.chat.id,
        name: chat.name,
      });
      return;
    }

    //create a new empty chat if one doesn't exist yet
    const newChatData = await client.graphql({
      query: createChat,
      variables: {input: {}},
    });

    const newChat = newChatData.data?.createChat;

    //add the clicked user to the chat
    await client.graphql({
      query: createUserChat,
      variables: {input: {chatId: newChat.id, userId: chat.id}},
    });

    //add the logged in user to the chat
    const userAttributes = await fetchUserAttributes();
    await client.graphql({
      query: createUserChat,
      variables: {input: {chatId: newChat.id, userId: userAttributes.sub}},
    });

    // navigate to the messages of the chat
    navigation.navigate('Messages', {
      id: chat.id,
      name: chat.name,
    });
  };

  const getCommonChat = async () => {
    //get all chats of logged in user
    const userAttributes = await fetchUserAttributes();
    const loggedInUserChatsData = await client.graphql({
      query: getUserChats,
      variables: {id: userAttributes.sub},
    });
    const loggedInUserChats = loggedInUserChatsData.data.getUser.Chats.items;

    //get the common chat between logged in and clicked on user
    const commonChat = loggedInUserChats.find(chatItem => {
      return chatItem.chat.users.items.some(
        userItem => userItem.user.id === chat.id,
      );
    });
    return commonChat;
  };

  return (
    <TouchableOpacity
      onPress={goToChat}
      style={styles.container}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Chat Room">
      <View style={styles.imageContainer}>
        {userPictureUrl ? (
          <Image
            source={{uri: userPictureUrl.toString()}}
            style={styles.image}
            resizeMode="cover"
            alt="Profile Picture"
          />
        ) : (
          <Image
            source={defaultPicture}
            style={styles.image}
            resizeMode="cover"
            alt="Profile Picture"
          />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.nameText} numberOfLines={1}>
          {chat.name}
        </Text>
        <Text style={styles.occupationText} numberOfLines={1}>
          {chat.occupation}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: 'lightgray',
    marginVertical: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    marginRight: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 75,
  },
  textContainer: {
    flex: 1,
  },
  nameText: {
    paddingHorizontal: 10,
    marginBottom: 10,
    color: 'black',
  },
  occupationText: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

//Define prop types for the SingleChat component
SingleChat.propTypes = {
  chat: PropTypes.shape({
    profilePicture: PropTypes.string,
    name: PropTypes.string,
    id: PropTypes.string.isRequired,
    occupation: PropTypes.string.isRequired,
  }).isRequired,
};

export default SingleChat;
