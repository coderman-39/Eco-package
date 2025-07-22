import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  packageId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  rfidTag: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  nfcTag: {
    type: String,
    unique: true,
    sparse: true
  },
  // Package details
  type: {
    type: String,
    enum: ['cardboard', 'plastic', 'paper', 'fabric', 'composite'],
    required: true
  },
  size: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number
  },
  material: {
    type: String,
    required: true
  },
  sustainability: {
    recyclable: { type: Boolean, default: true },
    biodegradable: { type: Boolean, default: false },
    carbonFootprint: { type: Number, default: 0 }, // in kg CO2
    plasticContent: { type: Number, default: 0 }, // in grams
    recycledContent: { type: Number, default: 0 } // percentage
  },
  // Manufacturing info
  manufacturer: {
    name: String,
    location: String,
    certification: String
  },
  manufacturedAt: {
    type: Date,
    default: Date.now
  },
  // Current status and location
  status: {
    type: String,
    enum: ['manufactured', 'dispatched', 'in_transit', 'delivered', 'returned', 'processing', 'recycled', 'lost'],
    default: 'manufactured'
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    address: String,
    facility: String,
    city: String,
    state: String
  },
  // Tracking history
  trackingHistory: [{
    status: {
      type: String,
      enum: ['manufactured', 'dispatched', 'in_transit', 'delivered', 'returned', 'processing', 'recycled', 'lost']
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number],
      address: String,
      facility: String,
      city: String,
      state: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    iotData: {
      temperature: Number,
      humidity: Number,
      shock: Number,
      light: Number
    }
  }],
  // Delivery information
  delivery: {
    orderId: String,
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: [Number]
    },
    expectedDelivery: Date,
    actualDelivery: Date,
    deliveryAgent: String
  },
  // Return information
  return: {
    returnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    returnedAt: Date,
    returnLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number],
      address: String,
      facility: String
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'damaged'],
      default: 'good'
    },
    tokensAwarded: {
      type: Number,
      default: 5
    },
    carbonSaved: {
      type: Number,
      default: 0.1
    },
    plasticReduced: {
      type: Number,
      default: 0.05
    }
  },
  // IoT sensor data
  iotData: {
    lastUpdate: {
      type: Date,
      default: Date.now
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    signalStrength: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    temperature: Number,
    humidity: Number,
    shock: Number,
    light: Number,
    isOnline: {
      type: Boolean,
      default: true
    }
  },
  // Blockchain information
  blockchain: {
    txHash: String,
    blockNumber: Number,
    gasUsed: Number,
    contractAddress: String,
    isOnChain: {
      type: Boolean,
      default: false
    }
  },
  // Analytics
  analytics: {
    totalDistance: { type: Number, default: 0 }, // in km
    timeInTransit: { type: Number, default: 0 }, // in hours
    reuseCount: { type: Number, default: 0 },
    environmentalImpact: {
      carbonSaved: { type: Number, default: 0 },
      plasticReduced: { type: Number, default: 0 },
      treesEquivalent: { type: Number, default: 0 }
    }
  },
  // Metadata
  tags: [String],
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
packageSchema.index({ packageId: 1 });
packageSchema.index({ rfidTag: 1 });
packageSchema.index({ nfcTag: 1 });
packageSchema.index({ status: 1 });
packageSchema.index({ 'currentLocation.coordinates': '2dsphere' });
packageSchema.index({ 'delivery.customerId': 1 });
packageSchema.index({ 'return.returnedBy': 1 });
packageSchema.index({ manufacturedAt: -1 });
packageSchema.index({ 'blockchain.txHash': 1 });

// Virtual for package age
packageSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.manufacturedAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for environmental score
packageSchema.virtual('environmentalScore').get(function() {
  const baseScore = 50;
  const recyclableBonus = this.sustainability.recyclable ? 20 : 0;
  const biodegradableBonus = this.sustainability.biodegradable ? 15 : 0;
  const recycledContentBonus = this.sustainability.recycledContent * 0.5;
  const carbonPenalty = this.sustainability.carbonFootprint * 10;
  const plasticPenalty = this.sustainability.plasticContent * 0.1;
  
  return Math.max(0, Math.min(100, baseScore + recyclableBonus + biodegradableBonus + recycledContentBonus - carbonPenalty - plasticPenalty));
});

// Pre-save middleware to update tracking history
packageSchema.pre('save', function(next) {
  if (this.isModified('status') || this.isModified('currentLocation')) {
    this.trackingHistory.push({
      status: this.status,
      location: this.currentLocation,
      timestamp: new Date()
    });
  }
  next();
});

// Method to update location
packageSchema.methods.updateLocation = function(location, status = null, scannedBy = null) {
  this.currentLocation = location;
  if (status) this.status = status;
  
  this.trackingHistory.push({
    status: this.status,
    location: this.currentLocation,
    timestamp: new Date(),
    scannedBy: scannedBy
  });
  
  return this.save();
};

// Method to process return
packageSchema.methods.processReturn = function(userId, location, condition = 'good') {
  this.status = 'returned';
  this.return = {
    returnedBy: userId,
    returnedAt: new Date(),
    returnLocation: location,
    condition: condition,
    tokensAwarded: this.calculateReturnReward(condition),
    carbonSaved: this.sustainability.carbonFootprint * 0.8,
    plasticReduced: this.sustainability.plasticContent / 1000
  };
  
  this.analytics.reuseCount += 1;
  this.analytics.environmentalImpact.carbonSaved += this.return.carbonSaved;
  this.analytics.environmentalImpact.plasticReduced += this.return.plasticReduced;
  
  return this.save();
};

// Method to calculate return reward
packageSchema.methods.calculateReturnReward = function(condition) {
  const baseReward = 5;
  const conditionMultiplier = {
    'excellent': 1.5,
    'good': 1.0,
    'fair': 0.7,
    'poor': 0.3,
    'damaged': 0.1
  };
  
  return Math.floor(baseReward * conditionMultiplier[condition] || 1.0);
};

// Method to update IoT data
packageSchema.methods.updateIoTData = function(data) {
  this.iotData = {
    ...this.iotData,
    ...data,
    lastUpdate: new Date()
  };
  
  // Check for offline status
  const timeSinceUpdate = Date.now() - this.iotData.lastUpdate.getTime();
  this.iotData.isOnline = timeSinceUpdate < 24 * 60 * 60 * 1000; // 24 hours
  
  return this.save();
};

// Static method to get packages by status
packageSchema.statics.getByStatus = function(status, limit = 50) {
  return this.find({ status, isActive: true })
    .populate('delivery.customerId', 'username firstName lastName')
    .populate('return.returnedBy', 'username firstName lastName')
    .sort({ updatedAt: -1 })
    .limit(limit);
};

// Static method to get packages near location
packageSchema.statics.getNearLocation = function(coordinates, maxDistance = 10000) {
  return this.find({
    'currentLocation.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  }).limit(50);
};

// Static method to get analytics
packageSchema.statics.getAnalytics = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    { $group: {
      _id: null,
      totalPackages: { $sum: 1 },
      activePackages: { $sum: { $cond: [{ $in: ['$status', ['manufactured', 'dispatched', 'in_transit']] }, 1, 0] } },
      returnedPackages: { $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] } },
      totalCarbonSaved: { $sum: '$analytics.environmentalImpact.carbonSaved' },
      totalPlasticReduced: { $sum: '$analytics.environmentalImpact.plasticReduced' },
      avgEnvironmentalScore: { $avg: '$environmentalScore' }
    }}
  ]);
};

const Package = mongoose.model('Package', packageSchema);

export default Package; 