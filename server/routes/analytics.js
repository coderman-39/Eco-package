import express from 'express';
import User from '../models/User.js';
import Package from '../models/Package.js';

const router = express.Router();

// Get overall analytics dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Get user statistics
    const userStats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalTokens: { $sum: '$tokenBalance' },
          totalReturns: { $sum: '$packagesReturned' },
          totalCarbonSaved: { $sum: '$carbonSaved' },
          totalPlasticReduced: { $sum: '$plasticReduced' },
          avgSustainabilityScore: { $avg: '$sustainabilityScore' }
        }
      }
    ]);

    // Get package statistics
    const packageStats = await Package.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalPackages: { $sum: 1 },
          activePackages: { $sum: { $cond: [{ $in: ['$status', ['manufactured', 'dispatched', 'in_transit']] }, 1, 0] } },
          returnedPackages: { $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] } },
          deliveredPackages: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          totalCarbonSaved: { $sum: '$analytics.environmentalImpact.carbonSaved' },
          totalPlasticReduced: { $sum: '$analytics.environmentalImpact.plasticReduced' },
          avgEnvironmentalScore: { $avg: '$environmentalScore' }
        }
      }
    ]);

    // Get recent activity
    const recentActivity = await Package.find({ isActive: true })
      .populate('delivery.customerId', 'username firstName lastName')
      .populate('return.returnedBy', 'username firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(10);

    const userData = userStats[0] || {
      totalUsers: 0,
      totalTokens: 0,
      totalReturns: 0,
      totalCarbonSaved: 0,
      totalPlasticReduced: 0,
      avgSustainabilityScore: 0
    };

    const packageData = packageStats[0] || {
      totalPackages: 0,
      activePackages: 0,
      returnedPackages: 0,
      deliveredPackages: 0,
      totalCarbonSaved: 0,
      totalPlasticReduced: 0,
      avgEnvironmentalScore: 0
    };

    res.json({
      dashboard: {
        users: userData,
        packages: packageData,
        recentActivity: recentActivity.map(pkg => ({
          id: pkg._id,
          packageId: pkg.packageId,
          status: pkg.status,
          updatedAt: pkg.updatedAt,
          customer: pkg.delivery?.customerId ? {
            username: pkg.delivery.customerId.username,
            name: `${pkg.delivery.customerId.firstName} ${pkg.delivery.customerId.lastName}`
          } : null,
          returnedBy: pkg.return?.returnedBy ? {
            username: pkg.return.returnedBy.username,
            name: `${pkg.return.returnedBy.firstName} ${pkg.return.returnedBy.lastName}`
          } : null
        }))
      }
    });

  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard analytics',
      message: 'Internal server error'
    });
  }
});

// Get environmental impact analytics
router.get('/environmental', async (req, res) => {
  try {
    const { period = 'all' } = req.query;

    let dateFilter = {};
    if (period === 'week') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (period === 'month') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    } else if (period === 'year') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } };
    }

    // Get environmental impact by package type
    const impactByType = await Package.aggregate([
      { $match: { isActive: true, ...dateFilter } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalCarbonSaved: { $sum: '$analytics.environmentalImpact.carbonSaved' },
          totalPlasticReduced: { $sum: '$analytics.environmentalImpact.plasticReduced' },
          avgEnvironmentalScore: { $avg: '$environmentalScore' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get environmental impact by location
    const impactByLocation = await Package.aggregate([
      { $match: { isActive: true, ...dateFilter } },
      {
        $group: {
          _id: '$currentLocation.city',
          count: { $sum: 1 },
          totalCarbonSaved: { $sum: '$analytics.environmentalImpact.carbonSaved' },
          totalPlasticReduced: { $sum: '$analytics.environmentalImpact.plasticReduced' }
        }
      },
      { $sort: { totalCarbonSaved: -1 } },
      { $limit: 10 }
    ]);

    // Get sustainability trends
    const sustainabilityTrends = await Package.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          avgEnvironmentalScore: { $avg: '$environmentalScore' },
          totalCarbonSaved: { $sum: '$analytics.environmentalImpact.carbonSaved' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      environmental: {
        impactByType,
        impactByLocation,
        sustainabilityTrends,
        period
      }
    });

  } catch (error) {
    console.error('Get environmental analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch environmental analytics',
      message: 'Internal server error'
    });
  }
});

