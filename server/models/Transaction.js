import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  txHash: {
    type: String,
    required: true,
    unique: true
  },
  blockNumber: {
    type: Number,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['transfer', 'reward', 'redemption', 'mint', 'burn'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  gasUsed: {
    type: Number,
    default: 0
  },
  gasPrice: {
    type: Number,
    default: 0
  },
  contractAddress: {
    type: String,
    default: null
  },
  functionName: {
    type: String,
    default: null
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  // Related entities
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ txHash: 1 });
transactionSchema.index({ blockNumber: 1 });
transactionSchema.index({ from: 1 });
transactionSchema.index({ to: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ timestamp: -1 });
transactionSchema.index({ packageId: 1 });
transactionSchema.index({ userId: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction; 