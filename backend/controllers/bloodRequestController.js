const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Create blood request
// @route   POST /api/blood-request
// @access  Public
exports.createBloodRequest = async (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      unitsRequired,
      urgency,
      hospital,
      requesterName,
      requesterPhone,
      requesterEmail,
      needByDate,
      notes
    } = req.body;

    // Create blood request
    const bloodRequest = await BloodRequest.create({
      patientName,
      bloodGroup,
      unitsRequired,
      urgency,
      hospital,
      requesterName,
      requesterPhone,
      requesterEmail,
      requestedBy: req.user ? req.user.id : null,
      needByDate,
      notes
    });

    // Find nearby available donors with matching blood group
    const compatibleBloodGroups = getCompatibleBloodGroups(bloodGroup);
    
    const donors = await User.find({
      bloodGroup: { $in: compatibleBloodGroups },
      isAvailable: true,
      role: 'donor',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: hospital.location.coordinates
          },
          $maxDistance: 50000 // 50km radius
        }
      }
    }).limit(20);

    // Calculate distance and notify donors
    const matchedDonors = donors.map(donor => {
      const distance = calculateDistance(
        hospital.location.coordinates,
        donor.location.coordinates
      );

      // Send email notification
      sendEmail({
        email: donor.email,
        subject: `🚨 ${urgency} Blood Request - ${bloodGroup}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">Urgent Blood Request</h2>
            <p>Dear ${donor.name},</p>
            <p><strong>A ${urgency.toLowerCase()} blood request matches your profile!</strong></p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Patient:</strong> ${patientName}</p>
              <p><strong>Blood Group:</strong> ${bloodGroup}</p>
              <p><strong>Units Required:</strong> ${unitsRequired}</p>
              <p><strong>Hospital:</strong> ${hospital.name}</p>
              <p><strong>Location:</strong> ${hospital.address}</p>
              <p><strong>Distance:</strong> ${distance.toFixed(2)} km from you</p>
              <p><strong>Contact:</strong> ${requesterName} - ${requesterPhone}</p>
              <p><strong>Urgency:</strong> <span style="color: ${urgency === 'Critical' ? '#dc3545' : '#ffc107'}">${urgency}</span></p>
            </div>
            <p>Please log in to DROPLIFE to respond to this request.</p>
            <p>Every donation saves lives. Thank you for being a hero!</p>
            <p>Best regards,<br>DROPLIFE Team</p>
          </div>
        `
      }).catch(err => console.log('Email error:', err));

      return {
        donor: donor._id,
        distance,
        status: 'Notified',
        notifiedAt: new Date()
      };
    });

    // Update blood request with matched donors
    bloodRequest.matchedDonors = matchedDonors;
    await bloodRequest.save();

    res.status(201).json({
      success: true,
      message: `Blood request created and ${matchedDonors.length} donors notified`,
      data: bloodRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all blood requests
// @route   GET /api/blood-request
// @access  Public
exports.getAllBloodRequests = async (req, res) => {
  try {
    const { status, bloodGroup, urgency } = req.query;

    const query = {};
    if (status) query.status = status;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (urgency) query.urgency = urgency;

    const bloodRequests = await BloodRequest.find(query)
      .populate('requestedBy', 'name email phone')
      .populate('matchedDonors.donor', 'name email phone bloodGroup')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bloodRequests.length,
      data: bloodRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single blood request
// @route   GET /api/blood-request/:id
// @access  Public
exports.getBloodRequest = async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id)
      .populate('requestedBy', 'name email phone')
      .populate('matchedDonors.donor', 'name email phone bloodGroup location');

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bloodRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update blood request status
// @route   PUT /api/blood-request/:id/status
// @access  Private
exports.updateBloodRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const bloodRequest = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      { status, fulfilledAt: status === 'Fulfilled' ? new Date() : null },
      { new: true, runValidators: true }
    );

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bloodRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Donor responds to blood request
// @route   PUT /api/blood-request/:id/respond
// @access  Private
exports.respondToBloodRequest = async (req, res) => {
  try {
    const { response } = req.body; // 'Accepted' or 'Declined'

    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Find the matched donor
    const matchedDonor = bloodRequest.matchedDonors.find(
      md => md.donor.toString() === req.user.id
    );

    if (!matchedDonor) {
      return res.status(400).json({
        success: false,
        message: 'You are not matched with this blood request'
      });
    }

    // Update donor response
    matchedDonor.status = response;
    matchedDonor.respondedAt = new Date();

    if (response === 'Accepted') {
      bloodRequest.status = 'In Progress';
    }

    await bloodRequest.save();

    res.status(200).json({
      success: true,
      message: `You have ${response.toLowerCase()} the blood request`,
      data: bloodRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to get compatible blood groups
function getCompatibleBloodGroups(bloodGroup) {
  const compatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  };

  return compatibility[bloodGroup] || [];
}

// Helper function to calculate distance between two coordinates (in km)
function calculateDistance(coords1, coords2) {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;

  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

module.exports = exports;