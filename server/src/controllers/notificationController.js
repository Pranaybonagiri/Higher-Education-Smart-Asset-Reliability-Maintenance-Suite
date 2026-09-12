import { Notification } from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const { type, severity, isRead, limit = 50 } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?._id;

    const query = {
      $or: [
        { targetRole: 'ALL' },
        { targetRole: userRole },
        { recipientId: userId },
      ],
    };

    if (type && type !== 'All') {
      query.type = type;
    }
    if (severity && severity !== 'All') {
      query.severity = severity;
    }
    if (isRead !== undefined && isRead !== 'All') {
      query.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false,
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    res.json({ success: true, data: notif });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?._id;

    await Notification.updateMany(
      {
        $or: [{ targetRole: 'ALL' }, { targetRole: userRole }, { recipientId: userId }],
        isRead: false,
      },
      { isRead: true }
    );

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const clearNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification removed.' });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

