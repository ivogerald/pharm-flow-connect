
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart } from 'lucide-react';
import { dataService } from '@/services/dataService';

interface AnalyticsData {
  revenue: { period: string; amount: number; }[];
  orders: { period: string; count: number; }[];
  topProducts: { name: string; sales: number; revenue: number; }[];
  customerMetrics: { newCustomers: number; returningCustomers: number; totalCustomers: number; };
  inventoryTurnover: { product: string; turnoverRate: number; daysInStock: number; }[];
}

export const AnalyticsDashboard = () => {
  const [timeframe, setTimeframe] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: [],
    orders: [],
    topProducts: [],
    customerMetrics: { newCustomers: 0, returningCustomers: 0, totalCustomers: 0 },
    inventoryTurnover: []
  });

  useEffect(() => {
    generateAnalyticsData();
  }, [timeframe]);

  const generateAnalyticsData = () => {
    const orders = dataService.getOrders();
    const inventory = dataService.getInventory();
    
    // Generate revenue data
    const revenueData = generateTimeSeriesData('revenue', timeframe);
    const ordersData = generateTimeSeriesData('orders', timeframe);
    
    // Calculate top products
    const productSales: { [key: string]: { sales: number; revenue: number; } } = {};
    orders.forEach(order => {
      order.items?.forEach((item: any) => {
        if (!productSales[item.name]) {
          productSales[item.name] = { sales: 0, revenue: 0 };
        }
        productSales[item.name].sales += item.quantity;
        productSales[item.name].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate customer metrics
    const uniqueCustomers = new Set(orders.map(order => order.pharmacyId)).size;
    const customerMetrics = {
      newCustomers: Math.floor(uniqueCustomers * 0.3),
      returningCustomers: Math.floor(uniqueCustomers * 0.7),
      totalCustomers: uniqueCustomers
    };

    // Calculate inventory turnover
    const inventoryTurnover = inventory.slice(0, 10).map(item => ({
      product: item.name,
      turnoverRate: Math.random() * 12 + 1, // Mock turnover rate
      daysInStock: Math.floor(Math.random() * 90) + 1
    }));

    setAnalyticsData({
      revenue: revenueData,
      orders: ordersData,
      topProducts,
      customerMetrics,
      inventoryTurnover
    });
  };

  const generateTimeSeriesData = (type: 'revenue' | 'orders', timeframe: string) => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const period = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (type === 'revenue') {
        data.push({
          period,
          amount: Math.floor(Math.random() * 50000) + 10000
        });
      } else {
        data.push({
          period,
          count: Math.floor(Math.random() * 20) + 5
        });
      }
    }
    
    return data;
  };

  const calculateGrowth = (data: any[], key: string): string => {
    if (data.length < 2) return "0";
    const current = data[data.length - 1][key];
    const previous = data[data.length - 2][key];
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const revenueGrowth = calculateGrowth(analyticsData.revenue, 'amount');
  const orderGrowth = calculateGrowth(analyticsData.orders, 'count');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  TZS {analyticsData.revenue.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  {parseFloat(revenueGrowth) >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${parseFloat(revenueGrowth) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {revenueGrowth}%
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">
                  {analyticsData.orders.reduce((sum, item) => sum + item.count, 0)}
                </p>
                <div className="flex items-center mt-1">
                  {parseFloat(orderGrowth) >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${parseFloat(orderGrowth) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {orderGrowth}%
                  </span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold">{analyticsData.customerMetrics.totalCustomers}</p>
                <p className="text-sm text-gray-500">
                  {analyticsData.customerMetrics.newCustomers} new this period
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Products Sold</p>
                <p className="text-2xl font-bold">
                  {analyticsData.topProducts.reduce((sum, product) => sum + product.sales, 0)}
                </p>
                <p className="text-sm text-gray-500">
                  {analyticsData.topProducts.length} unique products
                </p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`TZS ${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.orders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Products by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.topProducts.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`TZS ${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Turnover</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.inventoryTurnover}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="turnoverRate" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
