import React, { Component } from 'react';
import { View, Button } from 'react-native';
import { connect } from 'react-redux';

import { toggleTheme } from '../actions';


class ToggleTheme extends Component {
  render() {
    return (
      <View style={{marginTop: 25}}>
        <Button
          title="Toggle Color"
          color={this.props.color.hexCode}
          onPress={() => this.props.toggleTheme(this.props.color)}
        />
      </View>
    )
  }
}

const mapStateToProps = state => ({
  color: state.Theme.colorData,
});

const mapDispatchToProps = dispatch => ({
  toggleTheme: color => dispatch(toggleTheme(color)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ToggleTheme);