import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    default: 'Green Token'
  },
  symbol: {
    type: String,
    required: true,
    default: 'GT'
  },
  totalSupply: {
    type: Number,
    required: true,
    default: 1000000
  },
  circulatingSupply: {
    type: Number,
    required: true,
    default: 0
  },
  decimals: {
    type: Number,
    required: true,
    default: 18
  },
  contractAddress: {
    type: String,
    required: true,
    unique: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Token economics
  economics: {
    rewardRate: {
      type: Number,
      default: 5 // tokens per package return
    },
    redemptionRate: {
      type: Number,
      default: 1 // 1 token = 1 rupee equivalent
    },
    inflationRate: {
      type: Number,
      default: 2 // 2% annual inflation
    },
    maxRewardPerDay: {
      type: Number,
      default: 50 // max tokens per user per day
    }
  },
  // Token utility
  utility: {
    canBeRedeemed: {
      type: Boolean,
      default: true
    },
    canBeTransferred: {
      type: Boolean,
      default: true
    },
    canBeStaked: {
      type: Boolean,
      default: false
    },
    redemptionPartners: [{
      name: String,
      address: String,
      discount: Number
    }]
  },
  // Metadata
  description: {
    type: String,
    default: 'Green tokens earned for sustainable packaging practices'
  },
  image: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
tokenSchema.index({ tokenId: 1 });
tokenSchema.index({ contractAddress: 1 });
tokenSchema.index({ owner: 1 });
tokenSchema.index({ symbol: 1 });

const Token = mongoose.model('Token', tokenSchema);

export default Token; 