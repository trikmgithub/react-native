import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { SectionList, Text, View, StyleSheet, Button } from "react-native";

export default function OrderLayout() {
  const [orders, setOrders] = useState<{ data: any[] }[]>([]);
  const [totalOrderPrice, setTotalOrderPrice] = useState(0);
  const [pay, setPay] = useState(false);
  useEffect(() => {
    fetchOrders();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  useEffect(() => {
    fetchOrders();
    setOrders([]);
  }, [pay]); // 

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://10.0.2.2:8000/orders/get/Table1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.status === 200) {
        const groupedProducts = data.order.products.reduce((acc: any, product: any) => {
          const existingProduct = acc.find((p: any) => p._id === product._id);
          if (existingProduct) {
            existingProduct.quantity += 1;
            existingProduct.totalPrice = existingProduct.quantity * existingProduct.price;
          } else {
            acc.push({ ...product, quantity: 1, totalPrice: product.price });
          }
          return acc;
        }, []);

        const totalPrice = groupedProducts.reduce((sum: number, product: any) => sum + product.totalPrice, 0);
        setTotalOrderPrice(totalPrice);
        setOrders([{ data: groupedProducts }]);
      }
      console.log('>>>>>: ', orders);
    } catch (error) {
      console.error('Error fetching orders: ', error);
    }
  };

  const handlePay = async() => {
    console.log('iii')
    const response = await fetch('http://10.0.2.2:8000/orders/delete/Table1', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();

    if (data.status === 200) {
      setPay((prev) => !prev);
      setTotalOrderPrice(0)
      router.replace('/(tabs)');
    }
  }

  return (
    <View style={styles.container}>
      
      <SectionList
        sections={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text>Description: {item.description}</Text>
            <Text>Price: ${item.price}</Text>
            <Text>Quantity: {item.quantity}</Text>
            <Text>Total Price: ${item.totalPrice}</Text>
          </View>
        )}
      />
      <Text style={styles.totalPrice}>Total Order Price: ${totalOrderPrice}</Text>
      
      <Button
        title="Pay"
        onPress={handlePay}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  itemContainer: {
    backgroundColor: "white",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
});
