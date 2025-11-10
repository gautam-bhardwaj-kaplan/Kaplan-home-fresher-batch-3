const validateRequest = (schemas) => {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid request data',
          details: error.errors || [{ message: error.message }],
        },
      });
    }
  };
};

module.exports = {
  validateRequest,
};
