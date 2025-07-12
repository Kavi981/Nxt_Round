const express = require('express');
const User = require('../models/User');
const Company = require('../models/Company');
const Question = require('../models/Question');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get platform statistics
router.get('/', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalCompanies = await Company.countDocuments();

    res.json({
      totalUsers,
      totalQuestions,
      totalCompanies,
      totalExperiences: totalQuestions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// Admin overview stats
router.get('/overview', adminAuth, async (req, res) => {
  try {
    const [totalUsers, totalCompanies, totalQuestions, recentUsers, recentQuestions] = await Promise.all([
      User.countDocuments(),
      Company.countDocuments(),
      Question.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      Question.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
    ]);

    // Get top companies by question count
    const topCompanies = await Company.aggregate([
      {
        $lookup: {
          from: 'questions',
          localField: '_id',
          foreignField: 'company',
          as: 'questions'
        }
      },
      {
        $project: {
          name: 1,
          industry: 1,
          questionCount: { $size: '$questions' }
        }
      },
      {
        $sort: { questionCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get user activity stats
    const activeUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.json({ 
      totalUsers, 
      totalCompanies, 
      totalQuestions, 
      recentUsers,
      recentQuestions,
      topCompanies,
      activeUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get detailed analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // User growth over time
    const userGrowth = await User.aggregate([
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

    // Question growth over time
    const questionGrowth = await Question.aggregate([
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

    // Company performance
    const companyStats = await Company.aggregate([
      {
        $lookup: {
          from: 'questions',
          localField: '_id',
          foreignField: 'company',
          as: 'questions'
        }
      },
      {
        $project: {
          name: 1,
          industry: 1,
          questionCount: { $size: '$questions' }
        }
      },
      {
        $sort: { questionCount: -1 }
      }
    ]);

    // User activity by role
    const userActivity = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          recent: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', startDate] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.json({
      userGrowth,
      questionGrowth,
      companyStats,
      userActivity
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;