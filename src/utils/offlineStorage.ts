/**
  * Simple utility to handle data caching for offline mode
 */

// Store data in localStorage
export const saveToCache = (key: string, data: any) => {
  try {
    localStorage.setItem(`patientflow_${key}`, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to cache:', error);
    return false;
  }
};

// Retrieve data from localStorage
export const getFromCache = (key: string) => {
  try {
    const data = localStorage.getItem(`patientflow_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving from cache:', error);
    return null;
  }
};

// Check if we're currently offline
export const isOffline = () => {
  return !navigator.onLine;
};

// Generate a temporary ID for offline operations
export const generateTempId = () => {
  return 'temp_' + Math.random().toString(36).substring(2, 15);
};
 