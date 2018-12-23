import React, { Component } from 'react';
import { View, Text } from 'react-native';

import ToggleTheme from '../components/ToggleTheme';

export default class PageB extends Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <ToggleTheme />
        <Text>PageB</Text>
      </View>
    );
  }
}
