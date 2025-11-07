const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Admin access required',
      },
    });
  }
  next();
};

module.exports = {
  isAdmin,
};
