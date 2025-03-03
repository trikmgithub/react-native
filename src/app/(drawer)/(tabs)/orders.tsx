import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { 
  SectionList, 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Platform
} from "react-native";

// Get device dimensions
const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

export default function OrderLayout() {
  const [orders, setOrders] = useState<{ data: any[] }[]>([]);
  const [totalOrderPrice, setTotalOrderPrice] = useState(0);
  const [pay, setPay] = useState(false);
  const [loading, setLoading] = useState(true);

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
  }, [pay]);

  const fetchOrders = async () => {
    setLoading(true);
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
    } catch (error) {
      console.error('Error fetching orders: ', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async() => {
    setLoading(true);
    try {
      const response = await fetch('http://10.0.2.2:8000/orders/update/Table1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();

      if (data.status === 200) {
        setPay((prev) => !prev);
        setTotalOrderPrice(0);
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error processing payment: ', error);
    } finally {
      setLoading(false);
    }
  }

  const renderEmptyCart = () => (
    <View style={styles.emptyCartContainer}>
      <Image 
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2037/2037457.png' }} 
        style={styles.emptyCartImage}
      />
      <Text style={styles.emptyCartTitle}>Giỏ hàng trống</Text>
      <Text style={styles.emptyCartText}>Bạn chưa thêm sản phẩm nào vào giỏ hàng.</Text>
      <TouchableOpacity 
        style={styles.continueShopping}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.continueShoppingText}>Tiếp tục mua sắm</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        {item.isFlashSale && (
          <View style={styles.flashSaleBadge}>
            <Text style={styles.flashSaleText}>SALE</Text>
          </View>
        )}
      </View>
      
      <View style={styles.itemContent}>
        <Image 
          source={{ uri: item.image || 'https://via.placeholder.com/80' }}
          style={styles.itemImage}
        />
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
          
          <View style={styles.priceInfo}>
            <View style={styles.priceRow}>
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              <Text style={styles.itemQuantity}>×{item.quantity}</Text>
            </View>
            
            <Text style={styles.itemTotalPrice}>
              ${item.totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đơn hàng của bạn</Text>
        <Text style={styles.headerSubtitle}>Bàn 1</Text>
      </View>
      
      {orders[0]?.data.length > 0 ? (
        <>
          <SectionList
            sections={orders}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Tạm tính</Text>
              <Text style={styles.summaryValue}>${totalOrderPrice.toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Thuế (10%)</Text>
              <Text style={styles.summaryValue}>${(totalOrderPrice * 0.1).toFixed(2)}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalText}>Tổng cộng</Text>
              <Text style={styles.totalValue}>${(totalOrderPrice * 1.1).toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.payButton}
              onPress={handlePay}
              activeOpacity={0.8}
            >
              <Text style={styles.payButtonText}>Thanh toán</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        renderEmptyCart()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 12,
  },
  itemContainer: {
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    paddingRight: 4,
  },
  flashSaleBadge: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  flashSaleText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: "bold",
  },
  itemContent: {
    flexDirection: 'row',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
  },
  itemDetails: {
    marginLeft: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  itemDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    lineHeight: 16,
  },
  priceInfo: {
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 13,
    color: "#333",
  },
  itemQuantity: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
  },
  itemTotalPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FF4500",
    marginTop: 2,
  },
  summaryContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 8,
  },
  totalText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF4500",
  },
  payButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyCartImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyCartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyCartText: {
    fontSize: 14,
    color: "#666",
    textAlign: 'center',
    marginBottom: 20,
  },
  continueShopping: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});