import express from 'express';
import { auth } from '../middleware/auth.js';
import Analytics from '../models/Analytics.js';
import DataRecord from '../models/DataRecord.js';
import { startOfDay, startOfWeek, startOfMonth, subDays, subWeeks, subMonths } from 'date-fns';

const router = express.Router();

// Get dashboard metrics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { period = 'monthly', timeframe = '6' } = req.query;
    
    // Get current period metrics
    const currentMetrics = await getCurrentPeriodMetrics(req.userId, period);
    
    // Get historical data for charts
    const historicalData = await getHistoricalData(req.userId, period, parseInt(timeframe));
    
    // Calculate growth rates
    const growthRates = await calculateGrowthRates(req.userId, period);
    
    // Get top performing categories/products
    const topCategories = await getTopCategories(req.userId);
    
    res.json({
      currentMetrics,
      historicalData,
      growthRates,
      topCategories,
      period,
      timeframe
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

// Generate analytics for a specific period
router.post('/generate/:period', auth, async (req, res) => {
  try {
    const { period } = req.params;
    const validPeriods = ['daily', 'weekly', 'monthly'];
    
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ message: 'Invalid period' });
    }

    await generateAnalytics(req.userId, period);
    
    res.json({ message: `${period} analytics generated successfully` });
  } catch (error) {
    console.error('Generate analytics error:', error);
    res.status(500).json({ message: 'Server error generating analytics' });
  }
});

// Get revenue trends
router.get('/revenue-trends', auth, async (req, res) => {
  try {
    const { period = 'daily', days = 30 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const trends = await Analytics.find({
      userId: req.userId,
      period,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    res.json({ trends });
  } catch (error) {
    console.error('Revenue trends error:', error);
    res.status(500).json({ message: 'Server error fetching revenue trends' });
  }
});

// Helper functions
async function getCurrentPeriodMetrics(userId, period) {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'daily':
      startDate = startOfDay(now);
      break;
    case 'weekly':
      startDate = startOfWeek(now);
      break;
    case 'monthly':
      startDate = startOfMonth(now);
      break;
    default:
      startDate = startOfMonth(now);
  }
  
  const analytics = await Analytics.findOne({
    userId,
    period,
    date: startDate
  });
  
  if (analytics) {
    return analytics.metrics;
  }
  
  // If no analytics record exists, generate it
  await generateAnalytics(userId, period, startDate);
  
  const newAnalytics = await Analytics.findOne({
    userId,
    period,
    date: startDate
  });
  
  return newAnalytics ? newAnalytics.metrics : getDefaultMetrics();
}

async function getHistoricalData(userId, period, timeframe) {
  const endDate = new Date();
  let startDate;
  
  switch (period) {
    case 'daily':
      startDate = subDays(endDate, timeframe);
      break;
    case 'weekly':
      startDate = subWeeks(endDate, timeframe);
      break;
    case 'monthly':
      startDate = subMonths(endDate, timeframe);
      break;
    default:
      startDate = subMonths(endDate, 6);
  }
  
  const data = await Analytics.find({
    userId,
    period,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
  
  return data.map(item => ({
    date: item.date,
    revenue: item.metrics.totalRevenue,
    orders: item.metrics.totalOrders,
    customers: item.metrics.uniqueCustomers,
    avgOrderValue: item.metrics.avgOrderValue
  }));
}

async function calculateGrowthRates(userId, period) {
  const current = await getCurrentPeriodMetrics(userId, period);
  
  // Get previous period for comparison
  const now = new Date();
  let previousStartDate;
  
  switch (period) {
    case 'daily':
      previousStartDate = subDays(startOfDay(now), 1);
      break;
    case 'weekly':
      previousStartDate = subWeeks(startOfWeek(now), 1);
      break;
    case 'monthly':
      previousStartDate = subMonths(startOfMonth(now), 1);
      break;
    default:
      previousStartDate = subMonths(startOfMonth(now), 1);
  }
  
  const previous = await Analytics.findOne({
    userId,
    period,
    date: previousStartDate
  });
  
  if (!previous) {
    return {
      revenueGrowth: 0,
      customerGrowth: 0,
      orderGrowth: 0
    };
  }
  
  const revenueGrowth = calculatePercentageGrowth(
    current.totalRevenue, 
    previous.metrics.totalRevenue
  );
  
  const customerGrowth = calculatePercentageGrowth(
    current.uniqueCustomers, 
    previous.metrics.uniqueCustomers
  );
  
  const orderGrowth = calculatePercentageGrowth(
    current.totalOrders, 
    previous.metrics.totalOrders
  );
  
  return {
    revenueGrowth,
    customerGrowth,
    orderGrowth
  };
}

async function getTopCategories(userId) {
  const pipeline = [
    { $match: { userId: userId } },
    { $group: {
      _id: '$processedData.category',
      totalRevenue: { $sum: '$processedData.revenue' },
      totalOrders: { $sum: 1 }
    }},
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 }
  ];
  
  const topCategories = await DataRecord.aggregate(pipeline);
  
  return topCategories.map(cat => ({
    category: cat._id || 'Uncategorized',
    revenue: cat.totalRevenue,
    orders: cat.totalOrders
  }));
}

async function generateAnalytics(userId, period, specificDate = null) {
  const now = specificDate || new Date();
  let startDate, endDate;
  
  switch (period) {
    case 'daily':
      startDate = startOfDay(now);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      break;
    case 'weekly':
      startDate = startOfWeek(now);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
      break;
    case 'monthly':
      startDate = startOfMonth(now);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      break;
  }
  
  // Get data for the period
  const dataRecords = await DataRecord.find({
    userId,
    'processedData.date': { $gte: startDate, $lt: endDate }
  });
  
  // Calculate metrics
  const metrics = calculateMetricsFromData(dataRecords);
  
  // Upsert analytics record
  await Analytics.findOneAndUpdate(
    { userId, period, date: startDate },
    { 
      userId,
      period,
      date: startDate,
      metrics
    },
    { upsert: true, new: true }
  );
}

function calculateMetricsFromData(dataRecords) {
  const totalRevenue = dataRecords.reduce((sum, record) => 
    sum + (record.processedData.revenue || 0), 0);
  
  const totalOrders = dataRecords.length;
  
  const uniqueCustomers = new Set(dataRecords.map(record => 
    record.processedData.customerId)).size;
  
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Calculate new vs returning customers (simplified)
  const customerCounts = {};
  dataRecords.forEach(record => {
    const customerId = record.processedData.customerId;
    customerCounts[customerId] = (customerCounts[customerId] || 0) + 1;
  });
  
  const newCustomers = Object.values(customerCounts).filter(count => count === 1).length;
  const returningCustomers = uniqueCustomers - newCustomers;
  
  return {
    totalRevenue,
    totalOrders,
    uniqueCustomers,
    avgOrderValue,
    newCustomers,
    returningCustomers,
    conversionRate: 0, // Would need additional data to calculate
    churnRate: 0 // Would need historical customer data
  };
}

function calculatePercentageGrowth(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function getDefaultMetrics() {
  return {
    totalRevenue: 0,
    totalOrders: 0,
    uniqueCustomers: 0,
    avgOrderValue: 0,
    newCustomers: 0,
    returningCustomers: 0,
    conversionRate: 0,
    churnRate: 0
  };
}

export default router;