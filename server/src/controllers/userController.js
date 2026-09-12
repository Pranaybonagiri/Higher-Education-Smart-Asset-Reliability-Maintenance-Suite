import { User } from '../models/User.js';
import { recordAudit } from '../middleware/audit.js';

export const getUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const query = {};

    if (role && role !== 'All') {
      query.role = role;
    }
    if (status && status !== 'All') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, specialization, phone } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, error: { message: 'A user with this email already exists.' } });
    }

    const user = new User({
      name,
      email,
      password: password || 'Password123!',
      role: role || 'Technician',
      department: department || 'Central Facilities',
      specialization: specialization || 'General Maintenance',
      phone: phone || '+1 (555) 012-3456',
    });

    await user.save();

    await recordAudit({
      req,
      action: 'CREATE',
      entityType: 'User',
      entityId: user._id,
      entityName: user.name,
      reason: `Created new user account for ${user.name} with role ${user.role}`,
      newState: { name: user.name, email: user.email, role: user.role },
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
};

export const updateUser = async (req, res) => {
  try {
    const previous = await User.findById(req.params.id);
    if (!previous) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    const updates = { ...req.body };
    delete updates.password; // do not update password via this endpoint

    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');

    await recordAudit({
      req,
      action: 'UPDATE',
      entityType: 'User',
      entityId: updated._id,
      entityName: updated.name,
      reason: `Updated user profile and role privileges`,
      previousState: { role: previous.role, status: previous.status, department: previous.department },
      newState: { role: updated.role, status: updated.status, department: updated.department },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
};

export const getPermissionsMatrix = async (req, res) => {
  const matrix = {
    MaintenanceAdmin: {
      assets: ['read', 'create', 'update', 'delete', 'export'],
      workOrders: ['read', 'create', 'assign', 'verify_close', 'delete'],
      aiEngine: ['run_predictions', 'approve', 'reject', 'override', 'view_diagnostics'],
      users: ['manage_users', 'assign_roles', 'reset_passwords'],
      audit: ['view_all', 'export_logs'],
      settings: ['edit_thresholds', 'configure_ai', 'set_calendar_freeze'],
    },
    OperationsManager: {
      assets: ['read', 'create', 'update', 'export'],
      workOrders: ['read', 'create', 'assign', 'verify_close'],
      aiEngine: ['run_predictions', 'approve', 'reject', 'override'],
      users: ['view_directory'],
      audit: ['view_logs'],
      settings: ['view_settings'],
    },
    Technician: {
      assets: ['read', 'view_telemetry'],
      workOrders: ['view_assigned', 'update_progress', 'fill_checklist', 'upload_evidence'],
      aiEngine: ['view_insights', 'provide_calibration_feedback'],
      users: ['view_directory'],
      audit: ['view_own_actions'],
      settings: ['view_settings'],
    },
    Vendor: {
      assets: ['read_assigned_category'],
      workOrders: ['view_contracted', 'submit_completion_report'],
      aiEngine: ['view_telemetry_brief'],
      users: [],
      audit: [],
      settings: [],
    },
    AcademicDeptHead: {
      assets: ['read_department_assets'],
      workOrders: ['view_department_impact', 'request_maintenance'],
      aiEngine: ['view_high_level_risk'],
      users: ['view_department_staff'],
      audit: [],
      settings: ['view_academic_calendar'],
    },
  };

  res.json({ success: true, data: matrix });
};

