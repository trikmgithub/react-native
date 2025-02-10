import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, SectionList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProductList() {
  const [products, setProducts] = useState<{ data: any[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://10.0.2.2:8000/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.status === 200) {
        setProducts([
          {
            data: data.listProduct
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const handleOrder = async (item: any) => {
    console.log(`Order placed for: ${item.name}`);
    
    // Giả sử bạn muốn tạo một đơn hàng chứa sản phẩm này
    const createOrderDto = {
      products: [item._id],  // Đưa vào mảng các ID sản phẩm
      name: 'Table1',        // Tên của đơn hàng
    };
  
    try {
      // Gọi API tạo đơn hàng với fetch
      const response = await fetch('http://10.0.2.2:8000/orders/create', {
        method: 'POST',  // Phương thức là POST
        headers: {
          'Content-Type': 'application/json',  // Đảm bảo rằng chúng ta gửi dữ liệu dưới dạng JSON
        },
        body: JSON.stringify(createOrderDto),  // Dữ liệu gửi đi là một chuỗi JSON
      });
  
      // Kiểm tra nếu phản hồi từ API thành công
      if (response.ok) {
        const data = await response.json();  // Lấy dữ liệu trả về từ API
        console.log('Order created successfully:', data);
      } else {
        console.log('Failed to create order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };
  
  

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={products}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>Description: {item.description}</Text>
              <Text>Price: ${item.price}</Text>
              <Text>Quantity: {item.quantity}</Text>
            </View>
            <TouchableOpacity style={styles.orderButton} onPress={() => handleOrder(item)}>
              <Text style={styles.plusText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  itemInfo: {
    flex: 1, // Để thông tin sản phẩm chiếm hết không gian bên trái
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
});

