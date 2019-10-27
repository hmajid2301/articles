import React from 'react';

import {ThemeProvider} from '~/providers/ThemeContext';
import MainApp from '~/MainApp';

export default class App extends React.Component<{}, {}> {
  public render() {
    return (
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    );
  }
}
