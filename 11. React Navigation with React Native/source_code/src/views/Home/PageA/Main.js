import React, { Component } from "react";
import { Button, View } from "react-native";

export default class Main extends Component {
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "purple" }}>
        <Button
          title="To Secondary"
          onPress={() => this.props.navigation.navigate("Secondary")}
        />
      </View>
    );
  }
}
