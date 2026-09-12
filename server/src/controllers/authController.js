import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { recordAudit } from '../middleware/audit.js';

const JWT_SECRET = process.env.JWT_SECRET || 'he_sarms_super_secret_jwt_key_university_2026!';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_CREDENTIALS', message: 'Please provide both email and password.' },
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      await recordAudit({
        req,
        action: 'LOGIN',
        entityType: 'User',
        reason: `Failed login attempt for nonexistent user: ${email}`,
        outcome: 'FAILURE',
      });
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await recordAudit({
        req,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user._id,
        reason: `Failed password verification for: ${email}`,
        outcome: 'FAILURE',
      });
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account is suspended. Contact facility administrator.' },
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await recordAudit({
      req: { ...req, user },
      action: 'LOGIN',
      entityType: 'User',
      entityId: user._id,
      entityName: user.name,
      reason: `Successful login via standard credentials as ${user.role}`,
      outcome: 'SUCCESS',
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          specialization: user.specialization,
          status: user.status,
          mfaEnabled: user.mfaEnabled,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const demoLogin = async (req, res) => {
  try {
    const { role } = req.body;
    const targetRole = role || 'MaintenanceAdmin';

    let user = await User.findOne({ role: targetRole });
    if (!user) {
      user = await User.findOne();
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NO_USERS_AVAILABLE', message: 'No users found in database. Please run seed script.' },
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await recordAudit({
      req: { ...req, user },
      action: 'LOGIN',
      entityType: 'User',
      entityId: user._id,
      entityName: user.name,
      reason: `Direct evaluation demo login as ${user.role}`,
      outcome: 'SUCCESS',
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          specialization: user.specialization,
          status: user.status,
          mfaEnabled: user.mfaEnabled,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  await recordAudit({
    req,
    action: 'UPDATE',
    entityType: 'User',
    reason: `Password reset requested for email: ${email}`,
    outcome: 'SUCCESS',
  });

  res.json({
    success: true,
    message: `Password reset verification link has been dispatched to ${email}. For testing purposes, demo accounts have password 'Password123!'.`,
  });
};

