const mongoose = require('mongoose');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide hospital name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide hospital email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide hospital phone number']
  },
  registrationNumber: {
    type: String,
    required: [true, 'Please provide registration number'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please provide hospital type'],
    enum: ['Government', 'Private', 'Trust', 'Clinic', 'NGO']
  },
  address: {
    street: String,
    city: {
      type: String,
      required: [true, 'Please provide city']
    },
    state: {
      type: String,
      required: [true, 'Please provide state']
    },
    pincode: {
      type: String,
      required: [true, 'Please provide pincode']
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  bloodBank: {
    hasBloodBank: {
      type: Boolean,
      default: false
    },
    licenseNumber: String,
    bankCode: String
  },
  bloodAvailability: [
    {
      bloodGroup: {
        type: String,
        enum: BLOOD_GROUPS
      },
      unitsAvailable: {
        type: Number,
        default: 0
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    }
  ],
  facilities: [String],
  specialties: [String],
  bedCapacity: {
    type: Number,
    default: 0
  },
  icuBeds: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  operatingHours: {
    open: String,
    close: String,
    isOpen24Hours: {
      type: Boolean,
      default: false
    }
  },
  emergencyContact: {
    name: String,
    phone: String
  },
  website: String,
  managedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

hospitalSchema.index({ location: '2dsphere' });

// Initialize blood availability for all groups before saving new document
hospitalSchema.pre('save', function (next) {
  if (this.isNew && this.bloodAvailability.length === 0) {
    this.bloodAvailability = BLOOD_GROUPS.map((bg) => ({
      bloodGroup: bg,
      unitsAvailable: 0,
      lastUpdated: new Date()
    }));
  }
  next();
});

module.exports = mongoose.model('Hospital', hospitalSchema);
