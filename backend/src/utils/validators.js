// backend/src/utils/validators.js
const { body } = require('express-validator');
const Web3 = require('web3');

const web3 = new Web3();

// Custom validators
const validators = {
  // Ethereum address validator
  isEthAddress: (value) => {
    if (!web3.utils.isAddress(value)) {
      throw new Error('Invalid Ethereum address');
    }
    return true;
  },

  // Positive number validator
  isPositiveNumber: (value) => {
    if (isNaN(value) || parseFloat(value) <= 0) {
      throw new Error('Must be a positive number');
    }
    return true;
  },

  // Future date validator
  isFutureDate: (value) => {
    const date = new Date(value);
    const now = new Date();
    if (date <= now) {
      throw new Error('Date must be in the future');
    }
    return true;
  },

  // URL validator with protocol
  isUrlWithProtocol: (value) => {
    try {
      new URL(value);
      return true;
    } catch (error) {
      throw new Error('Invalid URL. Must include protocol (http:// or https://)');
    }
  },

  // Hex color validator
  isHexColor: (value) => {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(value)) {
      throw new Error('Invalid hex color code');
    }
    return true;
  },

  // Phone number validator (basic)
  isPhoneNumber: (value) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      throw new Error('Invalid phone number');
    }
    return true;
  },

  // Strong password validator
  isStrongPassword: (value) => {
    if (value.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(value)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(value)) {
      throw new Error('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(value)) {
      throw new Error('Password must contain at least one number');
    }
    if (!/[@$!%*?&]/.test(value)) {
      throw new Error('Password must contain at least one special character (@$!%*?&)');
    }
    return true;
  },

  // Username validator
  isUsername: (value) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(value)) {
      throw new Error('Username must be 3-30 characters and can only contain letters, numbers, and underscores');
    }
    return true;
  },

  // Array minimum length validator
  minArrayLength: (min) => (value) => {
    if (!Array.isArray(value)) {
      throw new Error('Must be an array');
    }
    if (value.length < min) {
      throw new Error(`Must contain at least ${min} item(s)`);
    }
    return true;
  },

  // Array maximum length validator
  maxArrayLength: (max) => (value) => {
    if (!Array.isArray(value)) {
      throw new Error('Must be an array');
    }
    if (value.length > max) {
      throw new Error(`Cannot contain more than ${max} item(s)`);
    }
    return true;
  },

  // JSON string validator
  isJSONString: (value) => {
    try {
      JSON.parse(value);
      return true;
    } catch (error) {
      throw new Error('Invalid JSON string');
    }
  },

  // File size validator
  maxFileSize: (maxSizeMB) => (value) => {
    if (value && value.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`File size must be less than ${maxSizeMB}MB`);
    }
    return true;
  },

  // File type validator
  allowedFileTypes: (allowedTypes) => (value) => {
    if (value && !allowedTypes.includes(value.mimetype)) {
      throw new Error(`File type must be one of: ${allowedTypes.join(', ')}`);
    }
    return true;
  },

  // Date range validator
  isDateRangeValid: (startField, endField) => (value, { req }) => {
    const startDate = new Date(req.body[startField]);
    const endDate = new Date(req.body[endField]);
    
    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }
    return true;
  },

  // Unique array values validator
  hasUniqueValues: (value) => {
    if (!Array.isArray(value)) {
      throw new Error('Must be an array');
    }
    const uniqueValues = new Set(value);
    if (uniqueValues.size !== value.length) {
      throw new Error('Array must contain unique values');
    }
    return true;
  },

  // Minimum value validator
  minValue: (min) => (value) => {
    if (parseFloat(value) < min) {
      throw new Error(`Value must be at least ${min}`);
    }
    return true;
  },

  // Maximum value validator
  maxValue: (max) => (value) => {
    if (parseFloat(value) > max) {
      throw new Error(`Value cannot exceed ${max}`);
    }
    return true;
  },

  // Percentage validator
  isPercentage: (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 100) {
      throw new Error('Must be a valid percentage between 0 and 100');
    }
    return true;
  },

  // Rating validator
  isRating: (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 1 || num > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    return true;
  },

  // Coordinate validator
  isCoordinate: (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < -180 || num > 180) {
      throw new Error('Coordinate must be between -180 and 180');
    }
    return true;
  },

  // Validate wallet signature
  validateSignature: async (walletAddress, signature, message) => {
    try {
      const recoveredAddress = web3.eth.accounts.recover(message, signature);
      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      return false;
    }
  }
};

// Express validator middleware creators
const createValidator = (fieldName, validatorFn, customMessage = null) => {
  return body(fieldName).custom((value, { req }) => {
    try {
      const result = validatorFn(value, req);
      if (result === true || result === undefined) {
        return true;
      }
      throw new Error(customMessage || 'Validation failed');
    } catch (error) {
      throw new Error(customMessage || error.message);
    }
  });
};

module.exports = {
  ...validators,
  createValidator
};
