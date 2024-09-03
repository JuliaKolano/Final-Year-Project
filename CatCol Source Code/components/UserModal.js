import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {Modal} from 'react-native-paper';
import PropTypes from 'prop-types';

const UserModal = ({visible, user, onClose}) => {
  return (
    <Modal
      visible={visible}
      onDismiss={onClose}
      contentContainerStyle={styles.modalContainer}>
      {user && (
        <View style={styles.modalContent} accessibilityLabel="User Details">
          <Text
            style={styles.text}
            accessibilityLabel={user.name ? user.name : 'Anonymous'}>
            Name: {user.name ? user.name : 'Anonymous'}
          </Text>
          <Text
            style={styles.text}
            accessibilityLabel={user.email ? user.email : 'No Email'}>
            Email: {user.email ? user.email : 'No Email'}
          </Text>
          <Text
            style={styles.text}
            accessibilityLabel={user.occupation ? user.occupation : 'Unknown'}>
            Occupation: {user.occupation ? user.occupation : 'Unknown'}
          </Text>
          <View>
            {user.instruments || user.instruments > 0 ? (
              <Text
                style={styles.text}
                accessibilityLabel={user.instruments.join(', ')}>
                Instruments: {user.instruments.join(', ')}
              </Text>
            ) : (
              <Text style={styles.text} accessibilityLabel="Instruments: None">
                Istruments: None
              </Text>
            )}
          </View>
          <View>
            {user.genres || user.genres > 0 ? (
              <Text
                style={styles.text}
                accessibilityLabel={user.genres.join(', ')}>
                Genres: {user.genres.join(', ')}
              </Text>
            ) : (
              <Text style={styles.text} accessibilityLabel="Genres: None">
                Genres: None
              </Text>
            )}
          </View>
          <Text
            style={styles.text}
            accessibilityLabel={user.location ? user.location : 'Unknown'}>
            Location: {user.location ? user.location : 'Unknown'}
          </Text>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 50,
    borderRadius: 10,
    elevation: 5,
  },
  modalContent: {
    alignItems: 'start',
  },
  text: {
    fontSize: 16,
  },
});

// Define prop types for the UserModal component
UserModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string.isRequired,
    occupation: PropTypes.string.isRequired,
    instruments: PropTypes.arrayOf(PropTypes.string),
    genres: PropTypes.arrayOf(PropTypes.string),
    location: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

export default UserModal;
