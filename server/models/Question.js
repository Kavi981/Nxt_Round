const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    default: ''
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  roundType: {
    type: String,
    required: true,
    enum: ['Aptitude', 'Coding', 'HR', 'System Design', 'Technical', 'Behavioral']
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  downvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  viewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reportCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
questionSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Question', questionSchema);