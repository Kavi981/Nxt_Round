const express = require('express');
const Activity = require('../models/Activity');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Track activity (middleware function)
const trackActivity = (action, target, targetId = null, targetModel = null) => {
  return async (req, res, next) => {
    try {
      if (req.user) {
        const activity = new Activity({
          user: req.user.id,
          action,
          target,
          targetId,
          targetModel,
          details: req.body.details || '',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
        await activity.save();
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
    next();
  };
};

// Get recent activities (admin only)
router.get('/admin/recent', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, action = '', target = '' } = req.query;
    
    const query = {};
    if (action) query.action = action;
    if (target) query.target = target;

    const activities = await Activity.find(query)
      .populate('user', 'name email')
      .populate('targetId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Activity.countDocuments(query);

    res.json({
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get activity statistics (admin only)
router.get('/admin/stats', adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Activity by action type
    const actionStats = await Activity.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Activity by target type
    const targetStats = await Activity.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: '$target',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Daily activity
    const dailyActivity = await Activity.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Top active users
    const topUsers = await Activity.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          count: 1
        }
      }
    ]);

    res.json({
      actionStats,
      targetStats,
      dailyActivity,
      topUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user activity (admin only)
router.get('/admin/user/:userId', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const activities = await Activity.find({ user: req.params.userId })
      .populate('targetId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Activity.countDocuments({ user: req.params.userId });

    res.json({
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = { router, trackActivity }; 