// Get user engagement analytics
router.get('/engagement', async (req, res) => {
  try {
    // Get user activity by role
    const activityByRole = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          avgTokens: { $avg: '$tokenBalance' },
          avgReturns: { $avg: '$packagesReturned' },
          avgCarbonSaved: { $avg: '$carbonSaved' },
          totalTokens: { $sum: '$tokenBalance' },
          totalReturns: { $sum: '$packagesReturned' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get top performing users
    const topUsers = await User.find({ isActive: true })
      .select('username firstName lastName tokenBalance packagesReturned carbonSaved sustainabilityScore location')
      .sort({ sustainabilityScore: -1 })
      .limit(10);

    // Get user growth over time
    const userGrowth = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Get user retention (users who returned packages)
    const retentionStats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $gt: ['$packagesReturned', 0] }, 1, 0] } },
          avgReturnsPerUser: { $avg: '$packagesReturned' }
        }
      }
    ]);

    res.json({
      engagement: {
        activityByRole,
        topUsers,
        userGrowth,
        retention: retentionStats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          avgReturnsPerUser: 0
        }
      }
    });

  } catch (error) {
    console.error('Get engagement analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch engagement analytics',
      message: 'Internal server error'
    });
  }
});

// Get package lifecycle analytics
router.get('/lifecycle', async (req, res) => {
  try {
    // Get package status distribution
    const statusDistribution = await Package.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get average time in each status
    const avgTimeInStatus = await Package.aggregate([
      { $match: { isActive: true, 'trackingHistory.1': { $exists: true } } },
      {
        $project: {
          packageId: 1,
          trackingHistory: 1,
          totalTime: {
            $subtract: [
              { $arrayElemAt: ['$trackingHistory.timestamp', -1] },
              { $arrayElemAt: ['$trackingHistory.timestamp', 0] }
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTotalTime: { $avg: '$totalTime' },
          minTotalTime: { $min: '$totalTime' },
          maxTotalTime: { $max: '$totalTime' }
        }
      }
    ]);

    // Get package reuse statistics
    const reuseStats = await Package.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalPackages: { $sum: 1 },
          reusedPackages: { $sum: { $cond: [{ $gt: ['$analytics.reuseCount', 0] }, 1, 0] } },
          avgReuseCount: { $avg: '$analytics.reuseCount' },
          maxReuseCount: { $max: '$analytics.reuseCount' }
        }
      }
    ]);

    // Get package type performance
    const typePerformance = await Package.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgEnvironmentalScore: { $avg: '$environmentalScore' },
          avgReuseCount: { $avg: '$analytics.reuseCount' },
          totalCarbonSaved: { $sum: '$analytics.environmentalImpact.carbonSaved' }
        }
      },
      { $sort: { avgEnvironmentalScore: -1 } }
    ]);

    res.json({
      lifecycle: {
        statusDistribution,
        avgTimeInStatus: avgTimeInStatus[0] || {
          avgTotalTime: 0,
          minTotalTime: 0,
          maxTotalTime: 0
        },
        reuseStats: reuseStats[0] || {
          totalPackages: 0,
          reusedPackages: 0,
          avgReuseCount: 0,
          maxReuseCount: 0
        },
        typePerformance
      }
    });

  } catch (error) {
    console.error('Get lifecycle analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch lifecycle analytics',
      message: 'Internal server error'
    });
  }
});

// Get real-time analytics
router.get('/realtime', async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Recent package returns
    const recentReturns = await Package.countDocuments({
      'return.returnedAt': { $gte: oneHourAgo },
      isActive: true
    });

    // Recent user registrations
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: oneDayAgo },
      isActive: true
    });

    // Recent token transactions
    const recentTokens = await User.aggregate([
      { $match: { isActive: true } },
      {
        $project: {
          recentAchievements: {
            $filter: {
              input: '$achievements',
              as: 'achievement',
              cond: { $gte: ['$$achievement.earnedAt', oneDayAgo] }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRecentTokens: { $sum: { $sum: '$recentAchievements.tokensRewarded' } }
        }
      }
    ]);

    // Active packages
    const activePackages = await Package.countDocuments({
      status: { $in: ['manufactured', 'dispatched', 'in_transit'] },
      isActive: true
    });

    res.json({
      realtime: {
        recentReturns,
        recentRegistrations,
        recentTokens: recentTokens[0]?.totalRecentTokens || 0,
        activePackages,
        lastUpdated: now.toISOString()
      }
    });

  } catch (error) {
    console.error('Get realtime analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch realtime analytics',
      message: 'Internal server error'
    });
  }
});

export default router; 