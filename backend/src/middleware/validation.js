// backend/src/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');
const Web3 = require('web3');

// Initialize Web3
const web3 = new Web3();

// Common validation chains
const authValidation = {
  register: [
    body('wallet_address')
      .notEmpty().withMessage('Wallet address is required')
      .custom((value) => {
        if (!web3.utils.isAddress(value)) {
          throw new Error('Invalid Ethereum address');
        }
        return true;
      }),
    body('username')
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),
    body('email')
      .optional()
      .isEmail().withMessage('Invalid email address'),
    body('signature')
      .notEmpty().withMessage('Signature is required')
  ],

  login: [
    body('wallet_address')
      .notEmpty().withMessage('Wallet address is required')
      .custom((value) => {
        if (!web3.utils.isAddress(value)) {
          throw new Error('Invalid Ethereum address');
        }
        return true;
      }),
    body('signature')
      .notEmpty().withMessage('Signature is required')
  ]
};

const businessValidation = {
  create: [
    body('name')
      .notEmpty().withMessage('Business name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Business name must be between 2 and 100 characters'),
    body('category')
      .notEmpty().withMessage('Category is required')
      .isIn(['retail', 'service', 'tech', 'food', 'entertainment', 'other']).withMessage('Invalid category'),
    body('description')
      .optional()
      .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    body('wallet_address')
      .notEmpty().withMessage('Business wallet address is required')
      .custom((value) => {
        if (!web3.utils.isAddress(value)) {
          throw new Error('Invalid Ethereum address');
        }
        return true;
      })
  ],

  update: [
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 }).withMessage('Business name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    body('category')
      .optional()
      .isIn(['retail', 'service', 'tech', 'food', 'entertainment', 'other']).withMessage('Invalid category')
  ]
};

const campaignValidation = {
  create: [
    body('title')
      .notEmpty().withMessage('Campaign title is required')
      .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
    body('description')
      .notEmpty().withMessage('Description is required')
      .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
    body('reward')
      .notEmpty().withMessage('Reward is required')
      .isFloat({ min: 0.01 }).withMessage('Reward must be at least 0.01'),
    body('max_participants')
      .optional()
      .isInt({ min: 1, max: 10000 }).withMessage('Max participants must be between 1 and 10000'),
    body('end_date')
      .notEmpty().withMessage('End date is required')
      .isISO8601().withMessage('Invalid date format')
      .custom((value) => {
        const endDate = new Date(value);
        const now = new Date();
        if (endDate <= now) {
          throw new Error('End date must be in the future');
        }
        if (endDate > new Date(now.setFullYear(now.getFullYear() + 1))) {
          throw new Error('End date cannot be more than 1 year in the future');
        }
        return true;
      })
  ]
};

const missionValidation = {
  create: [
    body('campaign_id')
      .notEmpty().withMessage('Campaign ID is required')
      .isUUID().withMessage('Invalid Campaign ID'),
    body('title')
      .notEmpty().withMessage('Mission title is required')
      .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('description')
      .notEmpty().withMessage('Description is required')
      .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    body('steps')
      .isArray({ min: 1, max: 10 }).withMessage('Steps must be an array with 1-10 items'),
    body('steps.*.title')
      .notEmpty().withMessage('Step title is required'),
    body('steps.*.description')
      .notEmpty().withMessage('Step description is required'),
    body('reward')
      .notEmpty().withMessage('Reward is required')
      .isFloat({ min: 0.01 }).withMessage('Reward must be at least 0.01')
  ]
};

const userValidation = {
  updateProfile: [
    body('username')
      .optional()
      .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),
    body('email')
      .optional()
      .isEmail().withMessage('Invalid email address'),
    body('avatar_url')
      .optional()
      .isURL().withMessage('Invalid URL for avatar'),
    body('bio')
      .optional()
      .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
  ]
};

// Query parameter validations
const queryValidation = {
  pagination: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
      .toInt(),
    query('offset')
      .optional()
      .isInt({ min: 0 }).withMessage('Offset must be a positive integer')
      .toInt(),
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer')
      .toInt()
  ],

  dateRange: [
    query('start_date')
      .optional()
      .isISO8601().withMessage('Invalid start date format'),
    query('end_date')
      .optional()
      .isISO8601().withMessage('Invalid end date format')
      .custom((endDate, { req }) => {
        if (req.query.start_date && endDate <= req.query.start_date) {
          throw new Error('End date must be after start date');
        }
        return true;
      })
  ]
};

// Wallet address validation
const validateWalletAddress = (paramName = 'wallet_address') => {
  return param(paramName)
    .notEmpty().withMessage('Wallet address is required')
    .custom((value) => {
      if (!web3.utils.isAddress(value)) {
        throw new Error('Invalid Ethereum address');
      }
      return true;
    });
};

// UUID validation
const validateUUID = (paramName = 'id') => {
  return param(paramName)
    .notEmpty().withMessage('ID is required')
    .isUUID().withMessage('Invalid ID format');
};

// Main validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }));

    res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: formattedErrors
    });
  };
};

// File upload validation
const validateFileUpload = (fieldName, maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
  return (req, res, next) => {
    if (!req.file) {
      return next();
    }

    const file = req.file;

    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: `File size exceeds ${maxSizeMB}MB limit`
      });
    }

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  authValidation,
  businessValidation,
  campaignValidation,
  missionValidation,
  userValidation,
  queryValidation,
  validateWalletAddress,
  validateUUID,
  validate,
  validateFileUpload
};
