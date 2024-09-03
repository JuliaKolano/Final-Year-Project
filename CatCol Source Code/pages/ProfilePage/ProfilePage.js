import React, {useCallback, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  Image,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MenuBar from '../../components/MenuBar';
import defaultPicture from '../../assets/profile-user.png';
import {useNavigation} from '@react-navigation/native';
import {signOut} from 'aws-amplify/auth';
import {fetchUserAttributes} from 'aws-amplify/auth';
import {generateClient} from 'aws-amplify/api';
import {getUser} from '../../graphql/queries';
import {getUrl} from 'aws-amplify/storage';
import {Snackbar} from 'react-native-paper';
import editProfileIcon from '../../assets/edit.png';
import logOutIcon from '../../assets/logout.png';

const ProfilePage = () => {
  const navigation = useNavigation();
  const client = generateClient();

  const [state, setState] = useState({
    errorVisible: false,
    errorMessage: '',
    user: [],
    profilePictureUrl: '',
  });

  // log out the user from the application
  const handleSignOut = useCallback(async () => {
    try {
      const signedOut = await signOut();
      {
        signedOut && navigation.navigate('CreateAccount');
      }
    } catch (error) {
      // setErrorMessage(error.message);
      // setErrorVisible(true);
      setState(prevState => ({
        ...prevState,
        errorMessage: 'Error occured when logging out',
        errorVisible: true,
      }));
    }
  }, [navigation]);

  // run on the render of the page
  useEffect(() => {
    fetchUser();
  }, []);

  // run everytime user object changes
  useEffect(() => {
    fetchProfilePicture();
  }, [state.user.getUser]);

  const fetchUser = async () => {
    try {
      //fetch user data
      const userAttributes = await fetchUserAttributes();
      const response = await client.graphql({
        query: getUser,
        variables: {id: userAttributes.sub},
      });
      setState(prevState => ({...prevState, user: response.data}));
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        errorMessage: 'Error fetching user data',
        errorVisible: true,
      }));
    }
  };

  const fetchProfilePicture = async () => {
    try {
      if (state.user?.getUser?.profilePicture) {
        //download profile picture url
        const getProfilePictureUrl = await getUrl({
          key: state.user.getUser.profilePicture,
        });
        setState(prevState => ({
          ...prevState,
          profilePictureUrl: getProfilePictureUrl.url,
        }));
      }
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        errorMessage: 'Error fetching profile picture',
        errorVisible: true,
      }));
    }
  };

  const renderInstruments = instruments => {
    if (!instruments || instruments.length === 0) {
      return <Text>None</Text>;
    }

    return instruments.map((instrument, index) => (
      <Text key={index} style={styles.item}>
        {instrument}
      </Text>
    ));
  };

  const renderGenres = genres => {
    if (!genres || genres.length === 0) {
      return <Text>None</Text>;
    }

    return genres.map((genre, index) => (
      <Text key={index} style={styles.item}>
        {genre}
      </Text>
    ));
  };

  return (
    <>
      <View style={styles.container}>
        {state.user.getUser ? (
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}>
            {state.profilePictureUrl ? (
              <Image
                source={{uri: state.profilePictureUrl.toString()}}
                style={styles.profilePicture}
                alt="Profile Picture"
              />
            ) : (
              <Image
                source={defaultPicture}
                style={styles.profilePicture}
                alt="Profile Picture"
              />
            )}
            <Text style={styles.name}>
              {state.user.getUser.name ? state.user.getUser.name : 'Anonymous'}
            </Text>
            <Text style={styles.email}>
              {state.user.getUser && state.user.getUser.email
                ? state.user.getUser.email
                : 'No Email'}
            </Text>
            <Text style={styles.sectionTitle}>Occupation:</Text>
            <Text style={styles.item}>
              {state.user.getUser.occupation
                ? state.user.getUser.occupation
                : 'Unknown'}
            </Text>
            <Text style={styles.sectionTitle}>Instruments:</Text>
            <View style={styles.itemContainer}>
              {renderInstruments(state.user.getUser.instruments)}
            </View>
            <Text style={styles.sectionTitle}>Genres:</Text>
            <View style={styles.itemContainer}>
              {renderGenres(state.user.getUser.genres)}
            </View>
            <Text style={styles.sectionTitle}>Location:</Text>
            <Text style={styles.item}>
              {state.user.getUser.location
                ? state.user.getUser.location
                : 'Unknown'}
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                navigation.navigate('EditProfile', {user: state.user})
              }
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Edit Profile">
              {/* Image obtained from https://www.flaticon.com/free-icon/edit_1159633?term=edit&page=1&position=1&origin=search&related_id=1159633 */}
              <Image
                source={editProfileIcon}
                style={styles.editIcon}
                alt="Edit Profile Icon"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleSignOut}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Logout">
              {/* Image obtained from https://www.flaticon.com/free-icon/logout_126467?term=logout&page=1&position=16&origin=tag&related_id=126467 */}
              <Image
                source={logOutIcon}
                style={styles.logoutIcon}
                alt="Logout Icon"
              />
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
              color="purple"
              accessibilityLabel="Loading"
              accessibilityHint="The user's details are being loaded"
            />
          </View>
        )}

        <Snackbar
          visible={state.errorVisible}
          onDismiss={() =>
            setState(prevState => ({...prevState, errorVisible: false}))
          }
          duration={3000}
          action={{
            label: 'Dismiss',
            onPress: () =>
              setState(prevState => ({...prevState, errorVisible: false})),
          }}
          accessibilityRole="alert"
          accessibilityState={{busy: state.errorVisible}}
          accessibilityLabel="Error Message"
          accessibilityHint="Press or wait to dismiss">
          {state.errorMessage}
        </Snackbar>
      </View>
      <MenuBar />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '92%',
    backgroundColor: '#fff',
  },
  scroll: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  profilePicture: {
    marginTop: 20,
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    fontSize: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  editButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
  editIcon: {
    width: 30,
    height: 30,
  },
  logoutButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 10,
  },
  logoutIcon: {
    width: 30,
    height: 30,
  },
  errorMessage: {
    marginTop: 20,
    fontSize: 14,
    color: 'red',
  },
});
export default ProfilePage;
