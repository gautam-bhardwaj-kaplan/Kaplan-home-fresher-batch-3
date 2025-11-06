const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const result = schema.parse(req[property]);
      req[property] = result;
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid request data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        }
      });
    }
  };
};

module.exports = { validateRequest };