const validateRequest = (schemas) => {
  return async (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
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
