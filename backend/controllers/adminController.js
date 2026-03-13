const User = require('../models/User');
const BloodStock = require('../models/BloodStock');
const BloodRequest = require('../models/BloodRequest');
const DonationCamp = require('../models/DonationCamp');

// @desc    Get all donors
// @route   GET /api/admin/donors
// @access  Private (Admin)
exports.getAllDonors = async (req, res) => {
  try {
    const { bloodGroup, isAvailable, city } = req.query;

    const query = { role: 'donor' };
    
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    if (city) query['address.city'] = new RegExp(city, 'i');

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

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const availableDonors = await User.countDocuments({ 
      role: 'donor', 
      isAvailable: true 
    });
    const totalRequests = await BloodRequest.countDocuments();
    const pendingRequests = await BloodRequest.countDocuments({ 
      status: 'Open' 
    });
    const fulfilledRequests = await BloodRequest.countDocuments({ 
      status: 'Fulfilled' 
    });
    const totalCamps = await DonationCamp.countDocuments();
    const upcomingCamps = await DonationCamp.countDocuments({ 
      date: { $gte: new Date() },
      status: { $ne: 'Completed' }
    });

    // Blood group distribution
    const bloodGroupStats = await User.aggregate([
      { $match: { role: 'donor' } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Recent donations
    const recentDonations = await User.find({ 
      role: 'donor',
      lastDonationDate: { $ne: null }
    })
    .sort('-lastDonationDate')
    .limit(10)
    .select('name bloodGroup lastDonationDate donationCount');

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalDonors,
          availableDonors,
          totalRequests,
          pendingRequests,
          fulfilledRequests,
          totalCamps,
          upcomingCamps
        },
        bloodGroupStats,
        recentDonations
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get/Create blood stock
// @route   GET /api/admin/blood-stock
// @access  Private (Admin)
exports.getBloodStock = async (req, res) => {
  try {
    let bloodStock = await BloodStock.find().sort('bloodGroup');

    // Initialize blood stock if empty
    if (bloodStock.length === 0) {
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      
      bloodStock = await BloodStock.insertMany(
        bloodGroups.map(bg => ({
          bloodGroup: bg,
          unitsAvailable: 0,
          minimumThreshold: 10
        }))
      );
    }

    res.status(200).json({
      success: true,
      data: bloodStock
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update blood stock
// @route   PUT /api/admin/blood-stock/:bloodGroup
// @access  Private (Admin)
exports.updateBloodStock = async (req, res) => {
  try {
    const { bloodGroup } = req.params;
    const { units, type, reference } = req.body; // type: 'Addition' or 'Withdrawal'

    let bloodStock = await BloodStock.findOne({ bloodGroup });

    if (!bloodStock) {
      return res.status(404).json({
        success: false,
        message: 'Blood group not found in stock'
      });
    }

    // Update units
    if (type === 'Addition') {
      bloodStock.unitsAvailable += units;
    } else if (type === 'Withdrawal') {
      if (bloodStock.unitsAvailable < units) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient blood units available'
        });
      }
      bloodStock.unitsAvailable -= units;
    }

    // Add transaction
    bloodStock.transactions.push({
      type,
      units,
      reference,
      performedBy: req.user.id,
      date: new Date()
    });

    bloodStock.lastUpdated = new Date();
    await bloodStock.save();

    res.status(200).json({
      success: true,
      data: bloodStock
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify donor
// @route   PUT /api/admin/donors/:id/verify
// @access  Private (Admin)
exports.verifyDonor = async (req, res) => {
  try {
    const donor = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donor verified successfully',
      data: donor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete donor
// @route   DELETE /api/admin/donors/:id
// @access  Private (Admin)
exports.deleteDonor = async (req, res) => {
  try {
    const donor = await User.findByIdAndDelete(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;