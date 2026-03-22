const mongoose = require('mongoose');
const crypto = require('crypto');

const bloodDeliverySchema = new mongoose.Schema({
  deliveryNumber: {
    type: String
  },
  fromType: {
    type: String,
    required: [true, 'Source type is required'],
    enum: ['Hospital', 'BloodBank', 'Admin', 'Donor']
  },
  fromId: {
    type: mongoose.Schema.Types.ObjectId
  },
  fromName: {
    type: String,
    required: [true, 'Source name is required']
  },
  toType: {
    type: String,
    required: [true, 'Destination type is required'],
    enum: ['Hospital', 'BloodBank', 'Admin']
  },
  toId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Destination ID is required']
  },
  toName: {
    type: String,
    required: [true, 'Destination name is required']
  },
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  units: {
    type: Number,
    required: [true, 'Units is required'],
    min: [1, 'Minimum 1 unit required']
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'In Transit', 'Delivered', 'Cancelled', 'Rejected'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Normal', 'Urgent', 'Critical'],
    default: 'Normal'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dispatchedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  dispatchedAt: Date,
  deliveredAt: Date,
  notes: String,
  trackingCode: {
    type: String,
    unique: true
  },
  temperature: String
}, {
  timestamps: true
});

// Auto-generate deliveryNumber and trackingCode before saving
bloodDeliverySchema.pre('save', function (next) {
  if (!this.deliveryNumber) {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const rand = String(Math.floor(10000 + Math.random() * 90000));
    this.deliveryNumber = `${dd}${mm}${yyyy}-${rand}`;
  }
  if (!this.trackingCode) {
    this.trackingCode = crypto.randomBytes(8).toString('hex').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('BloodDelivery', bloodDeliverySchema);
