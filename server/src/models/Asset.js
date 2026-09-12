import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    assetCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Classroom', 'Laboratory', 'Library', 'Hostel', 'Device', 'LearningSystem'],
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
    },
    location: {
      campus: { type: String, default: 'Main Academic Campus' },
      building: { type: String, required: true },
      floor: { type: String, default: 'Ground Floor' },
      room: { type: String, required: true },
      zone: { type: String, default: 'North Academic Quad' },
    },
    departmentOwner: {
      type: String,
      required: true,
      index: true,
    },
    custodian: {
      type: String,
      default: 'Facility Manager',
    },
    criticality: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['Operational', 'Degraded', 'In_Maintenance', 'Offline'],
      default: 'Operational',
      index: true,
    },
    healthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 95,
      index: true,
    },
    runtimeHours: {
      type: Number,
      default: 0,
    },
    installDate: {
      type: Date,
      default: () => new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * 2), // 2 yrs ago default
    },
    warrantyExpiry: {
      type: Date,
    },
    lastMaintenanceDate: {
      type: Date,
    },
    nextScheduledMaintenance: {
      type: Date,
    },
    vendor: {
      name: { type: String, default: 'Siemens Precision Systems' },
      contact: { type: String, default: 'support@vendor-service.com' },
      contractId: { type: String, default: 'VND-CAMPUS-2024-88' },
      slaHours: { type: Number, default: 24 },
    },
    components: [
      {
        name: { type: String, required: true },
        partCode: String,
        condition: { type: String, enum: ['Optimal', 'Fair', 'Worn', 'Critical'], default: 'Optimal' },
        healthScore: { type: Number, default: 90 },
      },
    ],
    spareParts: [
      {
        partCode: { type: String, required: true },
        name: { type: String, required: true },
        inStock: { type: Number, default: 5 },
        reorderLevel: { type: Number, default: 2 },
        costPerUnit: { type: Number, default: 120 },
      },
    ],
    failureRisk: {
      score: { type: Number, default: 12 }, // 0 to 100
      level: { type: String, enum: ['Low', 'Moderate', 'High', 'Critical'], default: 'Low' },
      predictedRulDays: { type: Number, default: 180 },
      anomalyDetected: { type: Boolean, default: false },
      lastEvaluated: { type: Date, default: Date.now },
      modelConfidence: { type: Number, default: 0.94 },
    },
    recentTelemetrySummary: {
      temperature: { type: Number, default: 22.5 },
      vibration: { type: Number, default: 0.12 },
      powerDrawKw: { type: Number, default: 3.4 },
      noiseDb: { type: Number, default: 45.2 },
      updatedAt: { type: Date, default: Date.now },
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Asset = mongoose.model('Asset', assetSchema);

