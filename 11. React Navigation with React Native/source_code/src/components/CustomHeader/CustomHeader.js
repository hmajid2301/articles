import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

import styles from "./styles";

const CustomHeader = ({ navigation }) => (
  <View style={[styles.container]}>
    <Ionicons
      name="md-menu"
      size={32}
      color="black"
      onPress={() => navigation.openDrawer()}
    />
  </View>
);

export default CustomHeader;
