const express = require('express');
const User = require('../models/User');
const Question = require('../models/Question');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('bookmarks', 'title company role roundType createdAt');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, avatar },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's questions
router.get('/questions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const questions = await Question.find({ author: req.user.id })
      .populate('company', 'name logo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Question.countDocuments({ author: req.user.id });

    res.json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bookmark question
router.post('/bookmark/:questionId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const questionId = req.params.questionId;

    // Check if already bookmarked
    const isBookmarked = user.bookmarks.includes(questionId);

    if (isBookmarked) {
      // Remove bookmark
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== questionId);
    } else {
      // Add bookmark
      user.bookmarks.push(questionId);
    }

    await user.save();

    res.json({ 
      message: isBookmarked ? 'Bookmark removed' : 'Question bookmarked',
      isBookmarked: !isBookmarked
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bookmarked questions
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(req.user.id);
    const bookmarkIds = user.bookmarks.slice((page - 1) * limit, page * limit);

    const questions = await Question.find({ _id: { $in: bookmarkIds } })
      .populate('company', 'name logo')
      .populate('author', 'name');

    res.json({
      questions,
      totalPages: Math.ceil(user.bookmarks.length / limit),
      currentPage: page,
      total: user.bookmarks.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes
// Get all users (admin only)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Get user activity stats
    const userStats = await Promise.all(
      users.map(async (user) => {
        const questionCount = await Question.countDocuments({ author: user._id });
        
        return {
          ...user.toObject(),
          questionCount
        };
      })
    );

    res.json({
      users: userStats,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user details with activity (admin only)
router.get('/admin/:userId', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's questions
    const questions = await Question.find({ author: user._id })
      .populate('company', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user activity stats
    const [totalQuestions, recentActivity] = await Promise.all([
      Question.countDocuments({ author: user._id }),
      Question.find({ author: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('company', 'name')
    ]);

    res.json({
      user,
      questions,
      stats: {
        totalQuestions,
        bookmarksCount: user.bookmarks.length
      },
      recentActivity
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role (admin only)
router.put('/admin/:userId/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/admin/:userId', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's questions
    await Question.deleteMany({ author: user._id });
    
    // Delete user
    await User.findByIdAndDelete(req.params.userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;