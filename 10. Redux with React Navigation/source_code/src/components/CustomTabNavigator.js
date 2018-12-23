import store from '../store';
import { createMaterialTopTabNavigator } from 'react-navigation';

import PageA from '../screens/PageA';
import PageB from '../screens/PageB';
import { COLORS } from '../themes';
import { toggleTheme } from '../actions';


const commonTabOptions = color => ({
  activeTintColor: 'white',
  pressColor: '#fff',
  inactiveTintColor: '#ddd',
  style: {
    backgroundColor: color,
  },
});


const CustomerTabNavigator = createMaterialTopTabNavigator({
  Encoding: {
    screen: PageA,
    navigationOptions: {
      tabBarLabel: 'A',
      tabBarOptions: commonTabOptions(COLORS.red.hexCode),
      tabBarOnPress: ({ _, defaultHandler }) => {
        store.dispatch(toggleTheme(COLORS.blue));
        defaultHandler();
      },
    },
  },
  Decoding: {
    screen: PageB,
    navigationOptions: {
      tabBarLabel: 'B',
      tabBarOptions: commonTabOptions(COLORS.blue.hexCode),
      tabBarOnPress: ({ _, defaultHandler }) => {
        store.dispatch(toggleTheme(COLORS.red));
        defaultHandler();
      },
    },
  },
}, {
    tabBarPosition: 'bottom',
});


export default CustomerTabNavigator;