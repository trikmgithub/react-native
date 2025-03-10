import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TextInput, ActivityIndicator, Button } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [locationAddress, setLocationAddress] = useState<string | null>(null);
    const [locationLoading, setLocationLoading] = useState(true);

    useEffect(() => {
        // Get location when component mounts
        getLocationAsync();
    }, []);

    const getLocationAsync = async () => {
        try {
            setLocationLoading(true);
            
            // Check location permissions
            let { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status !== 'granted') {
                console.log('Location permission denied');
                setLocationLoading(false);
                return;
            }

            // Get current location with high accuracy
            let currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.BestForNavigation,
            });

            // Get address from coordinates
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
                    
                    setLocationAddress(formattedAddress);
                }
            } catch (addrError) {
                console.error('Error getting address:', addrError);
            }
        } catch (err) {
            console.error('Error getting location:', err);
        } finally {
            setLocationLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setResponseMessage('');

        // Create an array with the current location
        const loginHistoryLocation = locationAddress ? locationAddress : 'Unknown location';

        const data = {
            email,
            password,
            loginHistoryLocation
        };

        try {
            const response = await fetch('http://10.0.2.2:8000/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
        
            const result = await response.json();

            if (result.status === 200) {
                // Save user email to AsyncStorage after successful login
                try {
                    await AsyncStorage.setItem('userEmail', email);
                    // You might want to store more user info if available in result
                    if (result.userData) {
                        await AsyncStorage.setItem('userData', JSON.stringify(result.userData));
                    }
                } catch (storageError) {
                    console.error('Error saving user data:', storageError);
                }
                
                setResponseMessage(result.message);
                router.replace('/(drawer)');
            } else {
                setResponseMessage(result.message);
            }
        } catch (error: any) {
            setResponseMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text>Email</Text>
            <TextInput
                style={styles.input}
                value={email}
                placeholder='Enter email'
                onChangeText={setEmail}
            />
            <Text>Password</Text>
            <TextInput
                style={styles.input}
                value={password}
                placeholder='Enter password'
                secureTextEntry={true}
                onChangeText={setPassword}
            />

            <Button title="Submit" onPress={handleSubmit}/>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {responseMessage && <Text>{responseMessage}</Text>}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 20
    },
    input: {
        borderWidth: 2,
        borderColor: 'black',
        color: 'black',
        marginTop: 10,
        marginBottom: 20
    },
    text: {
        color: 'black',
    },
    locationText: {
        marginBottom: 20,
        color: 'gray',
        fontStyle: 'italic'
    }
});