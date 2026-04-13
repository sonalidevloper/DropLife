const BloodDelivery = require('../models/BloodDelivery');

// @desc    Get all deliveries
// @route   GET /api/deliveries
// @access  Private
exports.getDeliveries = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === 'hospital') {
      query.$or = [
        { fromHospital: req.user.id },
        { toHospital: req.user.id }
      ];
    }

    const deliveries = await BloodDelivery.find(query)
      .populate('fromHospital', 'name address')
      .populate('toHospital', 'name address')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: deliveries.length, data: deliveries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create delivery
// @route   POST /api/deliveries
// @access  Private
exports.createDelivery = async (req, res) => {
  try {
    const delivery = await BloodDelivery.create({
      ...req.body,
      timeline: [{ status: 'Pending', timestamp: new Date(), notes: 'Delivery created' }]
    });

    res.status(201).json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single delivery
// @route   GET /api/deliveries/:id
// @access  Private
exports.getDelivery = async (req, res) => {
  try {
    const delivery = await BloodDelivery.findById(req.params.id)
      .populate('fromHospital', 'name address phone')
      .populate('toHospital', 'name address phone');

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    res.json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update delivery status
// @route   PUT /api/deliveries/:id/status
// @access  Private
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const delivery = await BloodDelivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    delivery.status = status;
    delivery.timeline.push({ status, timestamp: new Date(), notes: notes || '' });

    if (status === 'Delivered') {
      delivery.actualDelivery = new Date();
    }

    await delivery.save();

    res.json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track delivery (public)
// @route   GET /api/deliveries/track/:trackingId
// @access  Public
exports.trackDelivery = async (req, res) => {
  try {
    const delivery = await BloodDelivery.findOne({
      trackingId: req.params.trackingId
    }).select('trackingId status timeline bloodGroup units priority estimatedDelivery actualDelivery');

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Tracking ID not found' });
    }

    res.json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete delivery
// @route   DELETE /api/deliveries/:id
// @access  Private (Admin)
exports.deleteDelivery = async (req, res) => {
  try {
    const delivery = await BloodDelivery.findByIdAndDelete(req.params.id);

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    res.json({ success: true, message: 'Delivery deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;