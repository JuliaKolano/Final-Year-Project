import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';

const Message = ({message, userID}) => {
  const isUsersMessage = () => {
    return message.userID === userID;
  };

  return (
    <View
      style={[
        styles.container,
        {
          alignSelf: isUsersMessage() ? 'flex-end' : 'flex-start',
          backgroundColor: isUsersMessage() ? '#d9a4f5' : '#efdcfa',
        },
      ]}
      accessibilityLabel={message.content}>
      <Text style={styles.text}>{message.content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 7,
    padding: 15,
    borderRadius: 15,
    maxWidth: '82%',
  },
  text: {
    color: 'black',
    fontSize: 16,
  },
});

//Define prop types for the Message component
Message.propTypes = {
  message: PropTypes.shape({
    userID: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
  }).isRequired,
  userID: PropTypes.string.isRequired,
};

export default Message;
