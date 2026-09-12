import mongoose from 'mongoose';

const workOrderSchema = new mongoose.Schema(
  {
    orderCode: {
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['Preventive', 'Corrective', 'Predictive_AI', 'Emergency', 'Inspection'],
      default: 'Preventive',
      index: true,
    },
    priority: {
      type: String,
      enum: ['P1-Critical', 'P2-High', 'P3-Medium', 'P4-Low'],
      default: 'P3-Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['Backlog', 'Scheduled', 'In_Progress', 'Pending_Verification', 'Closed', 'Deferred'],
      default: 'Backlog',
      index: true,
    },
    assignedTechnicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    assignedTechnicianName: {
      type: String,
      default: 'Unassigned',
    },
    requiredSkill: {
      type: String,
      default: 'General Maintenance Level 2',
    },
    partsRequired: [
      {
        partCode: String,
        name: String,
        quantity: { type: Number, default: 1 },
        isAvailable: { type: Boolean, default: true },
      },
    ],
    estimatedDowntimeHours: {
      type: Number,
      default: 2,
    },
    actualDowntimeHours: {
      type: Number,
      default: 0,
    },
    academicImpact: {
      affectedBuilding: String,
      affectedCourses: [String],
      estimatedStudentsImpacted: { type: Number, default: 0 },
      labSuspensionRequired: { type: Boolean, default: false },
    },
    scheduledDate: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000 * 2),
      index: true,
    },
    startedAt: Date,
    completedAt: Date,
    checklist: [
      {
        step: Number,
        task: String,
        isCompleted: { type: Boolean, default: false },
        passFail: { type: String, enum: ['Pass', 'Fail', 'Pending'], default: 'Pending' },
        meterReading: { type: String, default: '' },
        notes: { type: String, default: '' },
      },
    ],
    evidence: [
      {
        url: String,
        caption: String,
        uploadedAt: { type: Date, default: Date.now },
        type: { type: String, default: 'image' },
      },
    ],
    closureVerification: {
      verifiedBy: String,
      verifiedAt: Date,
      status: { type: String, enum: ['Approved', 'Rejected', 'Pending'], default: 'Pending' },
      verificationNotes: String,
      signatureDataUrl: String,
    },
    cost: {
      partsCost: { type: Number, default: 0 },
      laborCost: { type: Number, default: 0 },
      totalCost: { type: Number, default: 0 },
    },
    aiGeneratedSummary: {
      type: String,
      default: '',
    },
    createdBy: {
      type: String,
      default: 'System / Maintenance Admin',
    },
  },
  {
    timestamps: true,
  }
);

export const WorkOrder = mongoose.model('WorkOrder', workOrderSchema);

