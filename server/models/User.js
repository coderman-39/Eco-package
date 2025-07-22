import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    city: String,
    state: String,
    country: { type: String, default: 'India' }
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['customer', 'seller', 'logistics', 'admin'],
    default: 'customer'
  },
  // Token and sustainability metrics
  tokenBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  totalTokensEarned: {
    type: Number,
    default: 0
  },
  totalTokensSpent: {
    type: Number,
    default: 0
  },
  // Package tracking metrics
  packagesReturned: {
    type: Number,
    default: 0
  },
  packagesTracked: {
    type: Number,
    default: 0
  },
  // Environmental impact
  carbonSaved: {
    type: Number,
    default: 0, // in kg
    min: 0
  },
  plasticReduced: {
    type: Number,
    default: 0, // in kg
    min: 0
  },
  // Achievements and badges
  badges: [{
    name: String,
    description: String,
    earnedAt: { type: Date, default: Date.now },
    icon: String
  }],
  achievements: [{
    name: String,
    description: String,
    earnedAt: { type: Date, default: Date.now },
    tokensRewarded: Number
  }],
  // Blockchain wallet
  walletAddress: {
    type: String,
    unique: true,
    sparse: true
  },
  // Account status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      shareData: { type: Boolean, default: true },
      publicProfile: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ walletAddress: 1 });
userSchema.index({ 'location.city': 1 });
userSchema.index({ tokenBalance: -1 });
userSchema.index({ packagesReturned: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for sustainability score
userSchema.virtual('sustainabilityScore').get(function() {
  const baseScore = this.packagesReturned * 10;
  const carbonBonus = this.carbonSaved * 5;
  const plasticBonus = this.plasticReduced * 3;
  return Math.floor(baseScore + carbonBonus + plasticBonus);
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to add tokens
userSchema.methods.addTokens = function(amount, reason = 'Package return') {
  this.tokenBalance += amount;
  this.totalTokensEarned += amount;
  this.achievements.push({
    name: 'Token Earned',
    description: `${reason}: +${amount} tokens`,
    tokensRewarded: amount
  });
  return this.save();
};

// Method to spend tokens
userSchema.methods.spendTokens = function(amount, reason = 'Redemption') {
  if (this.tokenBalance < amount) {
    throw new Error('Insufficient token balance');
  }
  this.tokenBalance -= amount;
  this.totalTokensSpent += amount;
  return this.save();
};

// Method to add package return
userSchema.methods.addPackageReturn = function(carbonSaved = 0.1, plasticReduced = 0.05) {
  this.packagesReturned += 1;
  this.carbonSaved += carbonSaved;
  this.plasticReduced += plasticReduced;
  
  // Check for achievements
  if (this.packagesReturned === 10) {
    this.badges.push({
      name: 'Return Master',
      description: 'Returned 10 packages',
      icon: '🏆'
    });
  }
  
  return this.save();
};

// Static method to get leaderboard
userSchema.statics.getLeaderboard = function(limit = 10) {
  return this.find({ isActive: true })
    .select('username firstName lastName tokenBalance packagesReturned carbonSaved sustainabilityScore location')
    .sort({ sustainabilityScore: -1 })
    .limit(limit);
};

// Static method to get top cities
userSchema.statics.getTopCities = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    { $group: {
      _id: '$location.city',
      totalUsers: { $sum: 1 },
      totalTokens: { $sum: '$tokenBalance' },
      totalReturns: { $sum: '$packagesReturned' },
      totalCarbonSaved: { $sum: '$carbonSaved' }
    }},
    { $sort: { totalReturns: -1 } },
    { $limit: 10 }
  ]);
};

const User = mongoose.model('User', userSchema);

export default User; 