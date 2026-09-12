import mongoose from 'mongoose';

const telemetrySchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    temperature: {
      type: Number,
      required: true, // Celsius
    },
    vibration: {
      type: Number,
      required: true, // mm/s RMS
    },
    powerDrawKw: {
      type: Number,
      required: true,
    },
    noiseDb: {
      type: Number,
      required: true,
    },
    humidity: {
      type: Number,
      default: 45,
    },
    pressurePsi: {
      type: Number,
      default: 14.7,
    },
    isAnomaly: {
      type: Boolean,
      default: false,
      index: true,
    },
    anomalyType: {
      type: String,
      default: null,
    },
    rawStatus: {
      type: String,
      default: 'NORMAL',
    },
  },
  {
    timestamps: false,
  }
);

telemetrySchema.index({ assetId: 1, timestamp: -1 });

export const Telemetry = mongoose.model('Telemetry', telemetrySchema);

