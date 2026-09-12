import { WorkOrder } from '../models/WorkOrder.js';
import { Asset } from '../models/Asset.js';
import { recordAudit } from '../middleware/audit.js';
import { Notification } from '../models/Notification.js';

export const getWorkOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      technicianId,
      assetId,
      type,
      search,
    } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (technicianId && technicianId !== 'All') {
      query.assignedTechnicianId = technicianId;
    }

    if (assetId) {
      query.assetId = assetId;
    }

    if (search) {
      query.$or = [
        { orderCode: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { assignedTechnicianName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await WorkOrder.countDocuments(query);
    const workOrders = await WorkOrder.find(query)
      .populate('assetId', 'name assetCode category location healthScore criticality')
      .populate('assignedTechnicianId', 'name email role specialization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        workOrders,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const getWorkOrderById = async (req, res) => {
  try {
    const order = await WorkOrder.findById(req.params.id)
      .populate('assetId')
      .populate('assignedTechnicianId', 'name email specialization phone');

    if (!order) {
      return res.status(404).json({ success: false, error: { message: 'Work Order not found' } });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const createWorkOrder = async (req, res) => {
  try {
    const count = await WorkOrder.countDocuments();
    const orderCode = `WO-2026-${String(count + 1).padStart(4, '0')}`;

    const newOrder = new WorkOrder({
      ...req.body,
      orderCode,
      createdBy: req.user?.name || 'Operations Dispatcher',
    });

    await newOrder.save();

    // If assigned to technician, create notification
    if (newOrder.assignedTechnicianId) {
      await Notification.create({
        recipientId: newOrder.assignedTechnicianId,
        targetRole: 'Technician',
        title: `New Work Order Assigned: ${orderCode}`,
        message: `${newOrder.title} (${newOrder.priority}) has been dispatched to your queue.`,
        type: 'WORK_ORDER',
        severity: newOrder.priority === 'P1-Critical' ? 'Critical' : 'Warning',
        link: `/planning`,
        relatedEntityId: newOrder._id,
        relatedEntityType: 'WorkOrder',
      });
    }

    await recordAudit({
      req,
      action: 'CREATE',
      entityType: 'WorkOrder',
      entityId: newOrder._id,
      entityName: newOrder.orderCode,
      reason: `Created maintenance work order: ${newOrder.title}`,
      newState: newOrder.toObject(),
    });

    res.status(201).json({ success: true, data: newOrder });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
};

export const updateWorkOrderStatus = async (req, res) => {
  try {
    const { status, reason, assignedTechnicianId, assignedTechnicianName } = req.body;
    const order = await WorkOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: { message: 'Work order not found' } });
    }

    const previousStatus = order.status;
    order.status = status;

    if (assignedTechnicianId) {
      order.assignedTechnicianId = assignedTechnicianId;
    }
    if (assignedTechnicianName) {
      order.assignedTechnicianName = assignedTechnicianName;
    }

    if (status === 'In_Progress' && !order.startedAt) {
      order.startedAt = new Date();
    }
    if (status === 'Pending_Verification' && !order.completedAt) {
      order.completedAt = new Date();
    }

    await order.save();

    await recordAudit({
      req,
      action: 'UPDATE',
      entityType: 'WorkOrder',
      entityId: order._id,
      entityName: order.orderCode,
      reason: reason || `Updated work order status from ${previousStatus} to ${status}`,
      previousState: { status: previousStatus },
      newState: { status },
    });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
};

export const updateChecklist = async (req, res) => {
  try {
    const { checklist, evidence, notes } = req.body;
    const order = await WorkOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: { message: 'Work order not found' } });
    }

    if (checklist) order.checklist = checklist;
    if (evidence) order.evidence = evidence;
    if (notes) order.description = notes;

    await order.save();

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
};

export const verifyAndClose = async (req, res) => {
  try {
    const { verificationNotes, status, signatureDataUrl } = req.body;
    const order = await WorkOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: { message: 'Work order not found' } });
    }

    const previousStatus = order.status;

    order.closureVerification = {
      verifiedBy: req.user?.name || 'Maintenance Supervisor',
      verifiedAt: new Date(),
      status: status || 'Approved',
      verificationNotes: verificationNotes || 'Inspection checklist verified against university standard operating procedures.',
      signatureDataUrl: signatureDataUrl || '',
    };

    if (status === 'Approved') {
      order.status = 'Closed';
      // Restore asset health score upon successful repair closure
      await Asset.findByIdAndUpdate(order.assetId, {
        status: 'Operational',
        healthScore: 95,
        'failureRisk.score': 10,
        'failureRisk.level': 'Low',
        'failureRisk.anomalyDetected': false,
      });
    } else {
      order.status = 'In_Progress'; // Re-opened for remediation
    }

    await order.save();

    await recordAudit({
      req,
      action: 'CLOSE_VERIFY',
      entityType: 'WorkOrder',
      entityId: order._id,
      entityName: order.orderCode,
      reason: `Closure verification ${status}: ${verificationNotes}`,
      previousState: { status: previousStatus },
      newState: { status: order.status, closureVerification: order.closureVerification },
    });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
};

export const getCalendarEvents = async (req, res) => {
  try {
    const workOrders = await WorkOrder.find({
      status: { $in: ['Scheduled', 'In_Progress', 'Pending_Verification'] },
    }).populate('assetId', 'name assetCode category location');

    const events = workOrders.map((wo) => ({
      id: wo._id,
      title: `${wo.orderCode}: ${wo.title}`,
      start: wo.scheduledDate,
      priority: wo.priority,
      status: wo.status,
      technician: wo.assignedTechnicianName,
      assetName: wo.assetId?.name || 'Asset',
      category: wo.assetId?.category || 'General',
      location: `${wo.assetId?.location?.building || ''} ${wo.assetId?.location?.room || ''}`,
      estimatedDowntimeHours: wo.estimatedDowntimeHours,
    }));

    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

