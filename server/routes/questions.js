const express = require('express');
const { body, validationResult } = require('express-validator');
const Question = require('../models/Question');
const Company = require('../models/Company');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Get all questions with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      company, 
      role, 
      roundType, 
      difficulty, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Apply filters
    if (company) query.company = company;
    if (role) query.role = new RegExp(role, 'i');
    if (roundType) query.roundType = roundType;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const questions = await Question.find(query)
      .populate('company', 'name logo')
      .populate('author', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Question.countDocuments(query);

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

// Get single question
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('company', 'name logo description')
      .populate('author', 'name');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Unique view logic
    let isNewViewer = false;
    if (req.user && req.user.id) {
      const userId = req.user.id;
      if (!question.viewers.map(v => v.toString()).includes(userId)) {
        question.views += 1;
        question.viewers.push(userId);
        isNewViewer = true;
        await question.save();
      }
    } else {
      // For guests, fallback to incrementing every time (or implement session/IP logic if needed)
      question.views += 1;
      await question.save();
    }

    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new question
router.post('/', [
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('company').notEmpty().withMessage('Company is required'),
  body('role').notEmpty().withMessage('Role is required'),
  body('roundType').notEmpty().withMessage('Round type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, answer, company, role, roundType, tags, difficulty } = req.body;

    const question = new Question({
      title,
      content,
      answer,
      company,
      role,
      roundType,
      tags: tags || [],
      difficulty: difficulty || 'Medium',
      author: req.user.id
    });

    await question.save();

    // Update company question count
    await Company.findByIdAndUpdate(company, { $inc: { questionCount: 1 } });

    const populatedQuestion = await Question.findById(question._id)
      .populate('company', 'name logo')
      .populate('author', 'name');

    res.status(201).json(populatedQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update question
router.put('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user owns the question or is admin
    if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, answer, tags, difficulty } = req.body;

    question.title = title || question.title;
    question.content = content || question.content;
    question.answer = answer !== undefined ? answer : question.answer;
    question.tags = tags || question.tags;
    question.difficulty = difficulty || question.difficulty;

    await question.save();

    const updatedQuestion = await Question.findById(question._id)
      .populate('company', 'name logo')
      .populate('author', 'name');

    res.json(updatedQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete question
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user owns the question or is admin
    if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Question.findByIdAndDelete(req.params.id);

    // Update company question count
    await Company.findByIdAndUpdate(question.company, { $inc: { questionCount: -1 } });

    res.json({ message: 'Question deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on question
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const userId = req.user.id;

    // Remove existing votes
    question.upvotes = question.upvotes.filter(vote => vote.user.toString() !== userId);
    question.downvotes = question.downvotes.filter(vote => vote.user.toString() !== userId);

    // Add new vote
    if (voteType === 'upvote') {
      question.upvotes.push({ user: userId });
    } else if (voteType === 'downvote') {
      question.downvotes.push({ user: userId });
    }

    await question.save();

    res.json({
      upvotes: question.upvotes.length,
      downvotes: question.downvotes.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;