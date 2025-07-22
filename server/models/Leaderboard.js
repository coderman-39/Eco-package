import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['users', 'cities', 'sellers', 'monthly', 'weekly', 'daily'],
    required: true
  },
  period: {
    type: String,
    enum: ['all-time', 'monthly', 'weekly', 'daily'],
    required: true
  },
  entries: [{
    rank: {
      type: Number,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    city: String,
    seller: String,
    score: {
      type: Number,
      required: true,
      default: 0
    },
    metrics: {
      packagesReturned: { type: Number, default: 0 },
      tokensEarned: { type: Number, default: 0 },
      carbonSaved: { type: Number, default: 0 },
      plasticReduced: { type: Number, default: 0 },
      sustainabilityScore: { type: Number, default: 0 }
    },
    badges: [{
      name: String,
      description: String,
      earnedAt: { type: Date, default: Date.now }
    }],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalParticipants: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
leaderboardSchema.index({ type: 1, period: 1 });
leaderboardSchema.index({ 'entries.userId': 1 });
leaderboardSchema.index({ 'entries.rank': 1 });
leaderboardSchema.index({ startDate: 1, endDate: 1 });
leaderboardSchema.index({ isActive: 1 });

// Static method to get current leaderboard
leaderboardSchema.statics.getCurrent = function(type, period = 'all-time') {
  return this.findOne({
    type,
    period,
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  }).populate('entries.userId', 'username firstName lastName avatar');
};

// Static method to update leaderboard
leaderboardSchema.statics.updateLeaderboard = async function(type, period = 'all-time') {
  const User = mongoose.model('User');
  
  let dateFilter = {};
  if (period === 'monthly') {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    dateFilter = { createdAt: { $gte: startOfMonth } };
  } else if (period === 'weekly') {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    dateFilter = { createdAt: { $gte: startOfWeek } };
  } else if (period === 'daily') {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    dateFilter = { createdAt: { $gte: startOfDay } };
  }

  let users;
  if (type === 'users') {
    users = await User.find({ isActive: true, ...dateFilter })
      .select('username firstName lastName avatar tokenBalance packagesReturned carbonSaved plasticReduced sustainabilityScore badges')
      .sort({ sustainabilityScore: -1 })
      .limit(100);
  } else if (type === 'cities') {
    users = await User.aggregate([
      { $match: { isActive: true, ...dateFilter } },
      { $group: {
        _id: '$location.city',
        totalUsers: { $sum: 1 },
        totalReturns: { $sum: '$packagesReturned' },
        totalTokens: { $sum: '$tokenBalance' },
        totalCarbonSaved: { $sum: '$carbonSaved' },
        totalPlasticReduced: { $sum: '$plasticReduced' },
        avgSustainabilityScore: { $avg: '$sustainabilityScore' }
      }},
      { $sort: { totalReturns: -1 } },
      { $limit: 50 }
    ]);
  }

  const entries = users.map((user, index) => ({
    rank: index + 1,
    userId: user._id || user.id,
    city: user.location?.city || user._id,
    score: user.sustainabilityScore || user.totalReturns || 0,
    metrics: {
      packagesReturned: user.packagesReturned || user.totalReturns || 0,
      tokensEarned: user.tokenBalance || user.totalTokens || 0,
      carbonSaved: user.carbonSaved || user.totalCarbonSaved || 0,
      plasticReduced: user.plasticReduced || user.totalPlasticReduced || 0,
      sustainabilityScore: user.sustainabilityScore || user.avgSustainabilityScore || 0
    },
    badges: user.badges || [],
    lastUpdated: new Date()
  }));

  const startDate = new Date();
  const endDate = new Date();
  
  if (period === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (period === 'weekly') {
    endDate.setDate(endDate.getDate() + 7);
  } else if (period === 'daily') {
    endDate.setDate(endDate.getDate() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 100); // Far future for all-time
  }

  // Update or create leaderboard
  await this.findOneAndUpdate(
    { type, period, isActive: true },
    {
      entries,
      startDate,
      endDate,
      totalParticipants: entries.length,
      lastUpdated: new Date()
    },
    { upsert: true, new: true }
  );
};

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

export default Leaderboard; 