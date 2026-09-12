import { Asset } from '../models/Asset.js';
import { WorkOrder } from '../models/WorkOrder.js';
import { AIRecommendation } from '../models/AIRecommendation.js';
import { recordAudit } from '../middleware/audit.js';

// In-memory simulated generated reports log
const generatedReports = [
  {
    id: 'RPT-2026-001',
    title: 'Q1 Comprehensive Campus Asset Reliability & RCM Audit',
    type: 'Comprehensive Reliability',
    format: 'PDF',
    generatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    generatedBy: 'Maintenance Administrator',
    recordCount: 18,
    fileSize: '2.4 MB',
  },
  {
    id: 'RPT-2026-002',
    title: 'Research Laboratory & Cleanroom Downtime Risk Analysis',
    type: 'Laboratory Risk',
    format: 'CSV',
    generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    generatedBy: 'Operations Manager',
    recordCount: 42,
    fileSize: '410 KB',
  },
];

export const getAnalyticsSummary = async (req, res) => {
  try {
    const totalAssets = await Asset.countDocuments();
    const openOrders = await WorkOrder.countDocuments({ status: { $in: ['Scheduled', 'In_Progress'] } });
    const criticalAssets = await Asset.countDocuments({ healthScore: { $lt: 50 } });

    // Monthly MTBF (Mean Time Between Failures) and MTTR (Mean Time to Repair) in hours
    const reliabilityTrends = [
      { month: 'Jan', mtbfHours: 420, mttrHours: 4.8, downtimeHours: 32, costUsd: 4200 },
      { month: 'Feb', mtbfHours: 460, mttrHours: 4.2, downtimeHours: 28, costUsd: 3850 },
      { month: 'Mar', mtbfHours: 495, mttrHours: 3.9, downtimeHours: 24, costUsd: 3100 },
      { month: 'Apr', mtbfHours: 540, mttrHours: 3.5, downtimeHours: 19, costUsd: 2900 },
      { month: 'May', mtbfHours: 580, mttrHours: 3.1, downtimeHours: 16, costUsd: 2400 },
      { month: 'Jun', mtbfHours: 610, mttrHours: 2.8, downtimeHours: 12, costUsd: 2150 },
    ];

    // Downtime impact breakdown across University Faculties
    const departmentImpact = [
      { department: 'School of Chemical Sciences', scheduledDowntime: 14, unscheduledDowntime: 2, affectedLectureHours: 0, avoidedCost: 18500 },
      { department: 'Department of Computer Engineering', scheduledDowntime: 8, unscheduledDowntime: 0, affectedLectureHours: 0, avoidedCost: 24000 },
      { department: 'Residential Services (Hostels)', scheduledDowntime: 18, unscheduledDowntime: 4, affectedLectureHours: 0, avoidedCost: 12400 },
      { department: 'Central Library & Media Center', scheduledDowntime: 6, unscheduledDowntime: 1, affectedLectureHours: 2, avoidedCost: 6200 },
      { department: 'School of Medicine & Bio-Labs', scheduledDowntime: 12, unscheduledDowntime: 1, affectedLectureHours: 0, avoidedCost: 32000 },
    ];

    // Predictive vs Reactive Cost Comparison
    const maintenanceCostSplit = [
      { name: 'AI Predictive Servicing (Avoided Failure)', value: 68, cost: 42500, color: '#10b981' },
      { name: 'Scheduled Preventive Checkups', value: 24, cost: 16800, color: '#6366f1' },
      { name: 'Emergency Reactive Repairs', value: 8, cost: 8900, color: '#ef4444' },
    ];

    res.json({
      success: true,
      data: {
        kpis: {
          totalAssets,
          openOrders,
          criticalAssets,
          overallAvailabilityPercent: 99.4,
          annualAvoidedDowntimeHours: 148,
          totalCostSavingsUsd: 93100,
        },
        reliabilityTrends,
        departmentImpact,
        maintenanceCostSplit,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const exportReport = async (req, res) => {
  try {
    const { format = 'csv', reportType = 'AssetHealth', dateRange = 'Last30Days' } = req.body;

    const assets = await Asset.find().limit(50);
    const reportId = `RPT-2026-${String(generatedReports.length + 1).padStart(3, '0')}`;

    if (format === 'csv') {
      // Build CSV
      const headers = 'AssetCode,Name,Category,Building,Room,Criticality,HealthScore,Status,RuntimeHours,FailureRisk\n';
      const rows = assets
        .map(
          (a) =>
            `"${a.assetCode}","${a.name}","${a.category}","${a.location?.building}","${a.location?.room}","${a.criticality}",${a.healthScore},"${a.status}",${a.runtimeHours},${a.failureRisk?.score || 0}`
        )
        .join('\n');

      const csvContent = headers + rows;

      generatedReports.unshift({
        id: reportId,
        title: `${reportType} Export (${dateRange})`,
        type: reportType,
        format: 'CSV',
        generatedAt: new Date(),
        generatedBy: req.user?.name || 'Administrator',
        recordCount: assets.length,
        fileSize: `${Math.round(csvContent.length / 1024)} KB`,
      });

      await recordAudit({
        req,
        action: 'EXPORT_REPORT',
        entityType: 'Report',
        entityId: reportId,
        entityName: `${reportType} (CSV)`,
        reason: `Generated CSV export for ${assets.length} campus asset records`,
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportId}.csv"`);
      return res.send(csvContent);
    }

    // PDF / JSON Printable structured representation
    const newReport = {
      id: reportId,
      title: `${reportType} Executive Summary`,
      type: reportType,
      format: 'PDF',
      generatedAt: new Date(),
      generatedBy: req.user?.name || 'Administrator',
      recordCount: assets.length,
      fileSize: '1.8 MB',
      summary: {
        totalAssets: assets.length,
        criticalCount: assets.filter((a) => a.healthScore < 50).length,
        optimalCount: assets.filter((a) => a.healthScore >= 80).length,
        exportTimestamp: new Date().toISOString(),
      },
    };

    generatedReports.unshift(newReport);

    await recordAudit({
      req,
      action: 'EXPORT_REPORT',
      entityType: 'Report',
      entityId: reportId,
      entityName: `${reportType} (PDF)`,
      reason: `Generated formatted PDF report snapshot for ${reportType}`,
    });

    res.json({
      success: true,
      data: newReport,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const getReportHistory = async (req, res) => {
  res.json({
    success: true,
    data: generatedReports,
  });
};

