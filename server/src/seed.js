import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Asset } from './models/Asset.js';
import { Telemetry } from './models/Telemetry.js';
import { WorkOrder } from './models/WorkOrder.js';
import { AIRecommendation } from './models/AIRecommendation.js';
import { AuditLog } from './models/AuditLog.js';
import { Notification } from './models/Notification.js';
import { SystemSetting } from './models/SystemSetting.js';
import { connectDB, closeDB } from './config/db.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Starting database seeding...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Asset.deleteMany({}),
      Telemetry.deleteMany({}),
      WorkOrder.deleteMany({}),
      AIRecommendation.deleteMany({}),
      AuditLog.deleteMany({}),
      Notification.deleteMany({}),
      SystemSetting.deleteMany({}),
    ]);

    // 1. Seed Users
    const users = await User.create([
      {
        name: 'Dr. Marcus Vance',
        email: 'admin@campus.edu',
        password: 'Password123!',
        role: 'MaintenanceAdmin',
        department: 'Central Physical Plant & Asset Management',
        specialization: 'Asset Lifecycle Strategy & Compliance',
        phone: '+1 (555) 234-5671',
        status: 'Active',
      },
      {
        name: 'Elena Rostova',
        email: 'tech@campus.edu',
        password: 'Password123!',
        role: 'Technician',
        department: 'Mechanical & Electrical Services',
        specialization: 'HVAC Level 3 & Precision Mechanical',
        phone: '+1 (555) 345-6782',
        status: 'Active',
      },
      {
        name: 'Devon Bradley',
        email: 'ops@campus.edu',
        password: 'Password123!',
        role: 'OperationsManager',
        department: 'Campus Operations & Dispatch',
        specialization: 'Work Order Scheduling & Facilities Reliability',
        phone: '+1 (555) 456-7893',
        status: 'Active',
      },
      {
        name: 'Klaus Lindqvist',
        email: 'vendor@campus.edu',
        password: 'Password123!',
        role: 'Vendor',
        department: 'Siemens Precision Building Systems',
        specialization: 'Industrial Chillers & Cleanroom Turbopumps',
        phone: '+1 (555) 567-8904',
        status: 'Active',
      },
      {
        name: 'Prof. Alistair Chen',
        email: 'depthead@campus.edu',
        password: 'Password123!',
        role: 'AcademicDeptHead',
        department: 'School of Chemical & Biomolecular Engineering',
        specialization: 'Research Facility Oversight',
        phone: '+1 (555) 678-9015',
        status: 'Active',
      },
    ]);

    const adminUser = users[0];
    const techUser = users[1];
    const opsUser = users[2];

    console.log(`[Seed] Seeded ${users.length} users with password 'Password123!'`);

    // 2. Seed Assets
    const assetData = [
      // LABORATORY
      {
        assetCode: 'LAB-BIO-302',
        name: 'High-Speed Refrigerated Centrifuge (CR22N)',
        category: 'Laboratory',
        type: 'Centrifuge',
        location: {
          building: 'Life Sciences Bio-Research Tower',
          floor: '3rd Floor',
          room: 'Bio-Safety Cleanroom 302',
          zone: 'West Research Quad',
        },
        departmentOwner: 'School of Chemical & Biomolecular Engineering',
        custodian: 'Prof. Alistair Chen',
        criticality: 'Critical',
        status: 'Degraded',
        healthScore: 48,
        runtimeHours: 5420,
        warrantyExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        vendor: { name: 'Eppendorf Scientific', contact: 'service@eppendorf.com', slaHours: 12 },
        components: [
          { name: 'Drive Spindle Bearing Unit', partCode: 'BRG-CR22-44', condition: 'Critical', healthScore: 38 },
          { name: 'Refrigeration Compressor R404A', partCode: 'CMP-R404-01', condition: 'Fair', healthScore: 72 },
          { name: 'Dynamic Rotor Lid Seal', partCode: 'SL-VIT-88', condition: 'Optimal', healthScore: 92 },
        ],
        spareParts: [
          { partCode: 'BRG-CR22-44', name: 'High-Speed Ceramic Spindle Bearing', inStock: 2, reorderLevel: 1, costPerUnit: 480 },
          { partCode: 'SL-VIT-88', name: 'Viton Vacuum Chamber O-Ring', inStock: 8, reorderLevel: 3, costPerUnit: 45 },
        ],
        failureRisk: {
          score: 84,
          level: 'Critical',
          predictedRulDays: 8,
          anomalyDetected: true,
          lastEvaluated: new Date(),
          modelConfidence: 0.94,
        },
        recentTelemetrySummary: {
          temperature: 38.4,
          vibration: 0.46,
          powerDrawKw: 4.8,
          noiseDb: 68.5,
          updatedAt: new Date(),
        },
        notes: 'Essential for NIH Grant #8210 cancer cell separation assays. Sudden failure will ruin active trial batches.',
      },
      {
        assetCode: 'LAB-CHEM-108',
        name: 'Chemical Fume Hood Exhaust Fan & VAV Damper System',
        category: 'Laboratory',
        type: 'Fume Hood Ventilation',
        location: {
          building: 'Chemistry Complex Hall B',
          floor: '1st Floor',
          room: 'Organic Synthesis Lab 108',
          zone: 'West Research Quad',
        },
        departmentOwner: 'School of Chemical Sciences',
        criticality: 'Critical',
        status: 'Operational',
        healthScore: 88,
        runtimeHours: 9150,
        vendor: { name: 'Labconco Corporation', contact: 'support@labconco.com', slaHours: 8 },
        failureRisk: { score: 18, level: 'Low', predictedRulDays: 140, anomalyDetected: false },
        recentTelemetrySummary: { temperature: 21.0, vibration: 0.12, powerDrawKw: 2.1, noiseDb: 52.0 },
      },
      {
        assetCode: 'LAB-PHYS-005',
        name: 'Ultra-High Vacuum Turbomolecular Pump',
        category: 'Laboratory',
        type: 'Vacuum System',
        location: {
          building: 'Quantum Physics Center',
          floor: 'Basement',
          room: 'Cryogenics Sub-Lab 005',
          zone: 'East Science Park',
        },
        departmentOwner: 'Department of Physics & Astronomy',
        criticality: 'High',
        status: 'Operational',
        healthScore: 92,
        runtimeHours: 3200,
        vendor: { name: 'Pfeiffer Vacuum', contact: 'repairs@pfeiffer.com', slaHours: 24 },
        failureRisk: { score: 14, level: 'Low', predictedRulDays: 195, anomalyDetected: false },
        recentTelemetrySummary: { temperature: 28.5, vibration: 0.08, powerDrawKw: 1.2, noiseDb: 42.0 },
      },

      // CLASSROOMS
      {
        assetCode: 'AUD-ENG-101',
        name: 'Smart Lecture Hall 101 Dual 4K Laser Projection System',
        category: 'Classroom',
        type: 'Audiovisual / Presentation',
        location: {
          building: 'Frank Gehry Engineering Pavilion',
          floor: '1st Floor',
          room: 'Grand Auditorium 101',
          zone: 'Central Academic Core',
        },
        departmentOwner: 'Central University Media Services',
        criticality: 'High',
        status: 'Operational',
        healthScore: 82,
        runtimeHours: 2450,
        vendor: { name: 'Christie Digital', contact: 'support@christiedigital.com', slaHours: 24 },
        failureRisk: { score: 26, level: 'Moderate', predictedRulDays: 65, anomalyDetected: false },
        recentTelemetrySummary: { temperature: 34.2, vibration: 0.04, powerDrawKw: 1.8, noiseDb: 38.0 },
      },
      {
        assetCode: 'CLS-SCI-204',
        name: 'Science Complex Lecture Hall 204 Air Handling Unit (AHU-4)',
        category: 'Classroom',
        type: 'HVAC Air Handling Unit',
        location: {
          building: 'Science Teaching Hall',
          floor: 'Roof Level',
          room: 'Mechanical Penthouse 4',
          zone: 'West Research Quad',
        },
        departmentOwner: 'Campus Facilities',
        criticality: 'Medium',
        status: 'Degraded',
        healthScore: 61,
        runtimeHours: 7890,
        failureRisk: { score: 58, level: 'High', predictedRulDays: 19, anomalyDetected: true },
        recentTelemetrySummary: { temperature: 44.8, vibration: 0.38, powerDrawKw: 7.2, noiseDb: 64.0 },
      },

      // LIBRARIES
      {
        assetCode: 'LIB-MAIN-HVAC',
        name: 'Central Library Main Stacks Chilled Water Pump (P-102)',
        category: 'Library',
        type: 'Centrifugal Pump',
        location: {
          building: 'William Sterling Memorial Library',
          floor: 'Sub-Basement',
          room: 'Pump Room B-02',
          zone: 'Central Academic Core',
        },
        departmentOwner: 'University Libraries Facility Board',
        criticality: 'Critical',
        status: 'Degraded',
        healthScore: 54,
        runtimeHours: 11400,
        vendor: { name: 'Grundfos Commercial', contact: 'service@grundfos.com', slaHours: 12 },
        failureRisk: { score: 68, level: 'High', predictedRulDays: 14, anomalyDetected: true },
        recentTelemetrySummary: { temperature: 52.3, vibration: 0.41, powerDrawKw: 8.9, noiseDb: 69.2 },
        notes: 'Guards rare manuscript archives against humidity spikes. Must maintain relative humidity below 45%.',
      },
      {
        assetCode: 'LIB-GATE-01',
        name: 'Main Library RFID Security Gate & Automated Book Return Conveyor',
        category: 'Library',
        type: 'RFID Sorting & Security',
        location: {
          building: 'William Sterling Memorial Library',
          floor: 'Ground Floor',
          room: 'Lobby Portal 1',
          zone: 'Central Academic Core',
        },
        departmentOwner: 'University Libraries',
        criticality: 'Medium',
        status: 'Operational',
        healthScore: 94,
        runtimeHours: 4200,
        failureRisk: { score: 10, level: 'Low', predictedRulDays: 220, anomalyDetected: false },
        recentTelemetrySummary: { temperature: 23.0, vibration: 0.05, powerDrawKw: 0.8, noiseDb: 44.0 },
      },

      // HOSTELS / RESIDENTIAL
      {
        assetCode: 'HST-NORTH-BLR',
        name: 'North Campus Residential Hall Domestic Hot Water Boiler (BLR-2)',
        category: 'Hostel',
        type: 'Commercial Gas Boiler',
        location: {
          building: 'Northgate Student Residence Hall',
          floor: 'Basement',
          room: 'Utility Plant Room N-1',
          zone: 'Residential North',
        },
        departmentOwner: 'Residential Life & Housing Services',
        criticality: 'High',
        status: 'Operational',
        healthScore: 78,
        runtimeHours: 6700,
        vendor: { name: 'Viessmann Manufacturing', contact: 'boilers@viessmann.com', slaHours: 12 },
        failureRisk: { score: 32, level: 'Moderate', predictedRulDays: 52, anomalyDetected: false },
        recentTelemetrySummary: { temperature: 68.0, vibration: 0.18, powerDrawKw: 5.4, noiseDb: 58.0 },
      },
      {
        assetCode: 'HST-SOUTH-ELV',
        name: 'South Quad Residence Hall Passenger Elevator Bank A',
        category: 'Hostel',
        type: 'Traction Elevator',
        location: {
          building: 'South Quad Tower (12 Floors)',
          floor: 'Shaft 1',
          room: 'Elevator Machine Room Level 13',
          zone: 'Residential South',
        },
        departmentOwner: 'Residential Life & Housing Services',
        criticality: 'Critical',
        status: 'Operational',
        healthScore: 86,
        runtimeHours: 8900,
        vendor: { name: 'Otis Elevator Co.', contact: 'dispatch@otis.com', slaHours: 4 },
        failureRisk: { score: 22, level: 'Low', predictedRulDays: 110, anomalyDetected: false },
        recentTelemetrySummary: { temperature: 31.0, vibration: 0.14, powerDrawKw: 11.2, noiseDb: 50.0 },
      },
      {
        assetCode: 'HST-EAST-GEN',
        name: 'East Quad Auxiliary Emergency Diesel Backup Generator (450 kVA)',
        category: 'Hostel',
        type: 'Diesel Generator',
        location: {
          building: 'East Campus Housing Complex',
          floor: 'Ground Exterior',
          room: 'Generator Enclosure E-1',
          zone: 'Residential East',
        },
        departmentOwner: 'Campus Emergency Preparedness',
        criticality: 'Critical',
        status: 'Operational',
        healthScore: 96,
        runtimeHours: 410,
        vendor: { name: 'Cummins Power Generation', contact: 'service@cummins.com', slaHours: 6 },
        failureRisk: { score: 8, level: 'Low', predictedRulDays: 310, anomalyDetected: false },
        recentTelemetrySummary: { temperature: 20.5, vibration: 0.09, powerDrawKw: 0.2, noiseDb: 40.0 },
      },

      // DEVICES
      {
        assetCode: 'DEV-MED-POD',
        name: 'Medical Amphitheater 4K Interactive Digital Surgeon Podium',
        category: 'Device',
        type: 'Digital Teaching Podium',
        location: {
          building: 'Medical Sciences Instructional Center',
          floor: '2nd Floor',
          room: 'Clinical Auditorium 201',
          zone: 'Health Sciences Quad',
        },
        departmentOwner: 'School of Medicine Instructional Tech',
        criticality: 'High',
        status: 'Operational',
        healthScore: 90,
        runtimeHours: 1850,
        failureRisk: { score: 15, level: 'Low', predictedRulDays: 160, anomalyDetected: false },
        recentTelemetrySummary: { temperature: 27.5, vibration: 0.02, powerDrawKw: 0.45, noiseDb: 32.0 },
      },
      {
        assetCode: 'DEV-CS-CART',
        name: 'Robotics Laboratory Mobile Workstation & Sensor Cart #4',
        category: 'Device',
        type: 'Mobile Computing Cart',
        location: {
          building: 'Alan Turing Computer Science Building',
          floor: '4th Floor',
          room: 'Autonomous Systems Lab 412',
          zone: 'Engineering Quad',
        },
        departmentOwner: 'Department of Computer Engineering',
        criticality: 'Medium',
        status: 'Operational',
        healthScore: 84,
        runtimeHours: 2100,
        failureRisk: { score: 25, level: 'Moderate', predictedRulDays: 75, anomalyDetected: false },
        recentTelemetrySummary: { temperature: 29.0, vibration: 0.06, powerDrawKw: 0.65, noiseDb: 35.0 },
      },

      // LEARNING SYSTEMS
      {
        assetCode: 'SYS-HPC-NODE7',
        name: 'Campus High-Performance Computing GPU Node 07 (8x H100)',
        category: 'LearningSystem',
        type: 'HPC AI/Compute Server',
        location: {
          building: 'Enterprise Data Center',
          floor: 'Server Hall 1',
          room: 'Cold Aisle Rack 14',
          zone: 'Central IT Complex',
        },
        departmentOwner: 'University Central IT & Research Computing',
        criticality: 'Critical',
        status: 'Degraded',
        healthScore: 65,
        runtimeHours: 8400,
        vendor: { name: 'Dell Enterprise Technologies', contact: 'hpc-support@dell.com', slaHours: 4 },
        failureRisk: { score: 55, level: 'High', predictedRulDays: 22, anomalyDetected: true },
        recentTelemetrySummary: { temperature: 69.4, vibration: 0.22, powerDrawKw: 9.8, noiseDb: 76.0 },
        notes: 'Running university-wide generative AI research models. Thermal thermal throttling active on GPU slot 3.',
      },
      {
        assetCode: 'SYS-LMS-STREAM',
        name: 'Campus LMS Low-Latency Lecture Capture & Streaming Core (Edge-1)',
        category: 'LearningSystem',
        type: 'Streaming Core Server',
        location: {
          building: 'Enterprise Data Center',
          floor: 'Server Hall 2',
          room: 'Rack 08-B',
          zone: 'Central IT Complex',
        },
        departmentOwner: 'Academic Technology Services',
        criticality: 'Critical',
        status: 'Operational',
        healthScore: 95,
        runtimeHours: 6100,
        failureRisk: { score: 9, level: 'Low', predictedRulDays: 290, anomalyDetected: false },
        recentTelemetrySummary: { temperature: 31.2, vibration: 0.04, powerDrawKw: 1.4, noiseDb: 54.0 },
      },
      {
        assetCode: 'SYS-EXAM-SRV',
        name: 'Central Examination Computer Lab Power Distribution Unit (PDU-3)',
        category: 'LearningSystem',
        type: 'Intelligent PDU',
        location: {
          building: 'Online Testing Center',
          floor: '1st Floor',
          room: 'Power Control Closet 102',
          zone: 'Central Academic Core',
        },
        departmentOwner: 'Registrar & Assessment Office',
        criticality: 'High',
        status: 'Operational',
        healthScore: 89,
        runtimeHours: 4500,
        failureRisk: { score: 16, level: 'Low', predictedRulDays: 175, anomalyDetected: false },
        recentTelemetrySummary: { temperature: 33.1, vibration: 0.03, powerDrawKw: 14.2, noiseDb: 41.0 },
      },
    ];

    const insertedAssets = await Asset.insertMany(assetData);
    console.log(`[Seed] Seeded ${insertedAssets.length} assets across all university domains`);

    // Map inserted assets by code
    const assetMap = {};
    insertedAssets.forEach((a) => {
      assetMap[a.assetCode] = a;
    });

    // 3. Seed Work Orders
    const workOrders = [
      {
        orderCode: 'WO-2026-0091',
        assetId: assetMap['LAB-BIO-302']._id,
        title: 'Emergency Ceramic Spindle Bearing Replacement & Dynamic Balancing',
        description: 'AI model flagged critical high-frequency vibration spike (>0.45 mm/s RMS). Risk of rotor seizure during active bio-research assay runs.',
        type: 'Predictive_AI',
        priority: 'P1-Critical',
        status: 'In_Progress',
        assignedTechnicianId: techUser._id,
        assignedTechnicianName: techUser.name,
        requiredSkill: 'Precision Centrifuge Specialist L3',
        partsRequired: [
          { partCode: 'BRG-CR22-44', name: 'High-Speed Ceramic Spindle Bearing', quantity: 1, isAvailable: true },
        ],
        estimatedDowntimeHours: 4.5,
        actualDowntimeHours: 1.5,
        academicImpact: {
          affectedBuilding: 'Life Sciences Bio-Research Tower',
          affectedCourses: ['BME 602 - Cellular Mechanics', 'CHEM 810 Graduate Thesis Lab'],
          estimatedStudentsImpacted: 24,
          labSuspensionRequired: true,
        },
        scheduledDate: new Date(),
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        checklist: [
          { step: 1, task: 'Disconnect power & apply Lockout/Tagout (LOTO)', isCompleted: true, passFail: 'Pass', notes: 'Breaker panel 3 locked' },
          { step: 2, task: 'Extract rotor spindle assembly and inspect race pitting', isCompleted: true, passFail: 'Pass', meterReading: '0.46 mm/s baseline' },
          { step: 3, task: 'Press new BRG-CR22-44 ceramic bearing into hub', isCompleted: false, passFail: 'Pending', notes: 'Pressing in progress' },
          { step: 4, task: 'Dynamic test run at 20,000 RPM for 15 minutes', isCompleted: false, passFail: 'Pending' },
        ],
        evidence: [
          {
            url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=60',
            caption: 'Bearing casing surface pitting and thermal discoloration on drive spindle',
            type: 'image',
          },
        ],
        createdBy: 'AI Predictive Reliability Engine',
      },
      {
        orderCode: 'WO-2026-0092',
        assetId: assetMap['LIB-MAIN-HVAC']._id,
        title: 'Chilled Water Circulation Pump Mechanical Seal & Impeller Decarbonization',
        description: 'Vibration harmonics show early impeller cavitation. Prevent humidity breaches in rare book archives.',
        type: 'Predictive_AI',
        priority: 'P2-High',
        status: 'Scheduled',
        assignedTechnicianId: techUser._id,
        assignedTechnicianName: techUser.name,
        requiredSkill: 'HVAC Level 3 Specialist',
        partsRequired: [
          { partCode: 'SEAL-GRUND-50', name: 'Silicon Carbide Mechanical Shaft Seal', quantity: 1, isAvailable: true },
        ],
        estimatedDowntimeHours: 3.0,
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        checklist: [
          { step: 1, task: 'Isolate supply and return isolation valves', isCompleted: false, passFail: 'Pending' },
          { step: 2, task: 'Disassemble seal housing and inspect impeller vanes', isCompleted: false, passFail: 'Pending' },
          { step: 3, task: 'Re-torque coupling bolts to 85 Nm', isCompleted: false, passFail: 'Pending' },
        ],
        createdBy: 'Operations Dispatcher',
      },
      {
        orderCode: 'WO-2026-0088',
        assetId: assetMap['SYS-HPC-NODE7']._id,
        title: 'Compute Node GPU Rack Heat-Sink De-Dusting & Thermal Paste Refresh',
        description: 'GPU #3 reaching 69.4°C under sustained deep-learning research workloads.',
        type: 'Preventive',
        priority: 'P2-High',
        status: 'Pending_Verification',
        assignedTechnicianId: techUser._id,
        assignedTechnicianName: techUser.name,
        requiredSkill: 'Data Center Systems Tech',
        estimatedDowntimeHours: 1.5,
        actualDowntimeHours: 1.2,
        startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        checklist: [
          { step: 1, task: 'Migrate active SLURM GPU jobs to Node 08', isCompleted: true, passFail: 'Pass' },
          { step: 2, task: 'Blow clean finned copper heat sink', isCompleted: true, passFail: 'Pass' },
          { step: 3, task: 'Apply thermal paste and reseat PCIe carrier', isCompleted: true, passFail: 'Pass', meterReading: '51.2°C at 100% TDP' },
        ],
        evidence: [
          {
            url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60',
            caption: 'Cleaned heatsink assembly installed and verified under synthetic stress run',
            type: 'image',
          },
        ],
        closureVerification: {
          verifiedBy: 'Devon Bradley',
          verifiedAt: null,
          status: 'Pending',
          verificationNotes: 'Work completed. Awaiting supervisor closure verification signature.',
        },
        createdBy: 'Devon Bradley',
      },
      {
        orderCode: 'WO-2026-0075',
        assetId: assetMap['HST-NORTH-BLR']._id,
        title: 'Quarterly Boiler Burner Combustion Efficiency Tune-up',
        description: 'Routine preventive maintenance: gas pressure adjustment, flame sensor check, flue gas analysis.',
        type: 'Preventive',
        priority: 'P3-Medium',
        status: 'Closed',
        assignedTechnicianName: 'Klaus Lindqvist (Siemens)',
        estimatedDowntimeHours: 2.0,
        actualDowntimeHours: 1.8,
        completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        closureVerification: {
          verifiedBy: 'Dr. Marcus Vance',
          verifiedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
          status: 'Approved',
          verificationNotes: 'Flue gas analysis confirmed 92.4% thermal efficiency. Combustion certificates filed.',
        },
        createdBy: 'Maintenance System Scheduler',
      },
    ];

    await WorkOrder.insertMany(workOrders);
    console.log(`[Seed] Seeded ${workOrders.length} maintenance work orders`);

    // 4. Seed AI Recommendations
    const recommendations = [
      {
        recommendationCode: 'REC-2026-0001',
        assetId: assetMap['LAB-BIO-302']._id,
        recommendationType: 'Bearing_Degradation',
        urgency: 'Immediate',
        title: `${assetMap['LAB-BIO-302'].name}: Immediate Spindle Bearing Replacement Required`,
        suggestedAction: 'Immediately isolate centrifuge rotor spindle and replace high-speed ceramic bearing (BRG-CR22-44).',
        explanation: 'Telemetry exhibits extreme harmonic vibration spikes (0.46 mm/s vs 0.25 mm/s normal baseline). Accelerometer indicates inner race micro-spalling. Catastrophic rotor freeze estimated in 8 days.',
        rulEstimateDays: 8,
        confidence: 0.94,
        contributingFactors: [
          { factor: 'Vibration velocity exceeds ISO 10816 Class II threshold', weight: 52, observedValue: '0.46 mm/s RMS', threshold: '0.25 mm/s' },
          { factor: 'Spindle motor operating temperature delta elevated', weight: 28, observedValue: '38.4°C', threshold: '30.0°C' },
          { factor: 'Continuous high-speed cycle runtime', weight: 20, observedValue: '5,420 hrs', threshold: '4,000 hrs' },
        ],
        requiredSkill: 'Precision Centrifuge Specialist L3 (Bio-Safety Certified)',
        probableParts: [
          { partCode: 'BRG-CR22-44', name: 'High-Speed Ceramic Spindle Bearing', estimatedCost: 480 },
        ],
        expectedDowntimeHours: 4.5,
        academicImpactNote: 'Lab runs NIH grant research experiments on Wednesdays. Servicing must occur prior to tomorrow morning.',
        modelVersion: 'gemini-1.5-flash-rcm-v2.4',
        telemetrySnapshot: {
          temperature: 38.4,
          vibration: 0.46,
          powerDrawKw: 4.8,
          noiseDb: 68.5,
          runtimeHours: 5420,
        },
        status: 'Approved',
        reviewDetails: {
          reviewedBy: 'Devon Bradley',
          reviewerRole: 'OperationsManager',
          reviewedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          actionTaken: 'Approved & Dispatched Work Order WO-2026-0091',
          reason: 'Verified vibration harmonics via spectral dashboard. Immediate repair approved.',
        },
      },
      {
        recommendationCode: 'REC-2026-0002',
        assetId: assetMap['LIB-MAIN-HVAC']._id,
        recommendationType: 'Thermal_Runaway_Risk',
        urgency: 'Within_7_Days',
        title: `${assetMap['LIB-MAIN-HVAC'].name}: Chilled Water Circulation Pump Cavitation Warning`,
        suggestedAction: 'Flush suction strainer, replace worn silicon-carbide mechanical seal, and inspect balance pipe.',
        explanation: 'Thermal sensor delta reached 52.3°C with acoustic cavitation signatures at 69 dB. Chilled water supply to rare archives is operating at degraded efficiency.',
        rulEstimateDays: 14,
        confidence: 0.89,
        contributingFactors: [
          { factor: 'Suction pressure drop leading to impeller vapor bubble cavitation', weight: 45, observedValue: '52.3°C / 69 dB', threshold: '42.0°C / 55 dB' },
          { factor: 'Vibration frequency matches 2X impeller vane-pass speed', weight: 35, observedValue: '0.41 mm/s RMS', threshold: '0.28 mm/s' },
          { factor: 'Seal runtime service age', weight: 20, observedValue: '11,400 hrs', threshold: '10,000 hrs' },
        ],
        requiredSkill: 'Commercial HVAC Grade 3 Specialist',
        probableParts: [
          { partCode: 'SEAL-GRUND-50', name: 'Silicon Carbide Mechanical Shaft Seal', estimatedCost: 260 },
        ],
        expectedDowntimeHours: 3.0,
        academicImpactNote: 'Schedule during weekend library quiet hours (Sunday 6:00 AM - 9:00 AM).',
        modelVersion: 'gemini-1.5-flash-rcm-v2.4',
        telemetrySnapshot: {
          temperature: 52.3,
          vibration: 0.41,
          powerDrawKw: 8.9,
          noiseDb: 69.2,
          runtimeHours: 11400,
        },
        status: 'Pending_Review',
      },
      {
        recommendationCode: 'REC-2026-0003',
        assetId: assetMap['CLS-SCI-204']._id,
        recommendationType: 'Filter_Impedance',
        urgency: 'Within_7_Days',
        title: `${assetMap['CLS-SCI-204'].name}: AHU Fan Blower Motor Imbalance & Filter Restriction`,
        suggestedAction: 'Replace clogged MERV-13 air filter bank and inspect belt tension on supply blower.',
        explanation: 'Static pressure differential has increased by 38%, forcing blower motor to draw excessive power (7.2 kW). Risk of air-handling trip during 300-student chemistry lectures.',
        rulEstimateDays: 19,
        confidence: 0.86,
        contributingFactors: [
          { factor: 'Static pressure differential exceeding clean filter rating', weight: 48, observedValue: '2.4 in. wg', threshold: '1.2 in. wg' },
          { factor: 'Blower motor vibration anomaly', weight: 32, observedValue: '0.38 mm/s', threshold: '0.24 mm/s' },
          { factor: 'Power draw elevated +22% above baseline', weight: 20, observedValue: '7.2 kW', threshold: '5.9 kW' },
        ],
        requiredSkill: 'HVAC Maintenance Technician L2',
        probableParts: [
          { partCode: 'FLT-MERV13-4', name: 'MERV 13 Pleated Filter Pack (Box of 4)', estimatedCost: 115 },
        ],
        expectedDowntimeHours: 2.0,
        academicImpactNote: 'Lecture Hall 204 hosts CHEM 101 Mon-Thu 9:00 AM-11:00 AM. Repair must be done between 7:00 AM and 8:30 AM.',
        modelVersion: 'gemini-1.5-flash-rcm-v2.4',
        telemetrySnapshot: {
          temperature: 44.8,
          vibration: 0.38,
          powerDrawKw: 7.2,
          noiseDb: 64.0,
          runtimeHours: 7890,
        },
        status: 'Pending_Review',
      },
    ];

    await AIRecommendation.insertMany(recommendations);
    console.log(`[Seed] Seeded ${recommendations.length} AI predictive recommendations`);

    // 5. Seed System Settings
    const settings = [
      {
        category: 'AI_CONFIG',
        key: 'GEMINI_ACTIVE_MODEL',
        value: 'gemini-1.5-flash',
        label: 'Gemini AI Model Engine',
        description: 'Active Google Generative AI model for failure prediction & RUL calculations',
      },
      {
        category: 'AI_CONFIG',
        key: 'MIN_CONFIDENCE_THRESHOLD',
        value: 75,
        label: 'Human Review Confidence Cutoff (%)',
        description: 'AI recommendations with confidence below this threshold require mandatory senior supervisor approval',
      },
      {
        category: 'TELEMETRY_THRESHOLDS',
        key: 'VIBRATION_ALERT_THRESHOLD',
        value: 0.35,
        label: 'Global Vibration Alert Threshold (mm/s RMS)',
        description: 'ISO 10816 Class II threshold triggering predictive anomaly alerts',
      },
      {
        category: 'TELEMETRY_THRESHOLDS',
        key: 'TEMPERATURE_ALERT_THRESHOLD',
        value: 55.0,
        label: 'Operating Thermal Alert Threshold (°C)',
        description: 'Equipment operating temperatures exceeding this limit trigger automated alerts',
      },
      {
        category: 'ACADEMIC_CALENDAR',
        key: 'MIDTERM_EXAM_FREEZE',
        value: {
          isActive: true,
          periodName: 'Fall Semester Midterm Examination Period',
          restrictedHours: '08:00 - 18:00',
          affectedZones: ['Central Academic Core', 'West Research Quad', 'Central Library'],
          policy: 'Zero noisy or intrusive maintenance permitted during testing slots.',
        },
        label: 'Academic Examination Quiet Period Freeze',
        description: 'Enforces maintenance quiet windows during university examination weeks',
      },
    ];

    await SystemSetting.insertMany(settings);
    console.log(`[Seed] Seeded ${settings.length} system configuration settings`);

    // 6. Seed Notifications
    const notifications = [
      {
        title: 'Critical Failure Risk: Bio-Research Centrifuge (LAB-BIO-302)',
        message: 'AI Model detected severe spindle vibration anomaly (0.46 mm/s). Estimated RUL is 8 days.',
        type: 'AI_PREDICTION',
        severity: 'Critical',
        targetRole: 'ALL',
        link: '/recommendations',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        title: 'Work Order Dispatched: WO-2026-0091',
        message: 'You have been assigned to replace the ceramic spindle bearing on LAB-BIO-302.',
        type: 'WORK_ORDER',
        severity: 'Critical',
        recipientId: techUser._id,
        targetRole: 'Technician',
        link: '/planning',
        isRead: false,
        createdAt: new Date(Date.now() - 25 * 60 * 1000),
      },
      {
        title: 'Work Order Awaiting Closure Verification: WO-2026-0088',
        message: 'Data center GPU heat-sink servicing completed by Elena Rostova. Supervisor sign-off required.',
        type: 'APPROVAL',
        severity: 'Warning',
        targetRole: 'OperationsManager',
        link: '/planning',
        isRead: false,
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
      },
      {
        title: 'Academic Notice: Fall Midterm Maintenance Freeze Active',
        message: 'Auditoriums and library quiet hours in effect. Heavy drilling/cutting restricted 08:00 - 18:00.',
        type: 'SYSTEM',
        severity: 'Info',
        targetRole: 'ALL',
        link: '/settings',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    await Notification.insertMany(notifications);
    console.log(`[Seed] Seeded ${notifications.length} in-app notifications`);

    // 7. Seed Audit Logs
    const auditLogs = [
      {
        actorName: 'Dr. Marcus Vance',
        actorRole: 'MaintenanceAdmin',
        action: 'LOGIN',
        entityType: 'User',
        reason: 'Administrator authenticated into Campus Facilities Suite',
        outcome: 'SUCCESS',
        ipAddress: '192.168.1.10',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        actorName: 'AI Predictive Engine (Gemini 1.5 Flash)',
        actorRole: 'System',
        action: 'AI_EXECUTION',
        entityType: 'Asset',
        entityName: 'High-Speed Refrigerated Centrifuge (CR22N)',
        reason: 'Automated telemetry health assessment identified critical degradation. RUL: 8 days.',
        outcome: 'SUCCESS',
        ipAddress: '127.0.0.1',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        actorName: 'Devon Bradley',
        actorRole: 'OperationsManager',
        action: 'APPROVE',
        entityType: 'AIRecommendation',
        entityName: 'REC-2026-0001',
        reason: 'Approved AI recommendation and generated high-priority work order WO-2026-0091.',
        previousState: { status: 'Pending_Review' },
        newState: { status: 'Approved', workOrderId: 'WO-2026-0091' },
        outcome: 'SUCCESS',
        ipAddress: '192.168.1.25',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ];

    await AuditLog.insertMany(auditLogs);
    console.log(`[Seed] Seeded ${auditLogs.length} immutable audit trail records`);

    console.log('[Seed] Database successfully seeded with university domain data!');
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err);
    throw err;
  }
};

// Allow running directly via `node src/seed.js`
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    console.log('[Seed] Done. Closing connection.');
    await closeDB();
    process.exit(0);
  })();
}

