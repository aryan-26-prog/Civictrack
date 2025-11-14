const express = require('express');
const Issue = require('../models/Issue');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { body, validationResult, query } = require('express-validator');

const router = express.Router();

// All routes in this file require admin authentication
router.use(auth, adminAuth);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    // Basic statistics
    const totalIssues = await Issue.countDocuments();
    const pendingIssues = await Issue.countDocuments({ status: 'pending' });
    const underReviewIssues = await Issue.countDocuments({ status: 'under-review' });
    const inProgressIssues = await Issue.countDocuments({ status: 'in-progress' });
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
    const rejectedIssues = await Issue.countDocuments({ status: 'rejected' });
    
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalCitizens = await User.countDocuments({ role: 'citizen' });

    // Issues by category
    const issuesByCategory = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Issues by status
    const issuesByStatus = await Issue.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Issues by severity
    const issuesBySeverity = await Issue.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent issues (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentIssues = await Issue.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    // Recent users (last 7 days)
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    // Top issues by votes
    const topIssues = await Issue.find()
      .populate('reportedBy', 'name email')
      .sort({ upvotes: -1 })
      .limit(5);

    // Recent activities
    const recentActivities = await Issue.find()
      .populate('reportedBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      statistics: {
        issues: {
          total: totalIssues,
          pending: pendingIssues,
          underReview: underReviewIssues,
          inProgress: inProgressIssues,
          resolved: resolvedIssues,
          rejected: rejectedIssues,
          recent: recentIssues
        },
        users: {
          total: totalUsers,
          admins: totalAdmins,
          citizens: totalCitizens,
          recent: recentUsers
        }
      },
      charts: {
        byCategory: issuesByCategory,
        byStatus: issuesByStatus,
        bySeverity: issuesBySeverity
      },
      topIssues,
      recentActivities
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

// @route   GET /api/admin/issues
// @desc    Get all issues with admin filters
// @access  Private/Admin
router.get('/issues', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'under-review', 'in-progress', 'resolved', 'rejected']),
  query('assignedTo').optional().isMongoId()
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
      limit = 20,
      status,
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email')
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
        totalIssues: total
      }
    });
  } catch (error) {
    console.error('Admin get issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching issues'
    });
  }
});

// @route   PUT /api/admin/issues/:id/assign
// @desc    Assign issue to admin
// @access  Private/Admin
router.put('/issues/:id/assign', [
  body('adminId')
    .isMongoId()
    .withMessage('Valid admin ID is required')
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

    const { adminId } = req.body;

    // Check if admin exists
    const admin = await User.findOne({ _id: adminId, role: 'admin' });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo: adminId,
        status: 'under-review'
      },
      { new: true }
    )
    .populate('reportedBy', 'name email')
    .populate('assignedTo', 'name email');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.params.id).emit('issue-assigned', issue);
    io.emit('issues-updated');

    res.json({
      success: true,
      message: 'Issue assigned successfully',
      issue
    });
  } catch (error) {
    console.error('Assign issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning issue'
    });
  }
});

// @route   PUT /api/admin/issues/:id/status
// @desc    Update issue status
// @access  Private/Admin
router.put('/issues/:id/status', [
  body('status')
    .isIn(['pending', 'under-review', 'in-progress', 'resolved', 'rejected'])
    .withMessage('Valid status is required'),
  body('resolutionNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Resolution notes cannot exceed 500 characters')
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

    const { status, resolutionNotes } = req.body;
    const updateData = { status };

    if (resolutionNotes) {
      updateData.resolutionNotes = resolutionNotes;
    }

    if (status === 'resolved') {
      updateData.actualResolutionTime = new Date();
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('reportedBy', 'name email')
    .populate('assignedTo', 'name email');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.params.id).emit('issue-status-updated', issue);
    io.emit('issues-updated');

    res.json({
      success: true,
      message: 'Issue status updated successfully',
      issue
    });
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating issue status'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isIn(['citizen', 'admin']),
  query('isActive').optional().isBoolean()
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
      limit = 20,
      role,
      isActive
    } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put('/users/:id/role', [
  body('role')
    .isIn(['citizen', 'admin'])
    .withMessage('Role must be either "citizen" or "admin"')
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

    const { role } = req.body;

    // Prevent self-role change
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user role'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user active status
// @access  Private/Admin
router.put('/users/:id/status', [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean')
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

    const { isActive } = req.body;

    // Prevent self-deactivation
    if (req.params.id === req.user.id && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status'
    });
  }
});

// @route   DELETE /api/admin/issues/:id
// @desc    Delete issue (admin only)
// @access  Private/Admin
router.delete('/issues/:id', async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('issue-deleted', { id: req.params.id });
    io.emit('issues-updated');

    res.json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting issue'
    });
  }
});

module.exports = router;