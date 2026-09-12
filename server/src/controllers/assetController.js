import { Asset } from '../models/Asset.js';
import { Telemetry } from '../models/Telemetry.js';
import { WorkOrder } from '../models/WorkOrder.js';
import { recordAudit } from '../middleware/audit.js';

export const getAssets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      category,
      criticality,
      status,
      building,
      sortBy = 'healthScore',
      sortOrder = 'asc',
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { assetCode: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { departmentOwner: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (criticality && criticality !== 'All') {
      query.criticality = criticality;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (building && building !== 'All') {
      query['location.building'] = building;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Asset.countDocuments(query);
    const assets = await Asset.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        assets,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const getAssetStats = async (req, res) => {
  try {
    const total = await Asset.countDocuments();
    const healthy = await Asset.countDocuments({ healthScore: { $gte: 80 } });
    const warning = await Asset.countDocuments({ healthScore: { $gte: 50, $lt: 80 } });
    const critical = await Asset.countDocuments({ healthScore: { $lt: 50 } });
    const offline = await Asset.countDocuments({ status: 'Offline' });
    const inMaintenance = await Asset.countDocuments({ status: 'In_Maintenance' });
    const anomalies = await Asset.countDocuments({ 'failureRisk.anomalyDetected': true });

    // Category distribution
    const categories = await Asset.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, avgHealth: { $avg: '$healthScore' } } },
    ]);

    res.json({
      success: true,
      data: {
        total,
        healthy,
        warning,
        critical,
        offline,
        inMaintenance,
        anomalies,
        healthyPercent: total ? Math.round((healthy / total) * 100) : 0,
        warningPercent: total ? Math.round((warning / total) * 100) : 0,
        criticalPercent: total ? Math.round((critical / total) * 100) : 0,
        categoryBreakdown: categories.map((c) => ({
          category: c._id,
          count: c.count,
          avgHealth: Math.round(c.avgHealth),
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, error: { message: 'Asset not found' } });
    }

    // Get open and recent work orders for this asset
    const workOrders = await WorkOrder.find({ assetId: asset._id }).sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      data: {
        asset,
        workOrders,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const getAssetTelemetry = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, error: { message: 'Asset not found' } });
    }

    let telemetry = await Telemetry.find({ assetId: asset._id }).sort({ timestamp: 1 }).limit(100);

    // If no telemetry stored yet, generate realistic time series
    if (telemetry.length === 0) {
      const now = Date.now();
      const generated = [];
      const baseTemp = asset.recentTelemetrySummary?.temperature || 24;
      const baseVib = asset.recentTelemetrySummary?.vibration || 0.15;
      const basePower = asset.recentTelemetrySummary?.powerDrawKw || 3.0;

      for (let i = 40; i >= 0; i--) {
        const time = new Date(now - i * 15 * 60 * 1000); // 15-minute intervals
        const noise = (Math.random() - 0.5) * 0.1;
        const tempNoise = (Math.random() - 0.5) * 2;
        const vib = Math.max(0.05, parseFloat((baseVib + (i < 8 ? 0.25 : 0) + noise).toFixed(3)));
        const temp = parseFloat((baseTemp + (i < 8 ? 12 : 0) + tempNoise).toFixed(1));
        const pwr = parseFloat((basePower + (i < 8 ? 1.5 : 0) + noise * 5).toFixed(2));
        const noiseLvl = parseFloat((45 + (vib > 0.3 ? 25 : 5) + Math.random() * 5).toFixed(1));

        generated.push({
          assetId: asset._id,
          timestamp: time,
          temperature: temp,
          vibration: vib,
          powerDrawKw: pwr,
          noiseDb: noiseLvl,
          isAnomaly: vib > 0.35 || temp > 50,
          rawStatus: vib > 0.35 ? 'WARNING_VIBRATION' : 'NORMAL',
        });
      }
      await Telemetry.insertMany(generated);
      telemetry = generated;
    }

    res.json({
      success: true,
      data: {
        assetId: asset._id,
        readings: telemetry,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const createAsset = async (req, res) => {
  try {
    const asset = await Asset.create(req.body);

    await recordAudit({
      req,
      action: 'CREATE',
      entityType: 'Asset',
      entityId: asset._id,
      entityName: asset.name,
      reason: `Registered new campus asset ${asset.assetCode} under ${asset.category}`,
      newState: asset.toObject(),
    });

    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
};

export const updateAsset = async (req, res) => {
  try {
    const previous = await Asset.findById(req.params.id);
    if (!previous) {
      return res.status(404).json({ success: false, error: { message: 'Asset not found' } });
    }

    const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    await recordAudit({
      req,
      action: 'UPDATE',
      entityType: 'Asset',
      entityId: updated._id,
      entityName: updated.name,
      reason: req.body.updateReason || 'Updated asset specifications or status',
      previousState: previous.toObject(),
      newState: updated.toObject(),
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
};

