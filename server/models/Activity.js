const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['login', 'register', 'post_question', 'edit_question', 'delete_question', 'bookmark_question', 'view_question', 'admin_approve', 'admin_reject', 'admin_delete']
  },
  target: {
    type: String,
    enum: ['question', 'company', 'user', 'system'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel'
  },
  targetModel: {
    type: String,
    enum: ['Question', 'Company', 'User'],
    required: function() {
      return this.targetId != null;
    }
  },
  details: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient querying
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ action: 1, createdAt: -1 });
activitySchema.index({ target: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema); 