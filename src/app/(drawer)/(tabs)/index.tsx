import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  SectionList, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';

const { width } = Dimensions.get('window');
// Make flash sale item smaller - reduced from 60% to 45% of screen width
const FLASH_SALE_ITEM_WIDTH = width * 0.45;

export default function ProductList() {
  const [products, setProducts] = useState<{ data: any[] }[]>([]);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({
    hours: 5,
    minutes: 30,
    seconds: 22
  });
  
  // Ref for flash sale scroll view to implement auto-scrolling
  const flashSaleScrollRef = useRef<ScrollView>(null);
  // Current scroll position index
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);

  useEffect(() => {
    fetchProducts();
    
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              // Timer ends, reset to some value or handle end of flash sale
              clearInterval(timer);
              return { hours: 0, minutes: 0, seconds: 0 };
            }
          }
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Auto-scrolling for flash sale items
  useEffect(() => {
    if (flashSales.length > 0) {
      const scrollInterval = setInterval(() => {
        // Calculate next scroll index
        const nextIndex = (currentScrollIndex + 1) % flashSales.length;
        setCurrentScrollIndex(nextIndex);
        
        // Scroll to the next item
        flashSaleScrollRef.current?.scrollTo({
          x: nextIndex * (FLASH_SALE_ITEM_WIDTH + 16), // Width + margin
          animated: true
        });
      }, 3000); // Scroll every 3 seconds
      
      return () => clearInterval(scrollInterval);
    }
  }, [flashSales, currentScrollIndex]);

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
        // Giả định: 3 sản phẩm đầu tiên là flash sales
        const allProducts = data.listProduct || [];
        const flashSaleItems = allProducts.slice(0, 3).map(item => ({
          ...item,
          discountPercent: Math.floor(Math.random() * 30) + 20 // Random discount 20-50%
        }));
        
        setFlashSales(flashSaleItems);
        setProducts([
          {
            data: allProducts
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

  const handleOrder = async (item: any, isFlashSale = false) => {
    // Tính giá khuyến mãi nếu là sản phẩm flash sale
    const price = isFlashSale 
      ? item.price * (1 - item.discountPercent / 100) 
      : item.price;
    
    console.log(`Order placed for: ${item.name} at price: ${price.toFixed(2)}`);
    
    const createOrderDto = {
      products: [item._id],
      name: 'Table1',
      price: price, // Thêm giá vào DTO
      isFlashSale: isFlashSale // Đánh dấu đây là đơn hàng flash sale
    };
  
    try {
      const response = await fetch('http://10.0.2.2:8000/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createOrderDto),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Order created successfully:', data);
      } else {
        console.log('Failed to create order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };
  
  const renderFlashSaleItem = (item: any) => {
    const discountedPrice = item.price * (1 - item.discountPercent / 100);
    
    return (
      <View 
        key={item._id} 
        style={styles.flashSaleItem}
      >
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discountPercent}%</Text>
        </View>
        <TouchableOpacity onPress={() => handleOrder(item, true)}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.flashSaleImage} 
            resizeMode="cover"
          />
        </TouchableOpacity>
        <View style={styles.flashSaleInfo}>
          <Text style={styles.flashSaleName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.originalPrice}>${item.price}</Text>
            <Text style={styles.discountedPrice}>${discountedPrice.toFixed(2)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.flashSaleButton}
            onPress={() => handleOrder(item, true)}
          >
            <Text style={styles.flashSaleButtonText}>Mua ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Format the countdown time with leading zeros
  const formatTime = (value: number) => {
    return value < 10 ? `0${value}` : value;
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Main Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Flash Sales Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Flash Sales</Text>
            <Text style={styles.sectionSubtitle}>
              Kết thúc trong {formatTime(countdown.hours)}:{formatTime(countdown.minutes)}:{formatTime(countdown.seconds)}
            </Text>
          </View>
          
          <ScrollView 
            ref={flashSaleScrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flashSalesContainer}
            pagingEnabled={false}
            decelerationRate="fast"
          >
            {flashSales.map(renderFlashSaleItem)}
          </ScrollView>
          
          {/* Pagination indicator dots */}
          <View style={styles.paginationContainer}>
            {flashSales.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.paginationDot, 
                  index === currentScrollIndex ? styles.paginationDotActive : {}
                ]} 
              />
            ))}
          </View>
        </View>
        
        {/* All Products Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tất cả sản phẩm</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {products[0]?.data.map((item) => (
            <View key={item._id} style={styles.productItem}>
              <Image 
                source={{ uri: item.image }} 
                style={styles.productImage} 
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.productBottom}>
                  <Text style={styles.productPrice}>${item.price}</Text>
                  <TouchableOpacity 
                    style={styles.orderButton} 
                    onPress={() => handleOrder(item)}
                  >
                    <Text style={styles.buyText}>Mua</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cartButton: {
    padding: 8,
  },
  cartIcon: {
    fontSize: 24,
  },
  sectionContainer: {
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#FF4500',
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
  },
  flashSalesContainer: {
    paddingVertical: 4, // Reduced from 8 to 4
  },
  flashSaleItem: {
    width: FLASH_SALE_ITEM_WIDTH,
    marginRight: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  flashSaleImage: {
    width: '100%',
    height: 90, // Further reduced height from 120 to 90
    backgroundColor: '#f9f9f9',
  },
  flashSaleInfo: {
    padding: 6, // Further reduced padding from 10 to 6
  },
  flashSaleName: {
    fontSize: 12, // Further reduced font size from 14 to 12
    fontWeight: '600',
    color: '#333',
    marginBottom: 4, // Further reduced margin from 6 to 4
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4, // Further reduced margin from 6 to 4
  },
  originalPrice: {
    fontSize: 12, // Reduced from 14 to 12
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 6, // Reduced from 8 to 6
  },
  discountedPrice: {
    fontSize: 14, // Further reduced from 16 to 14
    fontWeight: 'bold',
    color: '#FF4500',
  },
  flashSaleButton: {
    backgroundColor: '#FF4500',
    paddingVertical: 4, // Further reduced from 6 to 4
    paddingHorizontal: 8, // Further reduced from 10 to 8
    borderRadius: 4, // Reduced from 6 to 4
    alignItems: 'center',
  },
  flashSaleButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12, // Reduced from 14 to 12
  },
  discountBadge: {
    position: 'absolute',
    top: 6, // Reduced from 8 to 6
    left: 6, // Reduced from 8 to 6
    backgroundColor: '#FF4500',
    paddingHorizontal: 6, // Reduced from 8 to 6
    paddingVertical: 3, // Reduced from 4 to 3
    borderRadius: 10, // Reduced from 12 to 10
    zIndex: 1,
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10, // Reduced from 12 to 10
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  productImage: {
    width: 100,
    height: 100,
    backgroundColor: '#f9f9f9',
  },
  productInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  // New pagination indicator styles
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8, // Reduced from 12 to 8
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FF4500',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});