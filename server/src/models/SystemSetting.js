import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['AI_CONFIG', 'TELEMETRY_THRESHOLDS', 'ACADEMIC_CALENDAR', 'INTEGRATIONS', 'GENERAL'],
      required: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    isEditable: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: String,
      default: 'System Default',
    },
  },
  {
    timestamps: true,
  }
);

export const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);

