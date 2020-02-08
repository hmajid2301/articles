import {ApiResponse, create} from 'apisauce';
import React from 'react';
import {Button} from 'react-native';
import {firebase} from '@react-native-firebase/auth';

const App = () => (
  <Button title="Make Request" onPress={() => makeRequest()}></Button>
);

async function makeRequest() {
  const userCredentials = await firebase.auth().signInAnonymously();
  const token = await userCredentials.user.getIdToken();

  const api = create({
    baseURL: 'https://us-central1-exampleapp.cloudfunctions.net',
    headers: {Authorization: `Bearer ${token}`},
    timeout: 10000,
  });

  try {
    const response: ApiResponse<{hello: string}> = await api.post('/hello', {
      name: 'Haseeb',
    });

    const {data, ok, status} = response;
    if (ok) {
      console.log('Success', status, data);
    } else {
      console.error('error', status);
    }
  } catch {
    console.error('Error thrown');
  }
}

export default App;
