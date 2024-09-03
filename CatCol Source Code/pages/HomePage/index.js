import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {Chip} from 'react-native-paper';
import MenuBar from '../../components/MenuBar';
import UserCard from '../../components/UserCard';
import UserModal from '../../components/UserModal';
import {fetchUserAttributes} from 'aws-amplify/auth';
import {listUsers} from '../../graphql/queries';
import {getUser} from '../../graphql/queries';
import {generateClient} from 'aws-amplify/api';
import {Snackbar} from 'react-native-paper';

const Home = () => {
  const client = generateClient();
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [userData, setUserData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [recommendedUsers, setRecommendedUsers] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [expandOccupations, setExpandOccupations] = useState(false);
  const [expandInstruments, setExpandInstruments] = useState(false);
  const [expandGenres, setExpandGenres] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [filterColours, setFilterColours] = useState({
    Name: '#efdcfa',
    Occupations: '#efdcfa',
    Instruments: '#efdcfa',
    Genres: '#efdcfa',
    Location: '#efdcfa',
    Musician: '#f8f3fe',
    Promoter: '#f8f3fe',
    EventManager: '#f8f3fe',
    Guitar: '#f8f3fe',
    Piano: '#f8f3fe',
    Drums: '#f8f3fe',
    Violin: '#f8f3fe',
    Flute: '#f8f3fe',
    Voice: '#f8f3fe',
    Pop: '#f8f3fe',
    Rock: '#f8f3fe',
    HipHop: '#f8f3fe',
    RnB: '#f8f3fe',
    EDM: '#f8f3fe',
    Jazz: '#f8f3fe',
    Classical: '#f8f3fe',
    Country: '#f8f3fe',
  });

  // get all users from database
  const fetchUsers = async () => {
    try {
      const userAttributes = await fetchUserAttributes();
      //get all the users in the application
      const {data} = await client.graphql({query: listUsers});
      const allUsers = data.listUsers.items;
      setRecommendedUsers(
        allUsers.filter(item => item.id !== userAttributes.sub),
      );
    } catch (error) {
      setErrorMessage('There was an error loading the users');
      setErrorVisible(true);
    }
  };

  const fetchLoggedInUser = async () => {
    try {
      const userAttributes = await fetchUserAttributes();
      const response = await client.graphql({
        query: getUser,
        variables: {id: userAttributes.sub},
      });
      setUserData(response.data.getUser);
    } catch {
      setErrorMessage('There was an error fetching user data');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLoggedInUser();
  }, []);

  useEffect(() => {
    fetchLoggedInUser();
  }, [selectedFilters]);

  useEffect(() => {
    fetchFilteredUsers();
  }, [recommendedUsers, selectedFilters]);

  const openModal = useCallback(user => {
    setSelectedUser(user);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedUser(null);
  }, []);

  const fetchFilteredUsers = async () => {
    if (!recommendedUsers) return;

    const filtered = await applyFilters();
    setFilteredUsers(filtered);
  };

  const toggleColour = (filterName, unselectedColour, selectedColour) => {
    setFilterColours(prevColours => ({
      ...prevColours,
      [filterName]:
        prevColours[filterName] === unselectedColour
          ? selectedColour
          : unselectedColour,
    }));
  };

  const toggleOccupations = (filterName, unselectedColour, selectedColour) => {
    setExpandOccupations(prev => !prev);
    toggleColour(filterName, unselectedColour, selectedColour);
  };

  const toggleInstruments = (filterName, unselectedColour, selectedColour) => {
    setExpandInstruments(prev => !prev);
    toggleColour(filterName, unselectedColour, selectedColour);
  };

  const toggleGenres = (filterName, unselectedColour, selectedColour) => {
    setExpandGenres(prev => !prev);
    toggleColour(filterName, unselectedColour, selectedColour);
  };

  const toggleFilter = (filterName, unselectedColour, selectedColour) => {
    setSelectedFilters(prevState => ({
      ...prevState,
      [filterName]: !prevState[filterName],
    }));
    toggleColour(filterName, unselectedColour, selectedColour);
  };

  const getLocationCoordinates = async location => {
    try {
      if (location) {
        const encodedLocation = encodeURIComponent(location.trim());
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=jsonv2&limit=1`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            return [lat, lon];
          } else {
            setErrorMessage('Location not found');
          }
        } else {
          setErrorMessage('Error fetchig location data');
        }
      } else {
        return [null, null];
      }
    } catch (error) {
      setErrorMessage('Error fetching location');
      return [null, null];
    }
  };

  const deg2rad = deg => {
    return deg * (Math.PI / 180);
  };

  const calculateDistance = async (location1, location2) => {
    // Obtain the latitude and longitude from location coordinates
    const [lat1, lon1] = await getLocationCoordinates(location1);
    const [lat2, lon2] = await getLocationCoordinates(location2);

    // Use Haversine formula to calculate distance between two points
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const applyFilters = () => {
    if (!recommendedUsers) return [];

    const selectedFilterKeys = Object.keys(selectedFilters);

    const filteredUsers = recommendedUsers.filter(user => {
      return selectedFilterKeys.every(filter => {
        if (selectedFilters[filter]) {
          const filterTrimLowerCase = filter.toLowerCase().replace(/\s+/g, '');

          if (filterTrimLowerCase === 'name') {
            return true;
          }

          // Handle location filter
          if (filterTrimLowerCase === 'location') {
            // only return users with a specified location
            return user.location;
          }

          // Check if any property value of the user matches the filter
          return Object.values(user).some(value => {
            if (Array.isArray(value)) {
              // Check if any array element matches the filter
              return value.some(
                item =>
                  item &&
                  item.toLowerCase().replace(/\s+/g, '') ===
                    filterTrimLowerCase,
              );
            } else if (typeof value === 'string') {
              // Check if string property matches the filter
              return (
                value.toLowerCase().replace(/\s+/g, '') === filterTrimLowerCase
              );
            }
            return false;
          });
        }
        return true;
      });
    });

    // Sort filtered users based on distance if 'Location' filter is selected
    if (selectedFilters['Location']) {
      const loggedInUserLocation = userData?.location;
      return Promise.all(
        filteredUsers.map(async user => {
          const distance = Math.abs(
            await calculateDistance(loggedInUserLocation, user.location),
          );
          // Add the distance to the user object
          return {...user, distance};
        }),
      ).then(usersWithDistance => {
        // Sort based on location distances
        usersWithDistance.sort((a, b) => a.distance - b.distance);
        // Remove distance from the returned user object
        return usersWithDistance.map(user => ({...user, distance: undefined}));
      });
    }

    // Sort the users alphabetically if 'Name' filter is selected
    if (selectedFilters['Name']) {
      filteredUsers.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
    }

    return filteredUsers;
  };

  return (
    <>
      <View style={styles.container}>
        {recommendedUsers ? (
          <>
            <View style={styles.filterContainer}>
              <Chip
                onPress={() => toggleFilter('Name', '#efdcfa', '#d9a4f5')}
                style={[
                  styles.filterButton,
                  {backgroundColor: filterColours['Name']},
                ]}
                accessibilityState={{
                  checked: selectedFilters && selectedFilters['Name'],
                }}
                accessibilityRole="button"
                accessibilityLabel="Filter by Name">
                Name
              </Chip>
              <Chip
                onPress={() =>
                  toggleOccupations('Occupations', '#efdcfa', '#d9a4f5')
                }
                style={[
                  styles.filterButton,
                  {backgroundColor: filterColours['Occupations']},
                ]}
                accessibilityState={{
                  checked: selectedFilters && selectedFilters['Occupations'],
                }}
                accessibilityRole="button"
                accessibilityLabel="Expand Occupation Filters">
                Occupations
              </Chip>
              {expandOccupations && (
                <>
                  <Chip
                    onPress={() =>
                      toggleFilter('Musician', '#f8f3fe', '#d9a4f5')
                    }
                    style={[
                      styles.filterButton,
                      {backgroundColor: filterColours['Musician']},
                    ]}
                    accessibilityState={{
                      checked: selectedFilters && selectedFilters['Musician'],
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Filter by Musicians">
                    Musician
                  </Chip>
                  <Chip
                    onPress={() =>
                      toggleFilter('Promoter', '#f8f3fe', '#d9a4f5')
                    }
                    style={[
                      styles.filterButton,
                      {backgroundColor: filterColours['Promoter']},
                    ]}
                    accessibilityState={{
                      checked: selectedFilters && selectedFilters['Promoter'],
                    }}
                    accessibilityRole="Button"
                    accessibilityLabel="Filter by Promoters">
                    Promoter
                  </Chip>
                  <Chip
                    onPress={() =>
                      toggleFilter('EventManager', '#f8f3fe', '#d9a4f5')
                    }
                    style={[
                      styles.filterButton,
                      {backgroundColor: filterColours['EventManager']},
                    ]}
                    accessibilityState={{
                      checked:
                        selectedFilters && selectedFilters['EventManager'],
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Filter by Event Managers">
                    Event Manager
                  </Chip>
                </>
              )}
              <Chip
                onPress={() =>
                  toggleInstruments('Instruments', '#efdcfa', '#d9a4f5')
                }
                style={[
                  styles.filterButton,
                  {backgroundColor: filterColours['Instruments']},
                ]}
                accessibilityState={{
                  checked: selectedFilters && selectedFilters['Instruments'],
                }}
                accessibilityRole="button"
                accessibilityLabel="Expand Instrument Filters">
                Instruments
              </Chip>
              {expandInstruments && (
                <>
                  <Chip
                    onPress={() => toggleFilter('Guitar', '#f8f3fe', '#d9a4f5')}
                    style={[
                      styles.filterButton,
                      {backgroundColor: filterColours['Guitar']},
                    ]}
                    accessibilityState={{
                      checked: selectedFilters && selectedFilters['Guitar'],
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Filter by Guitar Users">
                    Guitar
                  </Chip>
                  <Chip
                    onPress={() => toggleFilter('Piano', '#f8f3fe', '#d9a4f5')}
                    style={[
                      styles.filterButton,
                      {backgroundColor: filterColours['Piano']},
                    ]}
                    accessibilityState={{
                      checked: selectedFilters && selectedFilters['Piano'],
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Filter by Piano Users">
                    Piano
                  </Chip>
                  <Chip
                    onPress={() => toggleFilter('Drums', '#f8f3fe', '#d9a4f5')}
                    style={[
                      styles.filterButton,
                      {backgroundColor: filterColours['Drums']},
                    ]}
                    accessibilityState={{
                      checked: selectedFilters && selectedFilters['Drums'],
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Filter by Drums Users">
                    Drums
                  </Chip>
                  <Chip
                    onPress={() => toggleFilter('Violin', '#f8f3fe', '#d9a4f5')}
                    style={[
                      styles.filterButton,
                      {backgroundColor: filterColours['Violin']},
                    ]}
                    accessibilityState={{
                      checked: selectedFilters && selectedFilters['Violin'],
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Filter by Violin Users">
                    Violin
                  </Chip>
                  <Chip
                    onPress={() => toggleFilter('Flute', '#f8f3fe', '#d9a4f5')}
                    style={[
                      styles.filterButton,
                      {backgroundColor: filterColours['Flute']},
                    ]}
                    accessibilityState={{
                      checked: selectedFilters && selectedFilters['Flute'],
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Filter by Flute Users">
                    Flute
                  </Chip>
                  <Chip
                    onPress={() => toggleFilter('Voice', '#f8f3fe', '#d9a4f5')}
                    style={[
                      styles.filterButton,
                      {backgroundColor: filterColours['Voice']},
                    ]}
                    accessibilityState={{
                      checked: selectedFilters && selectedFilters['Voice'],
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Filter by Voice Users">
                    Voice
                  </Chip>
                </>
              )}
              <Chip
                onPress={() => toggleGenres('Genres', '#efdcfa', '#d9a4f5')}
                style={[
                  styles.filterButton,
                  {backgroundColor: filterColours['Genres']},
                ]}
                accessibilityState={{
                  checked: selectedFilters && selectedFilters['Genres'],
                }}
                accessibilityRole="button"
                accessibilityLabel="Expand Genre Filters">
                Genres
              </Chip>
              {expandGenres && (
                <>
                  <Chip
                    onPress={() => toggleFilter('Pop', '#f8f3fe', '#d9a4f5')}
                    style={[
                      styles.filterButton,
                      {backgroundColor: filterColours['Pop']},
                    ]}
                    accessibilityState={{
                      checked: selectedFilters && selectedFilters['Pop'],
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Filter by Pop Music Creators">
                    Pop
                  </Chip>
                  <Chip
                    onPress={() => toggleFilter('Rock', '#f8f3fe', '#d9a4f5')}
                    style={[
                      styles.filterButton,
                      {backgroundColor: filterColours['Rock']},
                    ]}
                    accessibilityState={{
                      checked: selectedFilters && selectedFilters['Rock'],
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Filter by Rock Music Creators">
                    Rock
                  </Chip>
                  <Chip
                    onPress={() => toggleFilter('HipHop', '#f8f3fe', '#d9a4f5')}
                    style={[
                      styles.filterButton,
                      {backgroundColor: filterColours['HipHop']},
                    ]}
                    accessibilityState={{
                      checked: selectedFilters && selectedFilters['HipHop'],
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Filter by Hip Hop Music Creators">
                    Hip Hop
                  </Chip>
                  <Chip
                    onPress={() => toggleFilter('RnB', '#f8f3fe', '#d9a4f5')}
                    style={[
                      styles.filterButton,
                      {backgroundColor: filterColours['RnB']},
                    ]}
                    accessibilityState={{
                      checked: selectedFilters && selectedFilters['RnB'],
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Filter by R&B Music Creators">
                    R&B
                  </Chip>
                  <Chip
                    onPress={() => toggleFilter('EDM', '#f8f3fe', '#d9a4f5')}
                    style={[
                      styles.filterButton,
                      {backgroundColor: filterColours['EDM']},
                    ]}
                    accessibilityState={{
                      checked: selectedFilters && selectedFilters['EDM'],
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Filter by EDM Music Creators">
                    EDM
                  </Chip>
                  <Chip
                    onPress={() => toggleFilter('Jazz', '#f8f3fe', '#d9a4f5')}
                    style={[
                      styles.filterButton,
                      {backgroundColor: filterColours['Jazz']},
                    ]}
                    accessibilityState={{
                      checked: selectedFilters && selectedFilters['Jazz'],
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Filter by Jazz Music Creators">
                    Jazz
                  </Chip>
                  <Chip
                    onPress={() =>
                      toggleFilter('Classical', '#f8f3fe', '#d9a4f5')
                    }
                    style={[
                      styles.filterButton,
                      {backgroundColor: filterColours['Classical']},
                    ]}
                    accessibilityState={{
                      checked: selectedFilters && selectedFilters['Classical'],
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Filter by Classical Music Creators">
                    Classical
                  </Chip>
                  <Chip
                    onPress={() =>
                      toggleFilter('Country', '#f8f3fe', '#d9a4f5')
                    }
                    style={[
                      styles.filterButton,
                      {backgroundColor: filterColours['Country']},
                    ]}
                    accessibilityState={{
                      checked: selectedFilters && selectedFilters['Country'],
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Filter by Country Music Creators">
                    Country
                  </Chip>
                </>
              )}
              <Chip
                onPress={() => toggleFilter('Location', '#efdcfa', '#d9a4f5')}
                style={[
                  styles.filterButton,
                  {backgroundColor: filterColours['Location']},
                ]}
                accessibilityState={{
                  checked: selectedFilters && selectedFilters['Location'],
                }}
                accessibilityRole="button"
                accessibilityLabel="Filter by Location">
                Location
              </Chip>
            </View>
            <View style={styles.listContainer}>
              <FlatList
                data={filteredUsers}
                renderItem={({item}) => (
                  <TouchableOpacity
                    onPress={() => openModal(item)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Show User Details">
                    <UserCard key={item.id} user={item} />
                  </TouchableOpacity>
                )}></FlatList>
            </View>
          </>
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
              color="purple"
              accessibilityLabel="Loading"
              accessibilityHint="The users are being loaded"
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
      </View>
      <MenuBar />

      <UserModal
        visible={modalVisible}
        user={selectedUser}
        onClose={closeModal}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterButton: {
    margin: 5,
  },
  filterContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  listContainer: {
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

export default Home;
