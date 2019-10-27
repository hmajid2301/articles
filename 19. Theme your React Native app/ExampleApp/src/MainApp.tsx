import React from 'react';
import {View, Text, AppState} from 'react-native';
import {ListItem} from 'react-native-elements';

import AutoTheme from '~/actions/AutoTheme';
import Header from '~/components/Header';
import {ThemeContext} from '~/providers/ThemeContext';

interface IState {
  autoTheme: boolean;
}

export default class MainApp extends React.Component<{}, IState> {
  public static contextType = ThemeContext;
  public context!: React.ContextType<typeof ThemeContext>;

  public state = {
    autoTheme: false,
    autoToggleTheme: new AutoTheme(),
  };

  public render() {
    const theme = this.context.theme;
    return (
      <View style={{flex: 1, backgroundColor: theme.background}}>
        <Header />
        <ListItem
          containerStyle={{
            backgroundColor: theme.background,
          }}
          topDivider={true}
          bottomDivider={true}
          titleStyle={{color: theme.color}}
          title="Auto Toggle Dark Theme"
          switch={{
            onValueChange: this.autoTheme.bind(this, !this.state.autoTheme),
            thumbColor: 'white',
            trackColor: {false: 'gray', true: 'blue'},
            value: this.state.autoTheme,
          }}
        />

        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{color: theme.color, fontSize: 30}}>
            Current Theme: {this.context.theme.isDark ? 'Dark' : 'Light'}
          </Text>
        </View>
      </View>
    );
  }

  public async componentDidMount() {
    AppState.addEventListener('change', this.appInFocus);
  }

  public componentWillUnmount() {
    AppState.removeEventListener('change', this.appInFocus);
  }

  private autoTheme = async (value: boolean) => {
    this.setState({autoTheme: value});
    let isDark = false;
    if (value) {
      isDark = await this.state.autoToggleTheme.shouldToggleDarkTheme();
    }
    this.context.changeTheme(isDark);
    this.context.changeTheme(isDark);
  };

  private appInFocus = async (nextAppState: any) => {
    if (nextAppState === 'active' && this.state.autoTheme) {
      const isDark = await this.state.autoToggleTheme.shouldToggleDarkTheme();
      this.context.changeTheme(isDark);
    }
  };
}
