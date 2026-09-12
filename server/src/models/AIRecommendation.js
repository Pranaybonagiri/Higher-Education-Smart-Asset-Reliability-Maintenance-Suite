import mongoose from 'mongoose';

const aiRecommendationSchema = new mongoose.Schema(
  {
    recommendationCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    recommendationType: {
      type: String,
      enum: [
        'RUL_Warning',
        'Vibration_Anomaly',
        'Thermal_Runaway_Risk',
        'Filter_Impedance',
        'Bearing_Degradation',
        'Preventive_Schedule_Optimization',
      ],
      required: true,
    },
    urgency: {
      type: String,
      enum: ['Immediate', 'Within_7_Days', 'Next_Cycle', 'Advisory'],
      default: 'Within_7_Days',
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    suggestedAction: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    rulEstimateDays: {
      type: Number,
      default: 30,
    },
    confidence: {
      type: Number, // 0.0 - 1.0
      required: true,
      default: 0.88,
    },
    contributingFactors: [
      {
        factor: String,
        weight: Number,
        observedValue: String,
        threshold: String,
      },
    ],
    requiredSkill: {
      type: String,
      default: 'HVAC Specialist Grade 3',
    },
    probableParts: [
      {
        partCode: String,
        name: String,
        estimatedCost: Number,
      },
    ],
    expectedDowntimeHours: {
      type: Number,
      default: 3.5,
    },
    academicImpactNote: {
      type: String,
      default: 'No immediate lecture impact if executed during weekend maintenance window.',
    },
    modelVersion: {
      type: String,
      default: 'gemini-1.5-flash-reliability-v2.3',
    },
    telemetrySnapshot: {
      temperature: Number,
      vibration: Number,
      powerDrawKw: Number,
      noiseDb: Number,
      runtimeHours: Number,
      timestamp: { type: Date, default: Date.now },
    },
    status: {
      type: String,
      enum: ['Pending_Review', 'Approved', 'Rejected', 'Overridden'],
      default: 'Pending_Review',
      index: true,
    },
    reviewDetails: {
      reviewedBy: String,
      reviewerRole: String,
      reviewedAt: Date,
      actionTaken: String,
      reason: String,
      overrideDiff: {
        previousPriority: String,
        adjustedPriority: String,
        previousDowntime: Number,
        adjustedDowntime: Number,
        assignedTechnician: String,
        customInstructions: String,
      },
    },
    generatedWorkOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkOrder',
    },
  },
  {
    timestamps: true,
  }
);

export const AIRecommendation = mongoose.model('AIRecommendation', aiRecommendationSchema);

