import React, {useState, useEffect} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import defaultPicture from '../assets/profile-user.png';
import {getUrl} from 'aws-amplify/storage';
import PropTypes from 'prop-types';

const UserCard = ({user: {name, occupation, profilePicture}}) => {
  const [userPictureUrl, setUserPictureUrl] = useState('');

  //when component loads
  useEffect(() => {
    fetchUserPicture();
  }, []);

  const fetchUserPicture = async () => {
    try {
      if (profilePicture) {
        //download profile picture url
        const getUserPictureUrl = await getUrl({
          key: profilePicture,
        });
        setUserPictureUrl(getUserPictureUrl.url);
      }
    } catch (error) {
      setUserPictureUrl('');
    }
  };

  return (
    <View style={styles.container}>
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
            alt="ProfilePicture"
          />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.nameText} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.occupationText} numberOfLines={1}>
          {occupation}
        </Text>
      </View>
    </View>
  );
};

//Define prop types for the UserCard component
UserCard.propTypes = {
  user: PropTypes.shape({
    profilePicture: PropTypes.string,
    name: PropTypes.string,
    occupation: PropTypes.string.isRequired,
  }).isRequired,
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

export default UserCard;
