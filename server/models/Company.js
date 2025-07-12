const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  industry: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    enum: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise'],
    default: 'Medium'
  },
  questionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', companySchema);