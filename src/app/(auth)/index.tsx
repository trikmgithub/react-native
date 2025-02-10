
import { Link } from 'expo-router';
import { Text, View, StyleSheet, ImageBackground, Button } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import bg from '@/assets/auth/welcome-background.png';
import { useRouter } from "expo-router";


export default function Index() {
  const router = useRouter();
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ImageBackground source={bg} resizeMode="cover" style={styles.image}>
          <View style={styles.wrapper}>
            <View>
              <Text style={styles.title}>POS - Foods</Text>
            </View>
            <View style={styles.button}>
              <Button title="Login" onPress={() => router.push("/login")} />
            </View>
            <View style={styles.button}>
              <Button title="Register" onPress={() => router.push("/register")} />
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
  </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    image: {
      flex: 1,
      justifyContent: 'center',
    },
    wrapper: {
      gap: 20
    },
    title: {
      margin: 'auto',
      fontSize: 20,
      fontWeight: 800
    },
    button: {
      width: 100,
      margin: 'auto'
    }
  });
  
