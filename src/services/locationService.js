// src/services/locationService.js
import * as Location from 'expo-location';

export const getCurrentPosition = async () => {
  try {
    // Request permissions
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    // Get current location
    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
};

// Optional: Geofencing function to check if user is at workplace
export const isAtWorkplace = async (workplaceCoords, radiusMeters = 100) => {
  try {
    const currentLocation = await getCurrentPosition();
    
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      workplaceCoords.latitude,
      workplaceCoords.longitude
    );

    return distance <= radiusMeters;
  } catch (error) {
    console.error('Error checking workplace location:', error);
    return false;
  }
};

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};