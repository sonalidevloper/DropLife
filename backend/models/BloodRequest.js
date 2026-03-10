const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  unitsRequired: {
    type: Number,
    required: true,
    min: 1
  },
  urgency: {
    type: String,
    enum: ['Critical', 'Urgent', 'Normal'],
    default: 'Normal'
  },
  hospital: {
    name: {
      type: String,
      required: true
    },
    address: String,
    phone: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  requesterName: {
    type: String,
    required: true
  },
  requesterPhone: {
    type: String,
    required: true
  },
  requesterEmail: String,
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Fulfilled', 'Cancelled'],
    default: 'Open'
  },
  matchedDonors: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    distance: Number,
    status: {
      type: String,
      enum: ['Notified', 'Accepted', 'Declined', 'Completed'],
      default: 'Notified'
    },
    notifiedAt: Date,
    respondedAt: Date
  }],
  notes: String,
  needByDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  fulfilledAt: Date
}, {
  timestamps: true
});

// Create geospatial index
bloodRequestSchema.index({ 'hospital.location': '2dsphere' });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);