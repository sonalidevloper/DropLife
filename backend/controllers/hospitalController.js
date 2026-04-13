const User = require('../models/User');
const Hospital = require('../models/Hospital');
const BloodRequest = require('../models/BloodRequest');
const BloodDelivery = require('../models/BloodDelivery');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// @desc    Register a hospital (creates User + Hospital record)
// @route   POST /api/hospitals
// @access  Public
exports.registerHospital = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      registrationNumber,
      type,
      address,
      location,
      bloodBank,
      facilities,
      specialties,
      bedCapacity,
      icuBeds,
      operatingHours,
      emergencyContact,
      website
    } = req.body;

    if (!name || !email || !password || !phone || !registrationNumber || !type || !address) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hospitalUser = await User.create({
      name,
      email,
      password,
      phone,
      role: 'hospital',
      address: {
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        street: address.street
      }
    });

    const hospital = await Hospital.create({
      name,
      email,
      phone,
      registrationNumber,
      type,
      address,
      location: location
        ? { type: 'Point', coordinates: location.coordinates || [0, 0] }
        : { type: 'Point', coordinates: [0, 0] },
      bloodBank,
      facilities,
      specialties,
      bedCapacity,
      icuBeds,
      operatingHours,
      emergencyContact,
      website,
      managedBy: hospitalUser._id,
      bloodAvailability: [
      { bloodGroup: "A+", unitsAvailable: 10 },
      { bloodGroup: "B+", unitsAvailable: 5 },
      { bloodGroup: "O+", unitsAvailable: 20 }
    ],
    });

    const token = generateToken(hospitalUser._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: hospitalUser._id,
        name: hospitalUser.name,
        email: hospitalUser.email,
        role: hospitalUser.role
      },
      hospital
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Hospital login
// @route   POST /api/hospitals/login
// @access  Public
exports.loginHospital = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email, role: 'hospital' }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const hospital = await Hospital.findOne({ managedBy: user._id });
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      hospital
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all verified hospitals
// @route   GET /api/hospitals
// @access  Public
exports.getAllHospitals = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { isActive: true };
    if (req.query.verified === 'true') query.isVerified = true;
    if (req.query.type) query.type = req.query.type;
    if (req.query.city) query['address.city'] = new RegExp(req.query.city, 'i');
    if (req.query.state) query['address.state'] = new RegExp(req.query.state, 'i');
    if (req.query.hasBloodBank === 'true') query['bloodBank.hasBloodBank'] = true;

    const total = await Hospital.countDocuments(query);
    const hospitals = await Hospital.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: hospitals.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: hospitals
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get nearby hospitals
// @route   GET /api/hospitals/nearby
// @access  Public
exports.getNearbyHospitals = async (req, res) => {
  try {
    const { lat, lng, radius = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Please provide lat and lng query params' });
    }

    const radiusInMeters = parseFloat(radius) * 1000;

    const hospitals = await Hospital.find({
      isActive: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radiusInMeters
        }
      }
    }).limit(50);

    res.status(200).json({ success: true, count: hospitals.length, data: hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single hospital
// @route   GET /api/hospitals/:id
// @access  Public
exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).populate('managedBy', 'name email phone');

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    res.status(200).json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update hospital details
// @route   PUT /api/hospitals/:id
// @access  Private (hospital owner or admin)
exports.updateHospital = async (req, res) => {
  try {
    let hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const isOwner = hospital.managedBy && hospital.managedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this hospital' });
    }

    const disallowed = ['registrationNumber', 'managedBy', 'isVerified'];
    disallowed.forEach((field) => delete req.body[field]);

    hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get blood availability for a hospital
// @route   GET /api/hospitals/:id/blood-availability
// @access  Public
exports.getBloodAvailability = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id, 'name bloodAvailability bloodBank');

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    res.status(200).json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update blood availability
// @route   PUT /api/hospitals/:id/blood-availability
// @access  Private (hospital or admin)
exports.updateBloodAvailability = async (req, res) => {
  try {
    const { bloodGroup, units, operation = 'set' } = req.body;

    if (!bloodGroup || units === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide bloodGroup and units' });
    }

    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({ success: false, message: 'Invalid blood group' });
    }

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const isOwner = hospital.managedBy && hospital.managedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const entry = hospital.bloodAvailability.find((b) => b.bloodGroup === bloodGroup);
    if (entry) {
      entry.unitsAvailable =
        operation === 'add' ? entry.unitsAvailable + parseInt(units) : parseInt(units);
      entry.lastUpdated = new Date();
    } else {
      hospital.bloodAvailability.push({
        bloodGroup,
        unitsAvailable: parseInt(units),
        lastUpdated: new Date()
      });
    }

    await hospital.save();

    res.status(200).json({ success: true, data: hospital.bloodAvailability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Hospital creates a blood request
// @route   POST /api/hospitals/:id/blood-request
// @access  Private (hospital)
exports.createHospitalBloodRequest = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const isOwner = hospital.managedBy && hospital.managedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const bloodRequest = await BloodRequest.create({
      ...req.body,
      requestedBy: req.user._id,
      hospital: {
        name: hospital.name,
        address: `${hospital.address.street || ''} ${hospital.address.city}, ${hospital.address.state}`.trim(),
        phone: hospital.phone,
        location: hospital.location
      }
    });

    res.status(201).json({ success: true, data: bloodRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all blood requests from a hospital
// @route   GET /api/hospitals/:id/requests
// @access  Private (hospital or admin)
exports.getHospitalRequests = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const isOwner = hospital.managedBy && hospital.managedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const requests = await BloodRequest.find({ requestedBy: hospital.managedBy }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get deliveries for a hospital
// @route   GET /api/hospitals/:id/deliveries
// @access  Private (hospital or admin)
exports.getHospitalDeliveries = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const isOwner = hospital.managedBy && hospital.managedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const deliveries = await BloodDelivery.find({
      $or: [
        { toId: hospital._id, toType: 'Hospital' },
        { fromId: hospital._id, fromType: 'Hospital' }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: deliveries.length, data: deliveries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify a hospital
// @route   PUT /api/hospitals/:id/verify
// @access  Private (admin)
exports.verifyHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    res.status(200).json({ success: true, message: 'Hospital verified successfully', data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a hospital
// @route   DELETE /api/hospitals/:id
// @access  Private (admin)
exports.deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    if (hospital.managedBy) {
      await User.findByIdAndDelete(hospital.managedBy);
    }

    await hospital.deleteOne();

    res.status(200).json({ success: true, message: 'Hospital deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
