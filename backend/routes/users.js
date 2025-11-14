const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Issue = require('../models/Issue');
const auth = require('../middleware/auth');
const { body, validationResult, query } = require('express-validator');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Please enter a valid 10-digit phone number'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street address cannot exceed 200 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City name cannot exceed 50 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State name cannot exceed 50 characters'),
  body('address.pincode')
    .optional()
    .matches(/^[0-9]{6}$/)
    .withMessage('Please enter a valid 6-digit pincode')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const allowedUpdates = ['name', 'phone', 'address'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalIssues = await Issue.countDocuments({ reportedBy: userId });
    const pendingIssues = await Issue.countDocuments({ 
      reportedBy: userId, 
      status: 'pending' 
    });
    const inProgressIssues = await Issue.countDocuments({ 
      reportedBy: userId, 
      status: { $in: ['under-review', 'in-progress'] } 
    });
    const resolvedIssues = await Issue.countDocuments({ 
      reportedBy: userId, 
      status: 'resolved' 
    });

    // Recent activity (last 5 issues)
    const recentIssues = await Issue.find({ reportedBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt');

    // Issues by category
    const issuesByCategory = await Issue.aggregate([
      { $match: { reportedBy: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalIssues,
        pendingIssues,
        inProgressIssues,
        resolvedIssues,
        issuesByCategory,
        recentIssues
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics'
    });
  }
});

// @route   GET /api/users/issues
// @desc    Get user's issues with advanced filtering
// @access  Private
router.get('/issues', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isIn(['pending', 'under-review', 'in-progress', 'resolved', 'rejected']),
  query('category').optional().isIn(['pothole', 'streetlight', 'garbage', 'water', 'sewage', 'traffic', 'parks', 'other']),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'upvotes', 'priority']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      status,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { reportedBy: req.user.id };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name email avatar')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Issue.countDocuments(filter);

    res.json({
      success: true,
      issues,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalIssues: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user issues'
    });
  }
});

module.exports = router;