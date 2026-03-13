const DonationCamp = require('../models/DonationCamp');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Create donation camp
// @route   POST /api/camps
// @access  Private (Admin)
exports.createCamp = async (req, res) => {
  try {
    const camp = await DonationCamp.create({
      ...req.body,
      createdBy: req.user.id
    });

    // Notify all donors about new camp
    const donors = await User.find({ role: 'donor' });
    
    donors.forEach(donor => {
      sendEmail({
        email: donor.email,
        subject: '🏕️ New Blood Donation Camp - Register Now!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">New Blood Donation Camp</h2>
            <p>Dear ${donor.name},</p>
            <p>A new blood donation camp has been organized in your area!</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>${camp.name}</h3>
              <p><strong>Organizer:</strong> ${camp.organizer}</p>
              <p><strong>Date:</strong> ${new Date(camp.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${camp.startTime} - ${camp.endTime}</p>
              <p><strong>Venue:</strong> ${camp.venue.name}, ${camp.venue.address}</p>
              <p><strong>Contact:</strong> ${camp.contactPerson.name} - ${camp.contactPerson.phone}</p>
            </div>
            <p>${camp.description}</p>
            <p>Register now and save lives!</p>
            <p>Best regards,<br>DROPLIFE Team</p>
          </div>
        `
      }).catch(err => console.log('Email error:', err));
    });

    res.status(201).json({
      success: true,
      data: camp
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all camps
// @route   GET /api/camps
// @access  Public
exports.getAllCamps = async (req, res) => {
  try {
    const { status, upcoming } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
      query.status = { $ne: 'Completed' };
    }

    const camps = await DonationCamp.find(query)
      .populate('createdBy', 'name email')
      .populate('registeredDonors.donor', 'name email phone bloodGroup')
      .sort('date');

    res.status(200).json({
      success: true,
      count: camps.length,
      data: camps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single camp
// @route   GET /api/camps/:id
// @access  Public
exports.getCamp = async (req, res) => {
  try {
    const camp = await DonationCamp.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('registeredDonors.donor', 'name email phone bloodGroup');

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: 'Camp not found'
      });
    }

    res.status(200).json({
      success: true,
      data: camp
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Register for camp
// @route   POST /api/camps/:id/register
// @access  Private
exports.registerForCamp = async (req, res) => {
  try {
    const camp = await DonationCamp.findById(req.params.id);

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: 'Camp not found'
      });
    }

    // Check if already registered
    const alreadyRegistered = camp.registeredDonors.some(
      rd => rd.donor.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this camp'
      });
    }

    // Add donor to registered list
    camp.registeredDonors.push({
      donor: req.user.id,
      registeredAt: new Date()
    });

    await camp.save();

    // Send confirmation email
    sendEmail({
      email: req.user.email,
      subject: '✅ Camp Registration Confirmed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Registration Confirmed!</h2>
          <p>Dear ${req.user.name},</p>
          <p>You have successfully registered for the blood donation camp.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>${camp.name}</h3>
            <p><strong>Date:</strong> ${new Date(camp.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${camp.startTime} - ${camp.endTime}</p>
            <p><strong>Venue:</strong> ${camp.venue.name}, ${camp.venue.address}</p>
          </div>
          <p>Please arrive on time and bring a valid ID.</p>
          <p>Thank you for being a lifesaver!</p>
          <p>Best regards,<br>DROPLIFE Team</p>
        </div>
      `
    }).catch(err => console.log('Email error:', err));

    res.status(200).json({
      success: true,
      message: 'Successfully registered for the camp',
      data: camp
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update camp
// @route   PUT /api/camps/:id
// @access  Private (Admin)
exports.updateCamp = async (req, res) => {
  try {
    const camp = await DonationCamp.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: 'Camp not found'
      });
    }

    res.status(200).json({
      success: true,
      data: camp
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete camp
// @route   DELETE /api/camps/:id
// @access  Private (Admin)
exports.deleteCamp = async (req, res) => {
  try {
    const camp = await DonationCamp.findByIdAndDelete(req.params.id);

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: 'Camp not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Camp deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;