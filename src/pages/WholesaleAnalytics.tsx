
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BarChart3, TrendingUp, DollarSign, Package, Users, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const WholesaleAnalytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState({
    monthlyRevenue: [],
    topProducts: [],
    orderTrends: [],
    retailerDistribution: []
  });

  useEffect(() => {
    if (!user || user.role !== 'wholesale') {
      navigate('/login');
      return;
    }

    // Generate sample analytics data
    const monthlyRevenue = [
      { month: 'Jan', revenue: 2400000, orders: 45 },
      { month: 'Feb', revenue: 2800000, orders: 52 },
      { month: 'Mar', revenue: 3200000, orders: 61 },
      { month: 'Apr', revenue: 2900000, orders: 48 },
      { month: 'May', revenue: 3600000, orders: 68 },
      { month: 'Jun', revenue: 4100000, orders: 75 }
    ];

    const topProducts = [
      { name: 'Paracetamol 500mg', sold: 5000, revenue: 125000000 },
      { name: 'Amoxicillin 250mg', sold: 2400, revenue: 108000000 },
      { name: 'Insulin Injection', sold: 800, revenue: 96000000 },
      { name: 'Ibuprofen 400mg', sold: 3200, revenue: 70400000 },
      { name: 'Cough Syrup', sold: 1800, revenue: 54000000 }
    ];

    const orderTrends = [
      { period: 'Week 1', orders: 18, value: 2400000 },
      { period: 'Week 2', orders: 22, value: 2800000 },
      { period: 'Week 3', orders: 19, value: 2600000 },
      { period: 'Week 4', orders: 25, value: 3200000 }
    ];

    const retailerDistribution = [
      { category: 'Independent Pharmacies', count: 12, value: 45 },
      { category: 'Chain Pharmacies', count: 8, value: 35 },
      { category: 'Hospital Pharmacies', count: 5, value: 20 }
    ];

    setAnalyticsData({
      monthlyRevenue,
      topProducts,
      orderTrends,
      retailerDistribution
    });
  }, [user, navigate]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const totalRevenue = analyticsData.monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0);
  const totalOrders = analyticsData.monthlyRevenue.reduce((sum, month) => sum + month.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalRetailers = analyticsData.retailerDistribution.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Business Analytics</h1>
          <p className="text-gray-600 text-lg">Track performance and business insights</p>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Revenue (6M)</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">TZS {totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-blue-200">+12% from last period</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalOrders}</div>
              <p className="text-xs text-green-200">+8% from last period</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Avg Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">TZS {avgOrderValue.toLocaleString()}</div>
              <p className="text-xs text-purple-200">+3% from last period</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Active Retailers</CardTitle>
              <Users className="h-4 w-4 text-orange-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalRetailers}</div>
              <p className="text-xs text-orange-200">+2 new this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Revenue Trend */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value) => [`TZS ${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Trends */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Order Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.orderTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Top Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topProducts.map((product, index) => (
                  <div key={product.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sold.toLocaleString()} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">TZS {product.revenue.toLocaleString()}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <span>#{index + 1}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Retailer Distribution */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Retailer Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.retailerDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, value }) => `${category}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.retailerDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {analyticsData.retailerDistribution.map((item, index) => (
                  <div key={item.category} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{item.category}</span>
                    </div>
                    <span className="text-sm font-medium">{item.count} retailers</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WholesaleAnalytics;
