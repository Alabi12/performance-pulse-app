// src/navigation/MainNavigator.js
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import AttendanceScreen from '../features/attendance/screens/AttendanceScreen';
import KPIScreen from '../features/kpi_management/screens/KPIScreen';

const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Performance Dashboard' }}
      />
      <Stack.Screen 
        name="Attendance" 
        component={AttendanceScreen} 
        options={{ title: 'Time & Attendance' }}
      />
      <Stack.Screen 
        name="KPI" 
        component={KPIScreen} 
        options={{ title: 'My Goals & KPIs' }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;