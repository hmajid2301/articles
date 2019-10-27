import React, {useContext} from 'react';
import {Image, Text, View} from 'react-native';
import {Header as ElementsHeader} from 'react-native-elements';

import logoDark from '~/assets/images/logo-dark.png';
import logoLight from '~/assets/images/logo-light.png';
import {ThemeContext} from '~/providers/ThemeContext';

const Header = () => {
  const {background, color, isDark} = useContext(ThemeContext).theme;

  return (
    <ElementsHeader
      containerStyle={{backgroundColor: background}}
      centerComponent={
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          <Text style={{color}}>Example</Text>
          <Image
            source={isDark ? logoLight : logoDark}
            style={{height: 25, width: 25}}
          />
          <Text style={{color}}>App</Text>
        </View>
      }
    />
  );
};

export default Header;
