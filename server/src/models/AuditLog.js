import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    actorName: {
      type: String,
      required: true,
      default: 'System',
    },
    actorRole: {
      type: String,
      required: true,
      default: 'System',
    },
    action: {
      type: String,
      enum: [
        'LOGIN',
        'LOGOUT',
        'CREATE',
        'UPDATE',
        'DELETE',
        'APPROVE',
        'REJECT',
        'OVERRIDE',
        'CLOSE_VERIFY',
        'AI_EXECUTION',
        'EXPORT_REPORT',
        'CONFIG_CHANGE',
      ],
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      required: true, // 'Asset', 'WorkOrder', 'AIRecommendation', 'User', 'SystemSetting'
      index: true,
    },
    entityId: {
      type: String,
      default: '',
    },
    entityName: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      default: '',
    },
    previousState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    outcome: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'WARNING'],
      default: 'SUCCESS',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

auditLogSchema.index({ timestamp: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

