const User = require('../models/User');

// @desc    Get donor profile
// @route   GET /api/donor/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const donor = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: donor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update donor profile
// @route   PUT /api/donor/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      isAvailable: req.body.isAvailable,
      location: req.body.location
    };

    const donor = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: donor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update availability status
// @route   PUT /api/donor/availability
// @access  Private
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    const donor = await User.findByIdAndUpdate(
      req.user.id,
      { isAvailable },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Availability status updated to ${isAvailable ? 'Available' : 'Unavailable'}`,
      data: donor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get donation history
// @route   GET /api/donor/history
// @access  Private
exports.getDonationHistory = async (req, res) => {
  try {
    const donor = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        donationCount: donor.donationCount,
        lastDonationDate: donor.lastDonationDate,
        canDonate: donor.canDonate()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get nearby donors
// @route   GET /api/donor/nearby
// @access  Private (Admin)
exports.getNearbyDonors = async (req, res) => {
  try {
    const { longitude, latitude, bloodGroup, maxDistance = 50000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide longitude and latitude'
      });
    }

    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      isAvailable: true,
      role: 'donor'
    };

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    const donors = await User.find(query).select('-password');

    res.status(200).json({
      success: true,
      count: donors.length,
      data: donors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};