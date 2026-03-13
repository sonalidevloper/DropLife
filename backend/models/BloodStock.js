const mongoose = require('mongoose');

const bloodStockSchema = new mongoose.Schema({
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    unique: true
  },
  unitsAvailable: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  expiringUnits: [{
    units: Number,
    expiryDate: Date
  }],
  minimumThreshold: {
    type: Number,
    default: 10
  },
  transactions: [{
    type: {
      type: String,
      enum: ['Addition', 'Withdrawal', 'Expired'],
      required: true
    },
    units: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    reference: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('BloodStock', bloodStockSchema);