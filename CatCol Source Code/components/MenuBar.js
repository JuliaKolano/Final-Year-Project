import React from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import userProfilePageIcon from '../assets/user.png';
import homePageIcon from '../assets/home-2.png';
import chatPageIcon from '../assets/chat.png';

const MenuBar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => navigation.navigate('Profile')}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Profile Page Navigation">
        {/* image obtained from https://www.flaticon.com/free-icon/user_747376?term=profile&page=1&position=15&origin=search&related_id=747376 */}
        <Image
          source={userProfilePageIcon}
          style={styles.menuIcon}
          alt="Profile Navigation Menu Icon"></Image>
      </TouchableOpacity>
      <View role="separator" style={styles.separator} />
      <TouchableOpacity
        style={styles.tab}
        onPress={() => navigation.navigate('Home')}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Home Page Navigation">
        {/* image obtained from https://www.flaticon.com/free-icon/home_1946488?term=home&page=1&position=2&origin=search&related_id=1946488 */}
        <Image
          source={homePageIcon}
          style={styles.menuIcon}
          alt="Home Navigation Menu Icon"></Image>
      </TouchableOpacity>
      <View role="separator" style={styles.separator} />
      <TouchableOpacity
        style={styles.tab}
        onPress={() => navigation.navigate('Chat')}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Chat Page Navigation">
        {/* image obtained from https://www.flaticon.com/free-icon/message_3034023?term=message&page=1&position=6&origin=search&related_id=3034023 */}
        <Image
          source={chatPageIcon}
          style={styles.menuIcon}
          alt="Chat Navigation Meny Icon"></Image>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: 'center',
  },
  separator: {
    width: 1,
    height: '50%',
    backgroundColor: '#000',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    maxHeight: 25,
    maxWidth: 25,
  },
});

export default MenuBar;
