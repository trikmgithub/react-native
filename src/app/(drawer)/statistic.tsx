import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  FlatList,
  Platform
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import { DataTable } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';

const StatsDashboard = () => {
  const [statsData, setStatsData] = useState([
    { date: '27/02/2025', revenue: 5200000, orders: 12 },
    { date: '28/02/2025', revenue: 4800000, orders: 10 },
    { date: '29/02/2025', revenue: 6500000, orders: 15 },
    { date: '31/02/2025', revenue: 5800000, orders: 13 },
    { date: '01/02/2025', revenue: 7200000, orders: 18 },
    { date: '02/02/2025', revenue: 6900000, orders: 16 },
    { date: '03/02/2025', revenue: 4500000, orders: 9 },
  ]);

  const [timeRange, setTimeRange] = useState('week');
  const [activeTab, setActiveTab] = useState('revenue');
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0
  });

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const totalRevenue = statsData.reduce((sum, day) => sum + day.revenue, 0);
    const totalOrders = statsData.reduce((sum, day) => sum + day.orders, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setSummaryStats({
      totalRevenue,
      totalOrders,
      averageOrderValue
    });
  }, [statsData]);

  // Format số tiền VND
  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = {
    labels: statsData.map(item => item.date.substring(0, 5)),
    datasets: [
      {
        data: activeTab === 'revenue' 
          ? statsData.map(item => item.revenue / 1000000) 
          : statsData.map(item => item.orders)
      }
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thống kê</Text>
          <View style={styles.pickerContainer}>
            <Icon name="calendar" size={16} color="#333" style={styles.pickerIcon} />
            <Picker
              selectedValue={timeRange}
              onValueChange={(itemValue) => setTimeRange(itemValue)}
              style={styles.picker}
              mode="dropdown"
              dropdownIconColor="#333"
            >
              <Picker.Item label="7 ngày" value="week" />
              <Picker.Item label="30 ngày" value="month" />
              <Picker.Item label="Quý" value="quarter" />
              <Picker.Item label="Năm" value="year" />
            </Picker>
          </View>
        </View>

        {/* Thống kê tổng quan */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Tổng doanh thu</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summaryStats.totalRevenue)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Tổng đơn hàng</Text>
            <Text style={styles.summaryValue}>{summaryStats.totalOrders}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Giá trị đơn trung bình</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summaryStats.averageOrderValue)}</Text>
          </View>
        </View>

        {/* Tabs cho biểu đồ */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'revenue' && styles.activeTab]}
            onPress={() => setActiveTab('revenue')}
          >
            <Text style={[styles.tabText, activeTab === 'revenue' && styles.activeTabText]}>Doanh thu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'orders' && styles.activeTab]}
            onPress={() => setActiveTab('orders')}
          >
            <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>Số đơn hàng</Text>
          </TouchableOpacity>
        </View>

        {/* Biểu đồ */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>
            {activeTab === 'revenue' ? 'Doanh thu theo ngày' : 'Số đơn hàng theo ngày'}
          </Text>
          {activeTab === 'revenue' ? (
            <LineChart
              data={chartData}
              width={screenWidth - 32}
              height={180}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(71, 117, 234, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 8
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '1.5',
                  stroke: '#4775EA'
                },
                // Tối ưu cho màn hình nhỏ
                propsForLabels: {
                  fontSize: 8,
                },
                formatYLabel: (value) => value.toString(),
              }}
              bezier
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix="M"
              withInnerLines={false}
              withOuterLines={true}
            />
          ) : (
            <BarChart
              data={chartData}
              width={screenWidth - 32}
              height={180}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(131, 202, 157, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 8
                },
                // Tối ưu cho màn hình nhỏ
                barPercentage: 0.6,
                propsForLabels: {
                  fontSize: 8,
                },
              }}
              style={styles.chart}
              withInnerLines={false}
              showBarTops={false}
              fromZero
            />
          )}
        </View>

        {/* Bảng thống kê chi tiết */}
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>Thống kê chi tiết theo ngày</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <DataTable style={styles.dataTable}>
              <DataTable.Header>
                <DataTable.Title style={styles.dateColumn}>Ngày</DataTable.Title>
                <DataTable.Title numeric style={styles.dataColumn}>Doanh thu</DataTable.Title>
                <DataTable.Title numeric style={styles.smallColumn}>Đơn</DataTable.Title>
                <DataTable.Title numeric style={styles.dataColumn}>TB/đơn</DataTable.Title>
              </DataTable.Header>

              {statsData.map((item, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell style={styles.dateColumn}>{item.date}</DataTable.Cell>
                  <DataTable.Cell numeric style={styles.dataColumn}>
                    {formatCurrency(item.revenue).replace('₫', '').replace('.', ',')}
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={styles.smallColumn}>{item.orders}</DataTable.Cell>
                  <DataTable.Cell numeric style={styles.dataColumn}>
                    {formatCurrency(item.revenue / item.orders).replace('₫', '').replace('.', ',')}
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  pickerIcon: {
    paddingLeft: 6,
  },
  picker: {
    width: Platform.OS === 'android' ? 110 : 120,
    height: 36,
    marginRight: Platform.OS === 'android' ? -8 : 0,
    fontSize: 12,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 4,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4775EA',
  },
  tabText: {
    color: '#333',
    fontSize: 12,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  chartCard: {
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
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chart: {
    marginVertical: 6,
    borderRadius: 8,
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
  dataTable: {
    minWidth: '100%',
  },
  dateColumn: {
    width: 70,
  },
  dataColumn: {
    width: 100,
  },
  smallColumn: {
    width: 50,
  },
});

export default StatsDashboard;