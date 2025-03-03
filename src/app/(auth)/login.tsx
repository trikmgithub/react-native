
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TextInput, ActivityIndicator, Button } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');

    const handleSubmit = async () => {
        setLoading(true);
        setResponseMessage('');

        const data = {
            email,
            password
        };

        try {
          const response = await fetch('http:///10.0.2.2:8000/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
    
          const result = await response.json();

          if (result.status === 200) {
            setResponseMessage(result.message)
            router.replace('/(drawer)')
          } else {
            setResponseMessage(result.message)
          }
        } catch (error: any) {
            setResponseMessage(`Error: ${error.message}`)
        }
    }


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
  }
});
