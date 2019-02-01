import { createStackNavigator } from "react-navigation";

import Main from "./PageA/Main";
import Secondary from "./PageA/Secondary";

const PageANavigator = createStackNavigator({
  Main: {
    navigationOptions: {
      header: null
    },
    screen: Main
  },

  Secondary: {
    navigationOptions: {
      header: null
    },
    screen: Secondary
  }
});

PageANavigator.navigationOptions = ({ navigation }) => ({
  tabBarVisible: navigation.state.index === 0,
  swipeEnabled: navigation.state.index === 0
});

export default PageANavigator;
