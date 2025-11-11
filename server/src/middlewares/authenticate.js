const jwt = require('jsonwebtoken');
const { handleError } = require('../utils/handleErrors');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return handleError(
        res,
        new Error('Authentication token is required'),
        'Authentication token is required',
        401
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch (error) {
    return handleError(res, error, 'Invalid or expired token', 401);
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return handleError(
      res,
      new Error('Admin access required'),
      'Admin access required',
      403
    );
  }
  next();
};

module.exports = { authenticate, isAdmin };