import React, { Component } from 'react';
import { Provider } from 'react-redux';

import store from './src/store';
import CustomTabNavigator from './src/components/CustomTabNavigator';

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <CustomTabNavigator />
      </Provider>
    );
  }
};
