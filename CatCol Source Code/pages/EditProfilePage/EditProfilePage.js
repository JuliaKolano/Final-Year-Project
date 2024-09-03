import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Keyboard,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import MenuBar from '../../components/MenuBar';
import {launchImageLibrary} from 'react-native-image-picker';
import {generateClient} from 'aws-amplify/api';
import {updateUser} from '../../graphql/mutations';
import {uploadData} from 'aws-amplify/storage';
import {remove} from 'aws-amplify/storage';
import {fetchUserAttributes} from 'aws-amplify/auth';
import {useRoute} from '@react-navigation/native';
import {Snackbar} from 'react-native-paper';
import chooseImageIcon from '../../assets/image.png';

const EditProfilePage = () => {
  const client = generateClient();
  const route = useRoute();
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {user} = route.params;
  const [profilePicture, setProfilePicture] = useState(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [name, setName] = useState(user.getUser.name);
  const [instruments, setInstruments] = useState(user.getUser.instruments);
  const [genres, setGenres] = useState(user.getUser.genres);
  const [location, setLocation] = useState(user.getUser.location);

  useEffect(() => {
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

  // select the profile picture and obtain it uri
  const chooseImage = async () => {
    await launchImageLibrary({mediaType: 'photo'}, response => {
      if (!response.didCancel) {
        setProfilePicture(response.assets[0]);
      }
    });
  };

  // respond to instrument changes and add them to the list
  const handleInstrumentChange = (instrument, isChecked) => {
    if (isChecked) {
      // add instrument to the instrument list
      setInstruments(instruments => [...(instruments || []), instrument]);
    } else {
      // remove instrument from the instruments list
      setInstruments(instruments.filter(item => item !== instrument));
    }
  };

  const handleGenreChange = (genre, isChecked) => {
    if (isChecked) {
      // add genre to the genre list
      setGenres(genres => [...(genres || []), genre]);
    } else {
      // remove genre from the genres list
      setGenres(genres.filter(item => item !== genre));
    }
  };

  const handleSubmit = async () => {
    try {
      const userAttributes = await fetchUserAttributes();
      let profilePictureKey = null;

      // the user is changing the profile picture
      if (profilePicture) {
        //delete the old profile picture
        await remove({key: user.getUser.profilePicture});

        const uniqueKey = Date.now() + '_' + profilePicture.fileName;
        // change the uri string to a blob object
        const profilePictureURI = await fetch(profilePicture.uri);
        const profilePictureBlob = await profilePictureURI.blob();

        await uploadData({
          key: uniqueKey,
          data: profilePictureBlob,
        }).result;

        profilePictureKey = uniqueKey;
      }

      const userDetails = {
        id: userAttributes.sub,
        name: name,
        location: location,
        instruments: instruments,
        genres: genres,
        profilePicture: profilePictureKey
          ? profilePictureKey
          : user.profilePicture,
      };

      await client.graphql({
        query: updateUser,
        variables: {input: userDetails},
      });
      setErrorMessage('Data updated successfully');
      setErrorVisible(true);
    } catch (error) {
      setErrorMessage(error.message);
      setErrorVisible(true);
    }
  };

  return (
    <>
      <View
        style={[
          styles.container,
          {
            height: keyboardOpen ? '100%' : '92%',
          },
        ]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={styles.choosePictureContainer}>
            <Text style={styles.pictureLabel}>profilePicture:</Text>
            <TouchableOpacity
              style={styles.choosePictureButton}
              onPress={chooseImage}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Choose Picture">
              {/* Image obtained from https://icons8.com/icons/set/picture */}
              <Image
                source={chooseImageIcon}
                style={styles.choosePicureIcon}
                alt="Chose Picture Icon"
              />
            </TouchableOpacity>
            {profilePicture && (
              <Image
                source={{uri: profilePicture.uri}}
                style={styles.image}
                alt="Chosen Profile Picture"
              />
            )}
          </View>
          <Text style={styles.Label}>Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            accessibilityLabel="Name Input"
          />
          <Text style={styles.Label}>Location:</Text>
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={location}
            onChangeText={setLocation}
            accessibilityLabel="Location Input"
          />
          <Text style={styles.Label}>Instruments:</Text>
          <View style={styles.checkboxContainer}>
            <CheckBox
              value={instruments && instruments.includes('Guitar')}
              tintColors={{true: 'purple'}}
              onValueChange={isChecked =>
                handleInstrumentChange('Guitar', isChecked)
              }
              accessibilityState={{
                checked: instruments && instruments.includes('Guitar'),
              }}
              accessibilityRole="checkbox"
              accessibilityLabel="Guitar"
            />
            <Text>Guitar</Text>
            <CheckBox
              value={instruments && instruments.includes('Piano')}
              tintColors={{true: 'purple'}}
              onValueChange={isChecked =>
                handleInstrumentChange('Piano', isChecked)
              }
              accessibilityState={{
                checked: instruments && instruments.includes('Piano'),
              }}
              accessibilityRole="checkbox"
              accessibilityLabel="Piano"
            />
            <Text>Piano</Text>
            <CheckBox
              value={instruments && instruments.includes('Drums')}
              tintColors={{true: 'purple'}}
              onValueChange={isChecked =>
                handleInstrumentChange('Drums', isChecked)
              }
              accessibilityState={{
                checked: instruments && instruments.includes('Drums'),
              }}
              accessibilityRole="checkbox"
              accessibilityLabel="Drums"
            />
            <Text>Drums</Text>
            <CheckBox
              value={instruments && instruments.includes('Violin')}
              tintColors={{true: 'purple'}}
              onValueChange={isChecked =>
                handleInstrumentChange('Violin', isChecked)
              }
              accessibilityState={{
                checked: instruments && instruments.includes('Violin'),
              }}
              accessibilityRole="checkbox"
              accessibilityLabel="Violin"
            />
            <Text>Violin</Text>
            <CheckBox
              value={instruments && instruments.includes('Flute')}
              tintColors={{true: 'purple'}}
              onValueChange={isChecked =>
                handleInstrumentChange('Flute', isChecked)
              }
              accessibilityState={{
                checked: instruments && instruments.includes('Flute'),
              }}
              accessibilityRole="checkbox"
              accessibilityLabel="Flute"
            />
            <Text>Flute</Text>
            <CheckBox
              value={instruments && instruments.includes('Voice')}
              tintColors={{true: 'purple'}}
              onValueChange={isChecked =>
                handleInstrumentChange('Voice', isChecked)
              }
              accessibilityState={{
                checked: instruments && instruments.includes('Voice'),
              }}
              accessibilityRole="checkbox"
              accessibilityLabel="Voice"
            />
            <Text>Voice</Text>
          </View>

          <Text style={styles.Label}>Genres:</Text>
          <View style={styles.checkboxContainer}>
            <CheckBox
              value={genres && genres.includes('Pop')}
              tintColors={{true: 'purple'}}
              onValueChange={isChecked => handleGenreChange('Pop', isChecked)}
              accessibilityState={{checked: genres && genres.includes('Pop')}}
              accessibilityRole="checkbox"
              accessibilityLabel="Pop"
            />
            <Text>Pop</Text>
            <CheckBox
              value={genres && genres.includes('Rock')}
              tintColors={{true: 'purple'}}
              onValueChange={isChecked => handleGenreChange('Rock', isChecked)}
              accessibilityState={{checked: genres && genres.includes('Rock')}}
              accessibilityRole="checkbox"
              accessibilityLabel="Rock"
            />
            <Text>Rock</Text>
            <CheckBox
              value={genres && genres.includes('Hip Hop')}
              tintColors={{true: 'purple'}}
              onValueChange={isChecked =>
                handleGenreChange('Hip Hop', isChecked)
              }
              accessibilityState={{
                checked: genres && genres.includes('Hip Hop'),
              }}
              accessibilityRole="checkbox"
              accessibilityLabel="Hip Hop"
            />
            <Text>Hip Hop</Text>
            <CheckBox
              value={genres && genres.includes('R&B')}
              tintColors={{true: 'purple'}}
              onValueChange={isChecked => handleGenreChange('R&B', isChecked)}
              accessibilityState={{checked: genres && genres.includes('R&B')}}
              accessibilityRole="checkbox"
              accessibilityLabel="R&B"
            />
            <Text>R&B</Text>
            <CheckBox
              value={genres && genres.includes('EDM')}
              tintColors={{true: 'purple'}}
              onValueChange={isChecked => handleGenreChange('EDM', isChecked)}
              accessibilityState={{checked: genres && genres.includes('EDM')}}
              accessibilityRole="checkbox"
              accessibilityLabel="EDM"
            />
            <Text>EDM</Text>
            <CheckBox
              value={genres && genres.includes('Jazz')}
              tintColors={{true: 'purple'}}
              onValueChange={isChecked => handleGenreChange('Jazz', isChecked)}
              accessibilityState={{checked: genres && genres.includes('Jazz')}}
              accessibilityRole="checkbox"
              accessibilityLabel="Jazz"
            />
            <Text>Jazz</Text>
            <CheckBox
              value={genres && genres.includes('Classical')}
              tintColors={{true: 'purple'}}
              onValueChange={isChecked =>
                handleGenreChange('Classical', isChecked)
              }
              accessibilityState={{
                checked: genres && genres.includes('Classical'),
              }}
              accessibilityRole="checkbox"
              accessibilityLabel="Classical"
            />
            <Text>Classical</Text>
            <CheckBox
              value={genres && genres.includes('Country')}
              tintColors={{true: 'purple'}}
              onValueChange={isChecked =>
                handleGenreChange('Country', isChecked)
              }
              accessibilityState={{
                checked: genres && genres.includes('Country'),
              }}
              accessibilityRole="checkbox"
              accessibilityLabel="Country"
            />
            <Text>Country</Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Save Changes">
            <Text style={styles.buttonText}>Save Changes</Text>
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
      {!keyboardOpen && <MenuBar />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '92%',
    backgroundColor: '#fff',
  },
  scroll: {
    paddingTop: 80,
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  choosePictureContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  pictureLabel: {
    marginLeft: '10%',
    fontSize: 15,
  },
  choosePicureIcon: {
    width: 25,
    height: 25,
  },
  choosePictureButton: {
    marginLeft: 20,
  },
  image: {
    marginLeft: 120,
    width: 50,
    height: 50,
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  checkboxContainer: {
    height: 50,
    width: '80%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  Label: {
    marginLeft: '10%',
    alignSelf: 'flex-start',
    fontSize: 15,
    marginBottom: 5,
  },
  button: {
    height: 42,
    width: '80%',
    backgroundColor: 'purple',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorMessage: {
    marginTop: 20,
    fontSize: 14,
    color: 'red',
  },
});
export default EditProfilePage;
