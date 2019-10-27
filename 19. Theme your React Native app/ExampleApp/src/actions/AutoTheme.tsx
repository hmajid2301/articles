import AsyncStorage from '@react-native-community/async-storage';
import RNLocation, {Location} from 'react-native-location';
import Snackbar from 'react-native-snackbar';
import {getSunrise, getSunset} from 'sunrise-sunset-js';

export default class AutoTheme {
  private static oneDay = 24 * 60 * 60 * 1000;

  public async shouldToggleDarkTheme() {
    const currentTime = new Date(Date.now());
    const {sunrise, sunset} = await this.getSunriseAndSunsetTime(currentTime);
    let toggleTheme = true;

    if (sunrise !== null && sunset !== null) {
      if (currentTime > sunrise && currentTime < sunset) {
        toggleTheme = false;
      }
    }

    return toggleTheme;
  }

  private async getSunriseAndSunsetTime(currentTime: Date) {
    const {latitude, longitude} = await this.getLatitudeLongitude();
    let sunrise = getSunrise(latitude, longitude, currentTime);
    const sunset = getSunset(latitude, longitude, currentTime);

    if (sunrise > sunset) {
      sunrise = new Date(sunset.getTime() - AutoTheme.oneDay);
    }
    return {sunset, sunrise};
  }

  private async getLatitudeLongitude() {
    const currentDate = new Date(Date.now());
    const lastQueried = await AsyncStorage.getItem('@LastQueriedLocation');
    let latitude: number;
    let longitude: number;
    let lastQueriedDate: Date;

    if (lastQueried) {
      lastQueriedDate = new Date(lastQueried);
    } else {
      lastQueriedDate = new Date(currentDate.getTime() - AutoTheme.oneDay);
    }

    if (currentDate.getTime() - lastQueriedDate.getTime() >= AutoTheme.oneDay) {
      ({latitude, longitude} = await this.getNewLatitudeLongitude(currentDate));
    } else {
      latitude = Number(await AsyncStorage.getItem('@Latitude'));
      longitude = Number(await AsyncStorage.getItem('@Longitude'));
    }

    return {latitude, longitude};
  }

  private async getNewLatitudeLongitude(currentDate: Date) {
    let latitude;
    let longitude;

    const granted = await RNLocation.requestPermission({
      ios: 'whenInUse',
      android: {
        detail: 'coarse',
      },
    });

    if (granted) {
      let location: Location | null;
      try {
        location = await RNLocation.getLatestLocation({timeout: 60000});
      } catch {
        Snackbar.show({
          title: 'Failed to get location, please check it is turned on',
        });
        throw Error('No location found');
      }

      if (location !== null) {
        latitude = location.latitude;
        longitude = location.longitude;

        await Promise.all([
          AsyncStorage.setItem('@Latitude', JSON.stringify(latitude)),
          AsyncStorage.setItem('@Longitude', JSON.stringify(longitude)),
          AsyncStorage.setItem(
            '@LastQueriedLocation',
            JSON.stringify(currentDate),
          ),
        ]);
      }
    }

    if (latitude === undefined || longitude === undefined) {
      throw Error('No location found');
    }

    return {latitude, longitude};
  }
}
