import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform,
  Alert 
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function ExportReceiptScreen() {
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  
  // State để theo dõi các trường đã được chạm vào
  const [touchedFields, setTouchedFields] = useState({
    companyName: false,
    phoneNumber: false,
    address: false
  });

  // Đánh dấu trường đã được chạm vào
  const handleFieldTouch = (field: any) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  // Reset form sau khi xuất hóa đơn
  const resetForm = () => {
    setCompanyName('');
    setPhoneNumber('');
    setAddress('');
    setTouchedFields({
      companyName: false,
      phoneNumber: false,
      address: false
    });
  };

  const validateForm = () => {
    // Yêu cầu tất cả các trường đều phải được nhập
    if (!companyName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên công ty');
      return false;
    }
    
    if (!phoneNumber.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại liên hệ');
      return false;
    }
    
    if (!address.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ');
      return false;
    }
    
    return true;
  };

  // Hàm để xóa đơn hàng sau khi xuất hóa đơn
  const deleteOrder = async (tableName: string) => {
    try {
      // Sửa từ localhost thành 10.0.2.2 cho Android emulator
      const deleteUrl = `http://10.0.2.2:8000/orders/delete/${tableName}`;
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn(`Không thể xóa đơn hàng: ${response.status}`);
      } else {
        console.log(`Đã xóa đơn hàng cho bàn: ${tableName}`);
      }
    } catch (error) {
      console.error('Lỗi khi xóa đơn hàng:', error);
    }
  };

  const exportReceipt = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Tạo đường dẫn tạm thời để lưu file PDF
      const fileUri = `${FileSystem.documentDirectory}hoadon.pdf`;
      
      // Chuẩn bị thông tin khách hàng
      const customerInfo = {
        companyName: companyName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim()
      };
      
      // Tải file PDF từ API với thông tin khách hàng
      const apiUrl = 'http://10.0.2.2:8000/orders/invoice/Table1';
      
      // Tạo request với phương thức POST để gửi thông tin khách hàng
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerInfo),
      });
      
      if (!response.ok) {
        throw new Error(`Lỗi từ server: ${response.status}`);
      }
      
      // Nhận dữ liệu PDF từ response
      const pdfBlob = await response.blob();
      
      // Chuyển Blob thành dữ liệu nhị phân
      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);
      
      reader.onloadend = async () => {
        try {
          // Kiểm tra và chuyển đổi kiểu dữ liệu
          if (typeof reader.result === 'string') {
            const base64Data = reader.result.split(',')[1];
            
            // Ghi dữ liệu base64 vào file local
            await FileSystem.writeAsStringAsync(fileUri, base64Data, {
              encoding: FileSystem.EncodingType.Base64,
            });
            
            // Kiểm tra xem thiết bị có hỗ trợ chia sẻ không
            const isSharingAvailable = await Sharing.isAvailableAsync();
            
            if (isSharingAvailable) {
              // Chia sẻ file PDF
              await Sharing.shareAsync(fileUri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Xem hoặc chia sẻ hóa đơn',
                UTI: 'com.adobe.pdf' // Cho iOS
              });
              
              // Khi đã chia sẻ xong, xóa đơn hàng và reset form
              await deleteOrder('Table1');
              resetForm();
            } else {
              Alert.alert('Thông báo', 'Thiết bị của bạn không hỗ trợ chia sẻ file');
              
              // Vẫn xóa đơn hàng và reset form ngay cả khi không thể chia sẻ
              await deleteOrder('Table1');
              resetForm();
            }
          } else {
            throw new Error('Không thể đọc dữ liệu PDF dưới dạng chuỗi');
          }
        } catch (error) {
          console.error('Lỗi khi xử lý file:', error);
          Alert.alert('Lỗi', 'Không thể xử lý file hóa đơn');
        } finally {
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setLoading(false);
        Alert.alert('Lỗi', 'Không thể đọc dữ liệu hóa đơn');
      };
    } catch (error) {
      console.error('Lỗi khi xuất hóa đơn:', error);
      Alert.alert('Lỗi', 'Không thể tạo hóa đơn: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Xuất hóa đơn</Text>
          <Text style={styles.subtitle}>Vui lòng điền thông tin chi tiết</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tên công ty <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={[
                styles.input,
                touchedFields.companyName && !companyName.trim() ? styles.inputError : null
              ]}
              placeholder="Nhập tên công ty"
              value={companyName}
              onChangeText={setCompanyName}
              onBlur={() => handleFieldTouch('companyName')}
            />
            {touchedFields.companyName && !companyName.trim() && (
              <Text style={styles.errorText}>Vui lòng nhập tên công ty</Text>
            )}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Số điện thoại <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={[
                styles.input,
                touchedFields.phoneNumber && !phoneNumber.trim() ? styles.inputError : null
              ]}
              placeholder="Nhập số điện thoại liên hệ"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              onBlur={() => handleFieldTouch('phoneNumber')}
            />
            {touchedFields.phoneNumber && !phoneNumber.trim() && (
              <Text style={styles.errorText}>Vui lòng nhập số điện thoại</Text>
            )}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Địa chỉ <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={[
                styles.input,
                touchedFields.address && !address.trim() ? styles.inputError : null
              ]}
              placeholder="Nhập địa chỉ"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
              onBlur={() => handleFieldTouch('address')}
            />
            {touchedFields.address && !address.trim() && (
              <Text style={styles.errorText}>Vui lòng nhập địa chỉ</Text>
            )}
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Thông tin hóa đơn</Text>
          <Text style={styles.infoText}>
            • Hóa đơn sẽ được xuất cho bàn: <Text style={styles.highlightText}>Table1</Text>
          </Text>
          <Text style={styles.infoText}>
            • Thông tin của bạn sẽ được hiển thị trên hóa đơn
          </Text>
          <Text style={styles.infoText}>
            • Bạn có thể xem, chia sẻ hoặc lưu file PDF sau khi tạo
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, loading ? styles.buttonDisabled : null]}
          onPress={exportReceipt}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Xuất hóa đơn PDF</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#FF3B30',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
    lineHeight: 20,
  },
  highlightText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  footer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#99c5ff',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});