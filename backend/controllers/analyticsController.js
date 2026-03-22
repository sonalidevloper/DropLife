const User = require('../models/User');
const BloodStock = require('../models/BloodStock');
const BloodRequest = require('../models/BloodRequest');
const Hospital = require('../models/Hospital');

// @desc    Get blood stock stats + donor counts per blood group
// @route   GET /api/analytics/blood-stats
// @access  Public
exports.getBloodStats = async (req, res) => {
  try {
    const bloodStock = await BloodStock.find({});

    const donorStats = await User.aggregate([
      { $match: { role: 'donor', bloodGroup: { $exists: true, $ne: null } } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }
    ]);

    const donorCountByGroup = {};
    donorStats.forEach((d) => {
      donorCountByGroup[d._id] = d.count;
    });

    const stats = bloodStock.map((stock) => ({
      bloodGroup: stock.bloodGroup,
      unitsAvailable: stock.unitsAvailable,
      lastUpdated: stock.lastUpdated,
      minimumThreshold: stock.minimumThreshold,
      donorCount: donorCountByGroup[stock.bloodGroup] || 0
    }));

    const totalDonors = await User.countDocuments({ role: 'donor' });

    res.status(200).json({
      success: true,
      data: {
        bloodStock: stats,
        totalDonors,
        totalUnits: bloodStock.reduce((sum, s) => sum + s.unitsAvailable, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Monthly donation trends for last 12 months
// @route   GET /api/analytics/donation-trends
// @access  Public
exports.getDonationTrends = async (req, res) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const trends = await User.aggregate([
      {
        $match: {
          role: 'donor',
          lastDonationDate: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$lastDonationDate' },
            month: { $month: '$lastDonationDate' }
          },
          donations: { $sum: '$donationCount' },
          uniqueDonors: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Hospital statistics
// @route   GET /api/analytics/hospital-stats
// @access  Public
exports.getHospitalStats = async (req, res) => {
  try {
    const total = await Hospital.countDocuments({});
    const verified = await Hospital.countDocuments({ isVerified: true });
    const withBloodBank = await Hospital.countDocuments({ 'bloodBank.hasBloodBank': true });

    const byType = await Hospital.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        verified,
        withBloodBank,
        byType
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Blood request statistics
// @route   GET /api/analytics/request-stats
// @access  Public
exports.getRequestStats = async (req, res) => {
  try {
    const byStatus = await BloodRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const byUrgency = await BloodRequest.aggregate([
      { $group: { _id: '$urgency', count: { $sum: 1 } } }
    ]);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrends = await BloodRequest.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: { byStatus, byUrgency, monthlyTrends }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Geographic distribution of donors
// @route   GET /api/analytics/geographic
// @access  Public
exports.getGeographicStats = async (req, res) => {
  try {
    const byCity = await User.aggregate([
      { $match: { role: 'donor', 'address.city': { $exists: true, $ne: null } } },
      { $group: { _id: '$address.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    const byState = await User.aggregate([
      { $match: { role: 'donor', 'address.state': { $exists: true, $ne: null } } },
      { $group: { _id: '$address.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: { byCity, byState }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
