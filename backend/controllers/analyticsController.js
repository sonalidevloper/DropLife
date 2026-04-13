const User        = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const DonationCamp = require('../models/DonationCamp');
const BloodStock   = require('../models/BloodStock');
const Hospital     = require('../models/Hospital');
const BloodDelivery = require('../models/BloodDelivery');

// @desc    Overview statistics
// @route   GET /api/analytics/overview
// @access  Private (Admin)
exports.getOverview = async (req, res) => {
  try {
    const [
      totalDonors,
      availableDonors,
      totalRequests,
      openRequests,
      fulfilledRequests,
      totalCamps,
      upcomingCamps,
      totalHospitals,
      verifiedHospitals,
      bloodStock,
      totalDeliveries,
      deliveredCount
    ] = await Promise.all([
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'donor', isAvailable: true }),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: 'Open' }),
      BloodRequest.countDocuments({ status: 'Fulfilled' }),
      DonationCamp.countDocuments(),
      DonationCamp.countDocuments({ date: { $gte: new Date() }, status: { $ne: 'Completed' } }),
      Hospital.countDocuments(),
      Hospital.countDocuments({ isVerified: true }),
      BloodStock.find().sort('bloodGroup'),
      BloodDelivery.countDocuments(),
      BloodDelivery.countDocuments({ status: 'Delivered' })
    ]);

    // Blood group distribution of donors
    const bloodGroupStats = await User.aggregate([
      { $match: { role: 'donor' } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Monthly donations (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);

    const monthlyDonations = await User.aggregate([
      {
        $match: {
          role: 'donor',
          lastDonationDate: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year:  { $year:  '$lastDonationDate' },
            month: { $month: '$lastDonationDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Request trend by urgency
    const requestsByUrgency = await BloodRequest.aggregate([
      { $group: { _id: '$urgency', count: { $sum: 1 } } }
    ]);

    // Top cities by donor count
    const topCities = await User.aggregate([
      { $match: { role: 'donor', 'address.city': { $exists: true, $ne: '' } } },
      { $group: { _id: '$address.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalDonors,
          availableDonors,
          totalRequests,
          openRequests,
          fulfilledRequests,
          totalCamps,
          upcomingCamps,
          totalHospitals,
          verifiedHospitals,
          totalDeliveries,
          deliveredCount,
          livesSaved: fulfilledRequests * 3
        },
        bloodStock,
        bloodGroupStats,
        monthlyDonations,
        requestsByUrgency,
        topCities
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Blood trend analytics
// @route   GET /api/analytics/blood-trends
// @access  Private (Admin)
exports.getBloodTrends = async (req, res) => {
  try {
    const trends = await BloodRequest.aggregate([
      {
        $group: {
          _id: { bloodGroup: '$bloodGroup', status: '$status' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.bloodGroup': 1 } }
    ]);

    const stockLevels = await BloodStock.find().sort('bloodGroup');

    res.json({ success: true, data: { trends, stockLevels } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Donor activity
// @route   GET /api/analytics/donors
// @access  Private (Admin)
exports.getDonorAnalytics = async (req, res) => {
  try {
    const bloodGroupDistribution = await User.aggregate([
      { $match: { role: 'donor' } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const stateDistribution = await User.aggregate([
      { $match: { role: 'donor', 'address.state': { $exists: true } } },
      { $group: { _id: '$address.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const availabilityStats = await User.aggregate([
      { $match: { role: 'donor' } },
      { $group: { _id: '$isAvailable', count: { $sum: 1 } } }
    ]);

    const topDonors = await User.find({ role: 'donor', donationCount: { $gt: 0 } })
      .sort({ donationCount: -1 })
      .limit(10)
      .select('name bloodGroup donationCount lastDonationDate address');

    res.json({
      success: true,
      data: {
        bloodGroupDistribution,
        stateDistribution,
        availabilityStats,
        topDonors
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Camp statistics
// @route   GET /api/analytics/camps
// @access  Private (Admin)
exports.getCampAnalytics = async (req, res) => {
  try {
    const statusBreakdown = await DonationCamp.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const mostRegistered = await DonationCamp.find()
      .sort({ 'registeredDonors.length': -1 })
      .limit(5)
      .select('name date venue status registeredDonors');

    res.json({ success: true, data: { statusBreakdown, mostRegistered } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Hospital analytics
// @route   GET /api/analytics/hospitals
// @access  Private (Admin)
exports.getHospitalAnalytics = async (req, res) => {
  try {
    const typeBreakdown = await Hospital.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const stateDistribution = await Hospital.aggregate([
      { $group: { _id: '$address.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const totalBloodUnits = await Hospital.aggregate([
      { $unwind: '$bloodInventory' },
      {
        $group: {
          _id: '$bloodInventory.bloodGroup',
          totalUnits: { $sum: '$bloodInventory.units' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: { typeBreakdown, stateDistribution, totalBloodUnits }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;