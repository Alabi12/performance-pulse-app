// App.js
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Provider, useDispatch } from 'react-redux';
import { Store } from './src/store/index';
import AppNavigator from './src/navigation/AppNavigator'; // Fixed path
import { useEffect } from 'react';
import { loadStoredAuth } from './src/store/slices/authSlice'; // Fixed path

// Component to handle auth loading
function AuthLoader({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadStoredAuth());
  }, [dispatch]);

  return children;
}

export default function App() {
  return (
    <Provider store={Store}>
      <AuthLoader>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppNavigator />
        </NavigationContainer>
      </AuthLoader>
    </Provider>
  );
}