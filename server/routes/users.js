import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Package from '../models/Package.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('badges')
      .populate('achievements');

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('phone').optional().matches(/^\+?[\d\s\-\(\)]+$/),
  body('location').optional().isObject(),
  body('preferences').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { firstName, lastName, phone, location, preferences } = req.body;
    const updateData = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (preferences) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'Internal server error'
    });
  }
});

// Get user's packages
router.get('/packages', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = { isActive: true };
    
    // Filter by user's packages (delivered to or returned by)
    query.$or = [
      { 'delivery.customerId': req.user._id },
      { 'return.returnedBy': req.user._id }
    ];

    if (status) query.status = status;

    const packages = await Package.find(query)
      .populate('delivery.customerId', 'username firstName lastName')
      .populate('return.returnedBy', 'username firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Package.countDocuments(query);

    res.json({
      packages,
      pagination: {
        currentPage: page * 1,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit * 1
      }
    });

  } catch (error) {
    console.error('Get user packages error:', error);
    res.status(500).json({
      error: 'Failed to fetch packages',
      message: 'Internal server error'
    });
  }
});

// Get user's token transactions
router.get('/tokens/transactions', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      transactions: user.achievements,
      summary: {
        totalEarned: user.totalTokensEarned,
        totalSpent: user.totalTokensSpent,
        currentBalance: user.tokenBalance
      }
    });

  } catch (error) {
    console.error('Get token transactions error:', error);
    res.status(500).json({
      error: 'Failed to fetch token transactions',
      message: 'Internal server error'
    });
  }
});

// Spend tokens (for redemptions)
router.post('/tokens/spend', [
  body('amount').isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { amount, reason = 'Redemption' } = req.body;

    const user = await User.findById(req.user._id);
    
    try {
      await user.spendTokens(amount, reason);
      
      res.json({
        message: 'Tokens spent successfully',
        newBalance: user.tokenBalance,
        amountSpent: amount
      });
    } catch (error) {
      res.status(400).json({
        error: 'Insufficient tokens',
        message: error.message
      });
    }

  } catch (error) {
    console.error('Spend tokens error:', error);
    res.status(500).json({
      error: 'Failed to spend tokens',
      message: 'Internal server error'
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'users', limit = 10 } = req.query;

    let leaderboard;

    if (type === 'cities') {
      leaderboard = await User.getTopCities();
    } else {
      leaderboard = await User.getLeaderboard(limit);
    }

    res.json({
      leaderboard,
      type,
      count: leaderboard.length
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch leaderboard',
      message: 'Internal server error'
    });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get user's package statistics
    const packageStats = await Package.aggregate([
      {
        $match: {
          $or: [
            { 'delivery.customerId': user._id },
            { 'return.returnedBy': user._id }
          ],
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalPackages: { $sum: 1 },
          returnedPackages: { $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] } },
          totalCarbonSaved: { $sum: '$analytics.environmentalImpact.carbonSaved' },
          totalPlasticReduced: { $sum: '$analytics.environmentalImpact.plasticReduced' }
        }
      }
    ]);

    const stats = packageStats[0] || {
      totalPackages: 0,
      returnedPackages: 0,
      totalCarbonSaved: 0,
      totalPlasticReduced: 0
    };

    res.json({
      user: {
        tokenBalance: user.tokenBalance,
        totalTokensEarned: user.totalTokensEarned,
        totalTokensSpent: user.totalTokensSpent,
        packagesReturned: user.packagesReturned,
        packagesTracked: user.packagesTracked,
        carbonSaved: user.carbonSaved,
        plasticReduced: user.plasticReduced,
        sustainabilityScore: user.sustainabilityScore,
        badges: user.badges.length,
        achievements: user.achievements.length
      },
      packages: stats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch user statistics',
      message: 'Internal server error'
    });
  }
});

// Get all users (admin only)
router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    const query = { isActive: true };
    
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: page * 1,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit * 1
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: 'Internal server error'
    });
  }
});

// Get user by ID (admin only)
router.get('/:userId', requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password')
      .populate('badges')
      .populate('achievements');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No user found with the provided ID'
      });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      message: 'Internal server error'
    });
  }
});

// Update user (admin only)
router.put('/:userId', requireRole(['admin']), [
  body('role').optional().isIn(['customer', 'seller', 'logistics', 'admin']),
  body('isActive').optional().isBoolean(),
  body('isVerified').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { userId } = req.params;
    const { role, isActive, isVerified } = req.body;

    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No user found with the provided ID'
      });
    }

    res.json({
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: 'Internal server error'
    });
  }
});

export default router; 