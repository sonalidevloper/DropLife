const BloodDelivery = require('../models/BloodDelivery');
const Hospital = require('../models/Hospital');
const { createNotification } = require('./notificationController');

// @desc    Create a delivery request
// @route   POST /api/deliveries
// @access  Private (hospital or admin)
exports.createDelivery = async (req, res) => {
  try {
    const delivery = await BloodDelivery.create({
      ...req.body,
      requestedBy: req.user._id,
      requestedAt: new Date()
    });

    await createNotification({
      recipient: req.user._id,
      type: 'delivery_update',
      title: 'Delivery Request Created',
      message: `Your delivery request ${delivery.deliveryNumber} has been created and is pending approval.`,
      data: { deliveryId: delivery._id }
    });

    res.status(201).json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all deliveries (admin)
// @route   GET /api/deliveries
// @access  Private (admin)
exports.getAllDeliveries = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
    if (req.query.priority) filter.priority = req.query.priority;

    const total = await BloodDelivery.countDocuments(filter);
    const deliveries = await BloodDelivery.find(filter)
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: deliveries.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: deliveries
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's deliveries
// @route   GET /api/deliveries/my
// @access  Private
exports.getMyDeliveries = async (req, res) => {
  try {
    const deliveries = await BloodDelivery.find({ requestedBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: deliveries.length, data: deliveries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single delivery
// @route   GET /api/deliveries/:id
// @access  Private
exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await BloodDelivery.findById(req.params.id)
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('dispatchedBy', 'name email');

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    // Only admin or the requester can view
    if (
      req.user.role !== 'admin' &&
      delivery.requestedBy &&
      delivery.requestedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this delivery' });
    }

    res.status(200).json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update delivery status
// @route   PUT /api/deliveries/:id/status
// @access  Private (admin)
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Approved', 'In Transit', 'Delivered', 'Rejected'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowedStatuses.join(', ')}` });
    }

    const delivery = await BloodDelivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    delivery.status = status;

    if (status === 'Approved') {
      delivery.approvedBy = req.user._id;
      delivery.approvedAt = new Date();
    } else if (status === 'In Transit') {
      delivery.dispatchedBy = req.user._id;
      delivery.dispatchedAt = new Date();
    } else if (status === 'Delivered') {
      delivery.deliveredAt = new Date();
    }

    await delivery.save();

    if (delivery.requestedBy) {
      await createNotification({
        recipient: delivery.requestedBy,
        type: 'delivery_update',
        title: `Delivery ${status}`,
        message: `Delivery ${delivery.deliveryNumber} status updated to ${status}.`,
        data: { deliveryId: delivery._id }
      });
    }

    res.status(200).json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a delivery (only if Pending)
// @route   PUT /api/deliveries/:id/cancel
// @access  Private
exports.cancelDelivery = async (req, res) => {
  try {
    const delivery = await BloodDelivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    const isOwner =
      delivery.requestedBy && delivery.requestedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (delivery.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Only pending deliveries can be cancelled' });
    }

    delivery.status = 'Cancelled';
    await delivery.save();

    res.status(200).json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get deliveries for a specific hospital
// @route   GET /api/deliveries/hospital/:hospitalId
// @access  Private (hospital or admin)
exports.getHospitalDeliveries = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.hospitalId);
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
