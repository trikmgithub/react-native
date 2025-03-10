import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator,
  FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HistoryLocationLogin = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Get user email from AsyncStorage when component mounts
    const getUserEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('userEmail');
        if (storedEmail) {
          setUserEmail(storedEmail);
          fetchLocationHistory(storedEmail);
        } else {
          setError('User email not found. Please login again.');
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to retrieve user information');
        setLoading(false);
        console.error('Error retrieving user email:', err);
      }
    };
    
    getUserEmail();
  }, []);

  const fetchLocationHistory = async (email: any) => {
    try {
      setLoading(true);
      // Using 10.0.2.2 instead of localhost for Android emulator
      // This IP is the special alias to your host machine from the Android emulator
      const response = await fetch(`http://10.0.2.2:8000/users/getLocation/${email}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch location history');
      }
      
      const data = await response.json();
      setLocations(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching location history:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderLocationItem = ({ item }: { item: string }) => (
    <View style={styles.locationItem}>
      <Text style={styles.locationText}>{item}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4775EA" />
          <Text style={styles.loadingText}>Loading location history...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.tableCard}>
            <Text style={styles.tableTitle}>Lịch sử truy cập của {userEmail}</Text>
            {locations.length === 0 ? (
              <Text style={styles.noDataText}>Không có lịch sử truy cập</Text>
            ) : (
              <FlatList
                data={locations}
                renderItem={renderLocationItem}
                keyExtractor={(item, index) => `location-${index}`}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  tableCard: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 12,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 2,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  locationItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationText: {
    fontSize: 14,
  },
  noDataText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
});

export default HistoryLocationLogin;