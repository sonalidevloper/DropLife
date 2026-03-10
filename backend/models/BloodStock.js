const mongoose = require('mongoose');

const donationCampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  organizer: {
    type: String,
    required: true
  },
  venue: {
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: String,
    state: String,
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
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  expectedDonors: {
    type: Number,
    default: 0
  },
  registeredDonors: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    attended: {
      type: Boolean,
      default: false
    },
    donated: {
      type: Boolean,
      default: false
    }
  }],
  bloodGroups: [{
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  }],
  image: String,
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create geospatial index
donationCampSchema.index({ 'venue.location': '2dsphere' });

module.exports = mongoose.model('DonationCamp', donationCampSchema);