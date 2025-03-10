import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert, Platform, ScrollView, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MyLocationScreen() {
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    // Gọi hàm lấy vị trí khi component mount
    getLocationAsync();
  }, []);

  const getLocationAsync = async () => {
    try {
      setLoading(true);
      setError(null);

      // Kiểm tra quyền truy cập vị trí
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Quyền truy cập vị trí bị từ chối');
        setLoading(false);
        return;
      }

      // Lấy vị trí với chế độ chính xác cao và cố gắng ưu tiên GPS
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation, // Sử dụng độ chính xác cao nhất có thể
        mayShowUserSettingsDialog: true, // Hiển thị hộp thoại cài đặt người dùng nếu cần
        timeInterval: 5000, // Đợi tối đa 5 giây để lấy vị trí chính xác
      });

      console.log('Vị trí hiện tại:', currentLocation);
      setAccuracy(currentLocation.coords.accuracy);

      // Cập nhật state với vị trí mới
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      // Lưu vị trí vào AsyncStorage
      await AsyncStorage.setItem('userLocation', JSON.stringify({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      }));

      // Lấy địa chỉ từ tọa độ - sử dụng tùy chọn ngôn ngữ tiếng Việt
      try {
        let addressResponse = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (addressResponse && addressResponse.length > 0) {
          const addressDetails = addressResponse[0];
          const formattedAddress = [
            addressDetails.name,
            addressDetails.street,
            addressDetails.district,
            addressDetails.city,
            addressDetails.region,
            addressDetails.postalCode,
            addressDetails.country
          ].filter(Boolean).join(', ');
          
          setAddress(formattedAddress);
        }
      } catch (addrError) {
        console.error('Lỗi khi lấy địa chỉ:', addrError);
      }
    } catch (err: any) {
      console.error('Lỗi khi lấy vị trí:', err);
      setError(`Lỗi khi lấy vị trí: ${err.message}`);
      
      // Cố gắng lấy vị trí đã lưu nếu không lấy được vị trí mới
      try {
        const storedLocation = await AsyncStorage.getItem('userLocation');
        if (storedLocation) {
          setLocation(JSON.parse(storedLocation));
          setError('Không thể cập nhật vị trí mới. Đang hiển thị vị trí đã lưu trước đó.');
        }
      } catch (storageErr) {
        console.error('Lỗi khi đọc vị trí đã lưu:', storageErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = () => {
    Alert.alert(
      'Cập nhật vị trí',
      'Bạn muốn cập nhật vị trí hiện tại?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Cập nhật',
          onPress: getLocationAsync
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Vị trí hiện tại của bạn</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Đang xác định vị trí...</Text>
          </View>
        ) : error && !location ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Thử lại" onPress={getLocationAsync} />
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {location && (
              <>
                <View style={styles.mapContainer}>
                  <MapView
                    ref={mapRef}
                    style={styles.map}
                    region={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                      }}
                      title="Vị trí của bạn"
                    />
                  </MapView>
                </View>
                
                <View style={styles.infoContainer}>
                  <Text style={styles.coordsText}>
                    Vĩ độ: {location.latitude.toFixed(6)}
                  </Text>
                  <Text style={styles.coordsText}>
                    Kinh độ: {location.longitude.toFixed(6)}
                  </Text>
                  
                  {accuracy !== null && (
                    <Text style={styles.accuracyText}>
                      Độ chính xác: {accuracy < 20 ? 'cao' : accuracy < 100 ? 'trung bình' : 'thấp'} ({accuracy.toFixed(1)} mét)
                    </Text>
                  )}
                  
                  {address ? (
                    <Text style={styles.addressText}>Địa chỉ: {address}</Text>
                  ) : (
                    <Text style={styles.addressText}>Đang lấy thông tin địa chỉ...</Text>
                  )}
                  
                  {error && (
                    <Text style={styles.warningText}>{error}</Text>
                  )}
                </View>
                
                <View style={styles.buttonContainer}>
                  <Button 
                    title="Cập nhật vị trí" 
                    onPress={refreshLocation}
                  />
                  <View style={styles.buttonSpacer} />
                </View>

              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40, // Thêm padding để tránh nội dung bị che khuất
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  contentContainer: {
    width: '100%',
  },
  mapContainer: {
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coordsText: {
    fontSize: 16,
    marginBottom: 5,
  },
  accuracyText: {
    fontSize: 16,
    marginVertical: 5,
    fontWeight: '500',
    color: '#0066cc',
  },
  addressText: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  warningText: {
    fontSize: 14,
    color: 'orange',
    marginTop: 10,
  },
  errorContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  buttonSpacer: {
    height: 10,
  },
  helpContainer: {
    backgroundColor: '#e6f7ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    marginBottom: 5,
    lineHeight: 20,
  }
});