const express = require('express');
const { body, validationResult } = require('express-validator');
const Company = require('../models/Company');
const Question = require('../models/Question');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Get all companies
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (search) {
      query.name = new RegExp(search, 'i');
    }

    const companies = await Company.find(query)
      .sort({ questionCount: -1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Company.countDocuments(query);

    res.json({
      companies,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single company
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new company
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Company name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, logo, website, industry, size } = req.body;

    // Check if company already exists
    const existingCompany = await Company.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existingCompany) {
      return res.status(400).json({ message: 'Company already exists' });
    }

    const company = new Company({
      name,
      description,
      logo,
      website,
      industry,
      size
    });

    await company.save();
    res.status(201).json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update company (any authenticated user can update)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, logo, website, industry, size } = req.body;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { name, description, logo, website, industry, size },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete company (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ message: 'Company deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes
// Get all companies with detailed stats (admin only)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', industry = '' } = req.query;
    
    const query = {};
    if (search) {
      query.name = new RegExp(search, 'i');
    }
    if (industry) {
      query.industry = industry;
    }

    const companies = await Company.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Company.countDocuments(query);

    // Get detailed stats for each company
    const companyStats = await Promise.all(
      companies.map(async (company) => {
        const [totalQuestions, recentQuestions] = await Promise.all([
          Question.countDocuments({ company: company._id }),
          Question.countDocuments({ 
            company: company._id, 
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          })
        ]);

        return {
          ...company.toObject(),
          totalQuestions,
          recentQuestions
        };
      })
    );

    res.json({
      companies: companyStats,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company details with analytics (admin only)
router.get('/admin/:companyId', adminAuth, async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get company questions
    const questions = await Question.find({ company: company._id })
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get detailed stats
    const [totalQuestions, recentQuestions] = await Promise.all([
      Question.countDocuments({ company: company._id }),
      Question.find({ 
        company: company._id,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }).sort({ createdAt: -1 })
    ]);

    // Get question growth over time
    const questionGrowth = await Question.aggregate([
      {
        $match: { company: company._id }
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

    // Get top contributors
    const topContributors = await Question.aggregate([
      {
        $match: { company: company._id }
      },
      {
        $group: {
          _id: '$author',
          questionCount: { $sum: 1 }
        }
      },
      {
        $sort: { questionCount: -1 }
      },
      {
        $limit: 5
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
          questionCount: 1
        }
      }
    ]);

    res.json({
      company,
      questions,
      stats: {
        totalQuestions,
        recentQuestions: recentQuestions.length
      },
      questionGrowth,
      topContributors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;