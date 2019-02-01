import { createMaterialTopTabNavigator } from "react-navigation";

import PageA from "../../views/Home/PageA";
import PageB from "../../views/Home/PageB";

const CustomTabNavigator = createMaterialTopTabNavigator(
  {
    PageA: {
      navigationOptions: {
        tabBarLabel: "PageA"
      },
      screen: PageA
    },
    PageB: {
      navigationOptions: {
        tabBarLabel: "PageB"
      },
      screen: PageB
    }
  },
  {
    tabBarPosition: "bottom"
  }
);

export default CustomTabNavigator;
